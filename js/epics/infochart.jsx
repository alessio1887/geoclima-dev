/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { setControlProperty } from '../../MapStore2/web/client/actions/controls';
import { TOGGLE_MAPINFO_STATE, changeMapInfoState, toggleMapInfoState } from '../../MapStore2/web/client/actions/mapInfo';
import {
    TOGGLE_INFOCHART,
    FETCH_INFOCHART_DATA,
    CHECK_FETCH_AVAILABLE_DATES,
    fetchedInfoChartData,
    setInfoChartVisibility,
    fetchInfoChartData,
    setRangeManager,
    changeFromData,
    changeToData,
    changeFixedRangeToData,
    changePeriod,
    markInfoChartAsNotLoaded,
    changeTab, changeChartVariable
} from '../actions/infochart';
import { fetchSelectDate } from '../actions/updateDatesParams';
import { CLICK_ON_MAP } from '../../MapStore2/web/client/actions/map';
import { LOADING } from '@mapstore/actions/maps';
import API from '../api/GeoClimaApi';
import { FIXED_RANGE, FREE_RANGE, isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import defaultConfig from '../../configs/pluginsConfig.json';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

// Function to retrieve the corresponding idTab based on the variable
const getIdTabFromVariable = (variable, tabList) => {
    // Iterate through each tab in the tabList
    for (const tab of tabList) {
        // Check if the variable exists in any group of the tab
        for (const group of tab.groupList) {
            if (group.id === variable) {
                return tab.id; // Return the idTab if variable matches
            }
        }
    }
    // default value
    return tabList[0].id;
};

const getVariableParamsFromTab = (idTab, idVariable, tabList) => {
    const variableList = tabList.find( tab => tab.id === idTab);
    return variableList.groupList.find(variable =>
        variable.id === idVariable
    );
};

const checkSelectDateEpic = (action$, store) =>
    action$.ofType(CHECK_FETCH_AVAILABLE_DATES)
        .switchMap((action) => {
            const appState = store.getState();
            if (!appState.fixedrangepicker?.isPluginLoaded && !appState.freerangepicker?.isPluginLoaded) {
                return Observable.of(fetchSelectDate(action.variableSelectDate, action.urlSelectDate));
            }
            return Observable.empty();
        });

const getVisibleGroups = (groupMS2List = []) => {
    if (!Array.isArray(groupMS2List)) {
        return [];
    }
    return groupMS2List
        .filter(group => group.visibility)
        .flatMap(group => group.nodes);
};

const getVisibleLayers = (layers) => {
    const infoChartConfig = defaultConfig.plugins.find(plugin => plugin.name === "InfoChart");
    return layers
        .filter(layer => layer.visibility && isVariabiliMeteoLayer(layer.name, infoChartConfig?.defaultConfig?.variabiliMeteo));
};

// Function to get default values
const getDefaultValues = (idVariabiliLayers, appState) => {
    const toData = appState.infochart.lastAvailableDate;
    const fromData = moment(toData).subtract(1, 'month').toDate();
    const defaultVariable = Object.keys(idVariabiliLayers)[0] || '';
    return {
        variable: Object.keys(idVariabiliLayers)[0] || '',
        fromData,
        toData,
        periodType: "1",
        idTab: getIdTabFromVariable(defaultVariable, appState.infochart.tabList)
    };
};

// Function to get values when the InfoChart panel is visible
const getInfoChartValues = (appState, rangeManager) => {
    const { variables, fromData, toData, periodType,  idTab} = appState.infochart.infoChartData;
    const periodTypeAdjusted = rangeManager === FIXED_RANGE ? periodType : "1";
    return {
        variable: variables,
        fromData,
        toData,
        periodType: periodTypeAdjusted,
        idTab: idTab
    };
};

/**
 * This method returns the first visible layer from an array of layers,
 * considering visibility defined either as an independent layer ID
 * or within a group of layers with a visibility property.
 *
 * @param  {Array} layers - An array of layer objects, each containing various properties,
 *                           including `id`, `visibility`, and `name`.
 * @param  {Array} [groups=[]] - An optional array of groups. Each group can be:
 *   - A string representing the ID of an independent layer (standalone).
 *   - An object with `nodes` (array of layer IDs) and `visibility` (boolean).
 * @return {Object|null} - The first visible layer object, or `null` if no visible layer is found.
 */
const getFirstVisibleLayer = (layers, groups = []) => {
    if (!Array.isArray(layers)) {
        return null;
    }
    // Copy and reverse the array to start checking the last layers first, then iterate through them
    const reversedLayers = [...layers].reverse();
    for (const layer of reversedLayers) {
        let groupOfLayer = null;
        let standaloneVisibleLayer = false;

        for (const group of groups) {
            if (typeof group === 'string' && group === layer.id) {
                // If the layer is a standalone ID (not part of any group)
                standaloneVisibleLayer = true;
                break;
            } else if (typeof group !== 'string') {
                // If the layer is part of a group, check if it's among the group's nodes
                for (const nodeId of group.nodes) {
                    if (layer.id === nodeId) {
                        groupOfLayer = group;
                        break;
                    }
                }
            }
        }
        if (standaloneVisibleLayer || (groupOfLayer && groupOfLayer.visibility)) {
            return layer;
        }
    }
    return null;  // If no visible layer is found, return null
};


/**
 * Determines the appropriate variable key based on the visible map layer ID.
 *
 * This function sets `chartVariable` to the corresponding key in `idVariabiliLayers` based on
 * a match with the `visibleLayer`. If no match is found, it defaults to the first key in
 * `idVariabiliLayers`.
 *
 * @param {string} visibleLayer - The name of the visible layer, which will be checked for a match.
 * @param {Object} idVariabiliLayers - An object mapping variable keys to associated layer names (arrays).
 * @returns {string} - The matched variable key from `idVariabiliLayers` or the default key if no match is found.
 */
const setVisVariable = (visibleLayer, idVariabiliLayers) => {
    // Default to the first key in idVariabiliLayers if no match is found
    let chartVariable = Object.keys(idVariabiliLayers)[0];

    const transformedVisibleIdLayer = visibleLayer.replace(/[_\s]/g, '').toLowerCase();

    // Iterate over idVariabiliLayers to find a matching key
    for (const [key, variabiliNames] of Object.entries(idVariabiliLayers)) {
        const transformedVariabiliNames = variabiliNames.map(name =>
            name.replace(/[_\s]/g, '').toLowerCase()
        );

        // Check if any name in the list matches the visible layer
        if (transformedVariabiliNames.some(name => name === transformedVisibleIdLayer)) {
            chartVariable = key;
            break; // Exit loop once a match is found
        }
    }
    // Return the matched key or default
    return chartVariable;
};

// Function to get values from a visible layer
const getVisibleLayerValues = (visibleLayer, appState) => {
    const idVariabiliLayers = appState.infochart.idVariabiliLayers;
    const variable = setVisVariable(visibleLayer.name, idVariabiliLayers);
    const fromData = visibleLayer.params?.fromData || getDefaultValues(idVariabiliLayers, appState).fromData;
    const toData = visibleLayer.params?.toData || getDefaultValues(idVariabiliLayers, appState).toData;
    const periodType = appState.fixedrangepicker?.showFixedRangePicker
        ? appState.fixedrangepicker?.periodType
        : "1";
    // Dynamically determine idTab based on the variable using the tabList from appState
    const idTab = getIdTabFromVariable(variable, appState.infochart.tabList); // Use the function to get idTab
    return {
        variable,
        fromData,
        toData,
        periodType,
        idTab // Added idTab
    };
};

/**
 * Calculates and returns the variables needed for configuring the InfoChart panel.
 *
 * @param {Object} appState - The global state of the application.
 * @param {Object|null} visibleLayer - The currently selected visible layer, or `null` if none are available.
 * @param {string} rangeManager - The type of range manager (e.g., FIXED_RANGE or FREE_RANGE).
 * @param {Object} idVariabiliLayers - An object mapping layer IDs to their respective variables.
 * @returns {Object} - An object containing:
 *   - `variable` (string): The selected variable.
 *   - `fromData` (string): The start date for the data range.
 *   - `toData` (string): The end date for the data range.
 *   - `periodType` (string): The type of period used for the data range.
 *   - 'idTab' (string): chart's type
 */
const getChartVariables = (appState, rangeManager, idVariabiliLayers) => {
    // If the InfoChart panel is visible, use data from appState
    if (appState.infochart.showInfoChartPanel) {
        return getInfoChartValues(appState, rangeManager);
    }
    // If there is a visible layer, use the layer's values
    const visibleLayer = getFirstVisibleLayer(getVisibleLayers(appState.layers.flat), getVisibleGroups(appState.layers.groups));
    if (visibleLayer) {
        return getVisibleLayerValues(visibleLayer, appState);
    }
    // Otherwise, return the default values
    return getDefaultValues(idVariabiliLayers, appState);
};


const closeInfoChartPanel = (action$, store) =>
    action$.ofType(LOADING).switchMap(() => {
        const storeState = store.getState();
        if (storeState?.infochart?.isPluginLoaded) {
            return Observable.of(
                setControlProperty("chartinfo", "enabled", false),
                setInfoChartVisibility(false, []),
                changeMapInfoState(true),
                markInfoChartAsNotLoaded()
            );
        }
        return Observable.empty();
    });

const toggleMapInfoEpic = (action$, store) =>
    action$.ofType(TOGGLE_MAPINFO_STATE).switchMap(() => {
        const storeState = store.getState();
        if (storeState.controls.chartinfo) {
            const chartInfoEnabled = store.getState().controls.chartinfo.enabled;
            const mapInfoEnabled = store.getState().mapInfo.enabled;
            if (chartInfoEnabled && !mapInfoEnabled) {
                return Observable.of(
                    changeMapInfoState(false),
                    setInfoChartVisibility(false),
                    setControlProperty("chartinfo", "enabled", true)
                );
            } else if (!chartInfoEnabled && !mapInfoEnabled) {
                return Observable.of(
                    changeMapInfoState(false),
                    setInfoChartVisibility(false),
                    setControlProperty("chartinfo", "enabled", false)
                );
            }
            return Observable.of(
                changeMapInfoState(true),
                setInfoChartVisibility(false),
                setControlProperty("chartinfo", "enabled", false)
            );
        }
        return Observable.empty();
    });

const toggleInfoChartEpic = (action$, store) =>
    action$.ofType(TOGGLE_INFOCHART).switchMap((action) => {
        const mapInfoEnabled = store.getState().mapInfo.enabled;
        if (mapInfoEnabled) {
            return Observable.of(
                setControlProperty("chartinfo", "enabled", action.enable),
                toggleMapInfoState()
            );
        }
        return Observable.of(
            setControlProperty("chartinfo", "enabled", action.enable),
            setInfoChartVisibility(false),
            toggleMapInfoState()
        );
    });
/**
 * Redux-Observable epic that listens for the CLICK_ON_MAP action and handles updating
 * the InfoChart panel state and fetching its data.
 *
 * @param {Observable} action$ - The stream of Redux actions.
 * @param {Object} store - The Redux store instance, used to access the current application state.
 * @returns {Observable} - Emits a sequence of Redux actions to update the InfoChart panel state.
 */
const clickedPointCheckEpic = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .switchMap((action) => {
            const appState = store.getState();
            if (appState.controls?.chartinfo?.enabled) {
                const idVariabiliLayers = appState.infochart.idVariabiliLayers;

                const rangeManager = appState.fixedrangepicker?.showFixedRangePicker ? FIXED_RANGE : FREE_RANGE;
                const { variable, fromData, toData, periodType, idTab } = getChartVariables(
                    appState,
                    rangeManager,
                    idVariabiliLayers
                );
                let actions = [];
                if (!appState.infochart.showInfoChartPanel) {
                    actions.push(setRangeManager(rangeManager));
                    actions.push(changePeriod(periodType));
                    actions.push(changeFixedRangeToData(new Date(toData)));
                    actions.push(changeFromData(new Date(fromData)));
                    actions.push(changeToData(new Date(toData)));
                    actions.push(changeTab(idTab));
                    actions.push(changeChartVariable(idTab,
                        [getVariableParamsFromTab(idTab, variable, appState.infochart.tabList)]));
                }
                actions.push(setInfoChartVisibility(true));
                actions.push(fetchInfoChartData({
                    latlng: action.point.latlng,
                    toData: moment(toData).format('YYYY-MM-DD'),
                    fromData: moment(fromData).format('YYYY-MM-DD'),
                    variables: variable,
                    periodType: periodType,
                    idTab: idTab
                }));
                return Observable.of(...actions);
            }
            return Observable.empty();
        });


/**
 * Epic that listens for the "FETCH_INFOCHART_DATA" action to fetch infochart data from an API
 * and dispatches the resulting data.
 *
 * When the "FETCH_INFOCHART_DATA" action is triggered, this Epic retrieves data
 * from the API and, once received, emits the `fetchedInfoChartData` action with the obtained data.
 *
 * @param  {external:Observable} action$ - Stream of actions that emits the "FETCH_INFOCHART_DATA" action.
 * @param  {object} store - The Redux store to access the current state, including `infochart.infoChartData`.
 * @memberof epics.infochart
 * @return {external:Observable} - Stream of actions that emits the `fetchedInfoChartData` action with the infochart data.
 */
const loadInfoChartDataEpic = (action$, store) =>
    action$.ofType(FETCH_INFOCHART_DATA)
        .switchMap(() => Observable.fromPromise(
            API.geoclimachart(store.getState().infochart.infoChartData, store.getState().infochart.defaultUrlGeoclimaChart)
                .then(res => res.data)
        ))
        .switchMap(data => Observable.of(fetchedInfoChartData(data, false)));

export {
    toggleMapInfoEpic,
    toggleInfoChartEpic,
    clickedPointCheckEpic,
    loadInfoChartDataEpic,
    closeInfoChartPanel,
    checkSelectDateEpic
};

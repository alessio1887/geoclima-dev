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
    fetchedInfoChartData,
    setInfoChartVisibility,
    fetchInfoChartData,
    setRangeManager,
    changeFromData,
    changeToData,
    changeFixedRangeToData,
    changePeriod
} from '../actions/infochart';
import { CLICK_ON_MAP } from '../../MapStore2/web/client/actions/map';
import { LOADING } from '@mapstore/actions/maps';
import API from '../api/GeoClimaApi';
import { FIXED_RANGE, FREE_RANGE, isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import defaultConfig from '../../configs/pluginsConfig.json';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

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
 * a match with the `visibleIdLayer`. If no match is found, it defaults to the first key in
 * `idVariabiliLayers`.
 *
 * @param {string} visibleIdLayer - The ID of the visible layer, which will be checked for a match.
 * @param {Object} idVariabiliLayers - An object mapping variable keys to associated layer names (arrays).
 * @returns {string} - The matched variable key from `idVariabiliLayers` or the default key if no match is found.
 */
const setVisVariable = (visibleIdLayer, idVariabiliLayers) => {
    // Default to the first key in idVariabiliLayers if no match is found
    let chartVariable = Object.keys(idVariabiliLayers)[0];

    const transformedVisibleIdLayer = visibleIdLayer.replace(/[_\s]/g, '').toLowerCase();

    // Iterate over idVariabiliLayers to find a matching key
    for (const [key, variabiliNames] of Object.entries(idVariabiliLayers)) {
        const transformedVariabiliNames = variabiliNames.map(name =>
            name.replace(/[_\s]/g, '').toLowerCase()
        );

        // Check if any name in the list matches the visible layer
        if (transformedVariabiliNames.some(name => transformedVisibleIdLayer.includes(name))) {
            chartVariable = key;
            break; // Exit loop once a match is found
        }
    }
    // Return the matched key or default
    return chartVariable;
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
 */
const getChartVariables = (appState, visibleLayer, rangeManager, idVariabiliLayers) => {
    let variable = Object.keys(idVariabiliLayers)[0] || '';
    let toData = appState.infochart.lastAvailableData;
    let fromData = moment(toData).subtract(1, 'month').toDate();
    let periodType = "1";

    if (appState.infochart.showInfoChartPanel) {
        variable = appState.infochart.infoChartData.variable;
        fromData = appState.infochart.infoChartData.fromData;
        toData = appState.infochart.infoChartData.toData;
        periodType = rangeManager === FIXED_RANGE
            ? appState.infochart.infoChartData.periodType
            : "1";
    } else if (visibleLayer && !appState.infochart.showInfoChartPanel) {
        variable = setVisVariable(visibleLayer.id, idVariabiliLayers);
        fromData = visibleLayer.params?.fromData || fromData;
        toData = visibleLayer.params?.toData || toData;
        periodType = appState.fixedrangepicker?.showFixedRangePicker
            ? appState.fixedrangepicker?.periodType
            : "1";
    }
    return { variable, fromData, toData, periodType };
};


const closeInfoChartPanel = (action$) =>
    action$.ofType(LOADING).switchMap(() => {
        return Observable.of(
            setControlProperty("chartinfo", "enabled", false),
            setInfoChartVisibility(false, []),
            changeMapInfoState(true)
        );
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
            const chartInfoEnabled = appState.controls?.chartinfo?.enabled;

            if (chartInfoEnabled) {
                const idVariabiliLayers = appState.infochart.idVariabiliLayers;
                const visibleLayer = getFirstVisibleLayer(getVisibleLayers(appState.layers.flat), getVisibleGroups(appState.layers.groups));

                const rangeManager = appState.fixedrangepicker?.showFixedRangePicker ? FIXED_RANGE : FREE_RANGE;
                const { variable, fromData, toData, periodType } = getChartVariables(
                    appState,
                    visibleLayer,
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
                }
                actions.push(setInfoChartVisibility(true));
                actions.push(fetchInfoChartData({
                    latlng: action.point.latlng,
                    toData: moment(toData).format('YYYY-MM-DD'),
                    fromData: moment(fromData).format('YYYY-MM-DD'),
                    variable,
                    periodType
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
    closeInfoChartPanel
};

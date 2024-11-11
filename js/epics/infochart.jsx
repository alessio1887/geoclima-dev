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
    fetchInfoChartData
} from '../actions/infochart';
import { CLICK_ON_MAP } from '../../MapStore2/web/client/actions/map';
import { LOADING } from '@mapstore/actions/maps';
import API from '../api/GeoClimaApi';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import moment from 'moment';

/**
 * Show the infochart
 * @param  {external:Observable} action$ triggers on "FETCH_INFOCHART_DATA"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.infochart
 * @return {external:Observable} the stream of actions to trigger to fetch InfoChartData.
 */


const getVisibleGroup = (groups) => {
    return groups
        .map(group => group.nodes.filter(node => node.visibility === true))
        .flat();
};

const getVisibleLayers = (layers) => {
    return layers
        .filter(layer => layer.visibility && isVariabiliMeteoLayer(layer.name)) // Use isVariabiliMeteoLayer to check
        .map(layer => layer.id);
};
/**
 * The setVisVariable method does the following:
 *
 * 1) Initialization of the chartVariable
 * It initializes the chartVariable by setting a default value (the first ID from variabiliChartList).
 *
 * 2) Find the visible layer
 * It then loops through visibleGroup and searches for the first node that is present in visibleLayers.
 * If a visible layer is found, the loop breaks, and the method proceeds with the found layer.
 *
 * 3) If no visible layer is found:
 * It returns the default chartVariable.
 *
 * 4) Transformation and comparison:
 * It removes spaces and underscores from the visible layer string (visibleIdLayer).
 * It compares this transformed version with the variables in variabiliMeteo.
 * For each variable in variabiliMeteo, it removes spaces and underscores from the names and checks for a match.
 *
 * 5) Filter and find corresponding chart variables:
 * If a match is found, it filters variabiliChartList to find the elements whose name matches the selected variable.
 *
 * 6) If there are matches:
 * If there is only one match, it assigns the chart variable ID to chartVariable.
 * If there are multiple matches, it looks for the best match and sets chartVariable.
 *
 * 7) Return the result:
 * It returns the selected chart variable ID (chartVariable).
 *
 * Note: Tested and working when the 'mutually exclusive' option is enabled in Mapstore2.
 */
const setVisVariable = (visibleLayers, visibleGroup, variabiliMeteo, variabiliChartList) => {
    // Default to the first ID in variabiliChartList in case no match is found
    let chartVariable = variabiliChartList[0].id;
    let visibleIdLayer = null;
    // Find the first visible layer
    for (const group of visibleGroup) {
        for (const node of group.nodes) {
            if (visibleLayers.includes(node)) {
                visibleIdLayer = node;
                break; // Exit the loop once the first visible layer is found
            }
        }
        if (visibleIdLayer) break; // Exit the outer loop if a layer is found
    }
    if (!visibleIdLayer) return chartVariable; // Return default if no visible layer is found
    const transformedVisibleIdLayer = visibleIdLayer.replace(/[_\s]/g, '').toLowerCase();
    // Find the matching variable info chart based on visibleIdLayer
    let variabileVisibleInfoChart = null;
    for (const [key, variabiliNames] of Object.entries(variabiliMeteo)) {
        const transformedVariabiliNames = variabiliNames.map(name =>
            name.replace(/[_\s]/g, '').toLowerCase()
        );
        const transformedKey = key.replace(/[_\s]/g, '').toLowerCase();
        if (transformedVariabiliNames.some(name => transformedVisibleIdLayer.includes(name))) {
            variabileVisibleInfoChart = variabiliChartList.filter(elemento =>
                elemento.name.replace(/[_\s]/g, '').toLowerCase().includes(transformedKey)
            );
            break;
        }
    }
    if (!variabileVisibleInfoChart || variabileVisibleInfoChart.length === 0) {
        return chartVariable; // Return default if no matching variable is found
    }
    if (variabileVisibleInfoChart.length === 1) {
        chartVariable = variabileVisibleInfoChart[0].id;
    } else if (variabileVisibleInfoChart.length > 1) {
        for (const variabileChart of variabileVisibleInfoChart) {
            if (transformedVisibleIdLayer.includes(variabileChart.name.replace(/[_\s]/g, '').toLowerCase())) {
                chartVariable = variabileChart.id;
                break; // Exit once the match is found
            }
        }
    }
    return chartVariable; // Return the final selected chart variable
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

const clickedPointCheckEpic = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .switchMap((action) => {
            const appState = store.getState();
            const layerVisibles = getVisibleLayers(appState.layers.flat);
            const gropuVisibles = getVisibleGroup(appState.layers.groups);
            const visVariable = setVisVariable(layerVisibles, gropuVisibles, appState.localConfig.variabiliMeteoInfoChart, appState.localConfig.variabiliChartList);

            let fromData = {};
            let toData = {};
            let variable = '';
            let periodType = '';

            if (appState.infochart.showInfoChartPanel) {
                ({ toData, fromData, variable, periodType } = appState.infochart.infoChartData);
            } else {
                ({ toData, fromData,  periodType } = appState.fixedrangepicker);
                variable = visVariable;
            }

            const chartInfoEnabled = appState.controls.chartinfo.enabled;
            if (chartInfoEnabled) {
                return Observable.of(
                    setInfoChartVisibility(true),
                    fetchInfoChartData({
                        latlng: action.point.latlng,
                        toData: moment(toData).format('YYYY-MM-DD'),
                        fromData: moment(fromData).format('YYYY-MM-DD'),
                        variable,
                        periodType
                    })
                );
            }
            return Observable.empty();
        });

const loadInfoChartDataEpic = (action$, store) =>
    action$.ofType(FETCH_INFOCHART_DATA)
        .switchMap(() => Observable.fromPromise(
            API.geoclimachart(store.getState().infochart.infoChartData)
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

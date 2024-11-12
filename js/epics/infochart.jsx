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
 * Determines the appropriate variable key based on visible map layers.
 *
 * This method checks if any visible layers (from `visibleLayers` and `visibleGroup`)
 * match the entries in the `idVariabiliLayers` object. If a match is found, it sets
 * `chartVariable` to the corresponding key in `idVariabiliLayers`. If no visible layer
 * matches any entry in `idVariabiliLayers`, it defaults to the first key.
 *
 * @param {Array} visibleLayers - List of currently visible layer IDs.
 * @param {Array} visibleGroup - Nested structure with visible layer groups and nodes.
 * @param {Object} idVariabiliLayers - Object mapping variable keys to their associated layer names.
 * @returns {string} - The matched variable key or the default key.
 */
const setVisVariable = (visibleLayers, visibleGroup, idVariabiliLayers) => {
    // Default to the first key in idVariabiliLayers if no match is found
    let chartVariable = Object.keys(idVariabiliLayers)[0];
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

    // Return default if no visible layer is found
    if (!visibleIdLayer) return chartVariable;

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
            const visVariable = setVisVariable(layerVisibles, gropuVisibles, appState.localConfig.idVariabiliLayers);

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

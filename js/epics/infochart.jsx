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
import { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import moment from 'moment';

const getVisibleGroup = (groups) => {
    return groups
        .map(group => group.nodes.filter(node => node.visibility === true))
        .flat();
};

const getVisibleLayers = (layers) => {
    return layers
        .filter(layer => layer.visibility && isVariabiliMeteoLayer(layer.name));
};

/**
 * Function that finds the first visible layer from a list of layers based on the visible group data.
 * It checks each group to see if any of its nodes (layer IDs) match an existing layer in the layers array.
 * Once the first visible layer is found, it returns the corresponding layer object.
 *
 * @param  {Array} layers - Array of layer objects, each containing various properties, including `id`.
 * @param  {Array} visibleGroup - Array of group objects, each containing a `nodes` property (an array of layer IDs).
 * @return {Object|null} - The first visible layer object from the layers array, or `null` if no visible layer is found.
 */
const getVisibleLayer = (layers, visibleGroup) => {
    let visibleLayer = null;
    const idLayers = layers.map(layer => layer.id);
    // Find the first visible layer
    for (const group of visibleGroup) {
        for (const node of group.nodes) {
            if (idLayers.includes(node)) {
                visibleLayer = node;
                break; // Exit the loop once the first visible layer is found
            }
        }
        if (visibleLayer) break; // Exit the outer loop if a layer is found
    }
    return layers.find(layer => layer.id === visibleLayer);
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
            // Initialize default variables for date range and variable selection
            let fromData = FROM_DATA;
            let toData = TO_DATA;
            let variable = '';
            let periodType = "1";

            const appState = store.getState();
            const idVariabiliLayers = appState.localConfig?.idVariabiliLayers || {};

            // Get the visible layer and group based on the current app state
            const visibleLayer = getVisibleLayer(getVisibleLayers(appState.layers.flat), getVisibleGroup(appState.layers.groups));

            if (visibleLayer) {
                variable = setVisVariable(visibleLayer.id, idVariabiliLayers);
                fromData = visibleLayer.params?.fromData || FROM_DATA;
                toData = visibleLayer.params?.toData || TO_DATA;
            } else {
                // Case where no layers or groups are selected on the map
                variable = Object.keys(idVariabiliLayers)[0] || ''; // Use the first variable or an empty string as fallback
            }

            // Check if the chart information control is enabled
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

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { MAP_CONFIG_LOADED } from '@mapstore/actions/config';
import { LAYER_LOAD, updateSettings, updateNode } from '@mapstore/actions/layers';
import { layersSelector } from '@mapstore/selectors/layers';
import { FETCHED_AVAILABLE_DATES,  updateDatesLayer, errorLayerNotFound, errorLayerDateMissing  } from '../actions/updateDatesParams';
import { TOGGLE_PLUGIN, changePeriod, changePeriodToData } from '../actions/fixedrangepicker';
import { changeFromData, changeToData  } from '../actions/freerangepicker';
import DateAPI from '../utils/ManageDateUtils';
import { getVisibleLayers, FIXED_RANGE, FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const COMBINED_DATE_MAPCONFIG = 'COMBINED_DATE_MAPCONFIG';

const updateLayersParams = (layers, defaultPeriod, toData, timeUnit, isMapfilenameNotChange, isCheckPrefixes, variabiliMeteo) => {
    const actionsUpdateParams = [];
    const toDataFormatted = moment(toData).format(timeUnit);
    const fromDataFormatted = moment(toData).clone().subtract(defaultPeriod.max, 'days').format(timeUnit);
    const year = moment(toData).format("YYYY");

    for (const layer of layers) {
        if (layer.params?.map && isVariabiliMeteoLayer(layer.name, variabiliMeteo)) {
            const name = layer?.name || "";

            // === 1. Caso: layer con nome che inizia con uno dei prefissi ===
            if (isCheckPrefixes) {
                const nameBase = name.replace(/_\d{4}-\d{2}-\d{2}$/, "");
                const updatedName = `${nameBase}_${toDataFormatted}`;
                const updatedTitle = `${layer.title?.split("–")[0].trim()} – ${toDataFormatted}`;

                const originalMap = layer.params?.map || "";
                const updatedMap = originalMap
                    .replace(/wms_\d{4}/, `wms_${year}`)
                    .replace(/\d{4}-\d{2}-\d{2}/, toDataFormatted);

                actionsUpdateParams.push(updateNode(layer.id, "layer", {
                    title: updatedTitle,
                    name: updatedName,
                    description: updatedTitle,
                    params: {
                        // LAYERS: `${updatedName}`,
                        map: updatedMap
                    }
                }));

                continue; // evita di applicare anche la logica sotto
            }

            // === 2. Caso: layer con params.map (logica originale)
            const mapFileName = !isMapfilenameNotChange
                ? DateAPI.getMapfilenameFromSuffix(layer.params.map, defaultPeriod.key)
                : layer.params.map;

            const newParams = {
                params: {
                    map: mapFileName,
                    fromData: fromDataFormatted,
                    toData: toDataFormatted
                }
            };

            actionsUpdateParams.push(updateSettings({
                id: layer.id,
                options: newParams.params
            }));

            actionsUpdateParams.push(updateNode(layer.id, "layers", newParams));
        }
    }

    return actionsUpdateParams;
};

/**
 * Epic that listens for the COMBINED_DATE_MAPCONFIG action and updates layer parameters
 * based on the selected date range.
 *
 * It first checks if either the fixed range picker or the free range picker plugin is loaded.
 * If so, it extracts the layers from the map configuration and retrieves the selected date
 * and time unit from the action payload.
 *
 * Then, it generates update actions for the layers' parameters.
 */
const updateParamsByDateRangeEpic = (action$, store) =>
    action$.ofType(COMBINED_DATE_MAPCONFIG)
        .filter(() => {
            const appState = store.getState();
            return appState.fixedrangepicker?.isPluginLoaded || appState.freerangepicker?.isPluginLoaded;
        })
        .switchMap((action) => {
            const appState = store.getState();
            const isMapfilenameNotChange = appState.fixedrangepicker?.isPluginLoaded && appState.fixedrangepicker?.showOneDatePicker;
            const layers = action.payload.config?.map?.layers || [];
            const toData = action.payload.availableDate;
            const timeUnit = action.payload.timeUnit;
            const defaultPeriod = action.payload.defaultPeriod;
            const isCheckPrefixes = appState.fixedrangepicker.checkPrefixes;
            const variabiliMeteo = appState.fixedrangepicker.variabiliMeteo;
            const actionsUpdateParams = updateLayersParams(layers, defaultPeriod, toData, timeUnit, isMapfilenameNotChange, isCheckPrefixes, variabiliMeteo);
            return Observable.of(...actionsUpdateParams);
        });

/**
 * Epic that combines two action streams:
 * 1. FETCHED_AVAILABLE_DATES: emitted when available dates are fetched.
 * 2. MAP_CONFIG_LOADED: emitted when a map configuration is loaded.
 *
 * Each time a FETCHED_AVAILABLE_DATES action is received, it is combined with
 * the latest MAP_CONFIG_LOADED action. If no MAP_CONFIG_LOADED action has been emitted yet,
 * FETCHED_AVAILABLE_DATES will not produce any output until a map configuration is available.
 *
 * Once combined, the epic emits a new action of type `COMBINED_DATE_MAPCONFIG`,
 * containing both the available date (`availableDateAction.dataFine`) and the map configuration (`mapConfigAction.config`).
 */
const combinedDateMapConfigEpic = (action$) => {
    const mapConfigLoaded$ = action$.ofType(MAP_CONFIG_LOADED);

    return action$.ofType(FETCHED_AVAILABLE_DATES)
        .withLatestFrom(mapConfigLoaded$) // Ogni FETCHED_AVAILABLE_DATES viene combinato con l'ultimo MAP_CONFIG_LOADED
        .map(([availableDateAction, mapConfigAction]) => ({
            type: COMBINED_DATE_MAPCONFIG,
            payload: {
                availableDate: availableDateAction.dataFine,
                config: mapConfigAction.config,
                timeUnit: availableDateAction.timeUnit,
                defaultPeriod: availableDateAction.defaultPeriod
            }
        }));
};

/**
 * Sets the plugin dates on their first launch, based on the data received from the FETCHED_AVAILABLE_DATES action.
 */
const setPluginsDatesOnInitEpic = (action$, store) =>
    action$.ofType(FETCHED_AVAILABLE_DATES)
        .switchMap((action) => {
            const appState = store.getState();
            let actionsSetPluginsDates = [];
            if (appState.fixedrangepicker?.isPluginLoaded ) {
                actionsSetPluginsDates.push(changePeriodToData(action.dataFine));
            }
            if (appState.freerangepicker?.isPluginLoaded) {
                const fromData = moment(action.dataFine).clone().subtract(action.defaultPeriod.max, 'days').toDate();
                actionsSetPluginsDates.push(changeFromData(fromData));
                actionsSetPluginsDates.push(changeToData(action.dataFine));
            }
            return Observable.of(...actionsSetPluginsDates);
        });

const updateRangePickerInfoEpic = (action$, store) =>
    action$.ofType(LAYER_LOAD)
        .mergeMap(({layerId}) => {
            const currentState = store.getState();
            const layers = currentState.layers?.flat || [];
            const variabiliMeteo = currentState.daterangelabel.variabiliMeteo;
            const activeLayer = layers.find(layer => layer.id === layerId);
            if (!activeLayer) {
                return Observable.of(errorLayerNotFound(layerId));
            }
            if (!isVariabiliMeteoLayer(activeLayer?.name, variabiliMeteo)) {
                // do nothing
                return Observable.empty();
            }
            const { fromData, toData } = activeLayer.params || {};
            if (!fromData || !toData) {
                return Observable.of(errorLayerDateMissing(layerId, fromData, toData));
            }
            return Observable.of(updateDatesLayer(layerId, fromData, toData));
        });

/**
 * Epic that handles toggling a plugin and updating its date parameters.
 *
 * This function listens for the `TOGGLE_PLUGIN` action type and performs different
 * operations depending on the `source` (`FixedRangePlugin` or `FreeRangePlugin`).
 * Its main purpose is to set the appropriate date range for the selected plugin.
 * If the required parameters (such as `variabiliMeteoLayers`) are missing, the epic does nothing.
 *
 * - If the `source` is `FIXED_RANGE`, it determines the start (`fromData`) and end date (`toData`)
 *   either from the active layer's parameters or default values. It then emits actions to:
 *     - Set the start date (`fromData`)
 *     - Restore the default period for the `FixedRangePlugin`
 *     - Validate and update both `fromData` and `toData`
 *
 * - If the `source` is `FREE_RANGE`, it retrieves the end date (`toData`) from the layer parameters
 *   or a default value and emits an action to update the period for `FreeRangePlugin`, ensuring
 *   that the date is valid.
 *
 * The function returns an Observable that emits the generated Redux actions.
 *
 * @param {Object} action$ - Stream of incoming actions, managed by redux-observable.
 * @param {Object} store - The application state, used to access global data.
 * @returns {Observable} - Observable that emits Redux actions to modify the state.
 */
const togglePluginEpic = (action$, store) =>
    action$.ofType(TOGGLE_PLUGIN)
        .switchMap((action) => {
            if (!action.variabiliMeteoLayers) {
                return Observable.empty();
            }
            const appState = store.getState();
            let newActions = [];
            const layers = getVisibleLayers(layersSelector(appState), action.variabiliMeteoLayers);
            if (action.source === FIXED_RANGE) {
                const toData = layers[0]?.params?.toData || appState.fixedrangepicker.lastAvailableDate;
                const fromData = layers[0]?.params?.fromData || moment(toData).clone().subtract(1, 'month');
                // Restore the default period in the FixedRange plugin
                newActions.push(changePeriod(action.defaultPeriod));
                // Validate dates before applying changes
                if (toData && !isNaN(new Date(toData)) && fromData && !isNaN(new Date(fromData))) {
                    newActions.push(changeFromData(new Date(fromData)));
                    newActions.push(changeToData(new Date(toData)));
                }
            }
            if (action.source === FREE_RANGE) {
                const toData = layers[0]?.params?.toData || appState.freerangepicker.lastAvailableDate;
                // Validate dates before applying changes
                if (toData && !isNaN(new Date(toData))) {
                    newActions.push(changePeriodToData(new Date(toData)));
                }
            }
            return Observable.of(...newActions);
        });


export {
    setPluginsDatesOnInitEpic,
    combinedDateMapConfigEpic,
    updateParamsByDateRangeEpic,
    togglePluginEpic,
    updateRangePickerInfoEpic
};

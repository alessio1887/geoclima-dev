/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { MAP_CONFIG_LOADED } from '@mapstore/actions/config';
import { updateSettings, updateNode } from '@mapstore/actions/layers';
import { FETCHED_AVAILABLE_DATES } from '../actions/updateDatesParams';
import { TOGGLE_PLUGIN, changePeriod, changePeriodToData } from '../actions/fixedrangepicker';
import { changeFromData, changeToData  } from '../actions/freerangepicker';
import DateAPI from '../utils/ManageDateUtils';
import { getVisibleLayers, FIXED_RANGE, FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const COMBINED_DATE_MAPCONFIG = 'COMBINED_DATE_MAPCONFIG';

const updateLayersParams = (layers, defaultPeriod, toData, timeUnit, isMapfilenameNotChange) => {
    let actionsUpdateParams = [];
    const toDataFormatted = moment(toData).format(timeUnit);
    const fromDataFormatted = moment(toData).clone().subtract(defaultPeriod.max, 'days').format(timeUnit);
    for (const layer of layers) {
        if (layer.params?.map) {
            const mapFileName = !isMapfilenameNotChange ?
                DateAPI.getMapfilenameFromSuffix(layer.params.map, defaultPeriod.key)
                : layer.params.map;
            const newParams = {
                params: {
                    map: mapFileName,
                    fromData: fromDataFormatted,
                    toData: toDataFormatted
                }
            };
            actionsUpdateParams.push(updateSettings(newParams));
            actionsUpdateParams.push(updateNode(layer.id, "layers", newParams));
        }
    }
    // Returns action for updated layers
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
            const actionsUpdateParams = updateLayersParams(layers, defaultPeriod, toData, timeUnit, isMapfilenameNotChange);
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
const setPluginsDatesEpic = (action$, store) =>
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

// Function to get the layer configuration based on the date range
// const getMapLayersConfiguration = (configName, toData) => {
//     return axios.get(configName).then((response) => {
//         if (response.data && typeof response.data === 'object' && response.data.map?.layers) {
//             const toDataFormatted = moment(toData).format('YYYY-MM-DD');
//             const fromDataFormatted = moment(toData).clone().subtract(1, 'month').format('YYYY-MM-DD');
//             const updatedLayers = response.data.map.layers.map((layer) => {
//                 if (layer.params) {
//                     const mapFileName = DateAPI.setGCMapFile(
//                         fromDataFormatted,
//                         toDataFormatted,
//                         layer.params.map
//                     );
//                     return {
//                         ...layer,
//                         params: {
//                             ...layer.params,
//                             map: mapFileName,
//                             fromData: fromDataFormatted,
//                             toData: toDataFormatted
//                         }
//                     };
//                 }
//                 return layer;
//             });
//             // Returns the new configuration with updated layers
//             return { ...response.data, map: { ...response.data.map, layers: updatedLayers } };
//         }
//         // If the response structure is invalid, throws an error
//         throw new Error(`Invalid response structure in config: ${configName}`);
//     });
// };

// Resets the plugin and application's state to default values when navigating back to the Home Page
// const restoreDefaultsOnHome = (action$, store) =>
//     action$.ofType(LOADING).switchMap(() => {
//         let rangePickerActions = [];
//         const appState = store.getState();
//         // TODO: recuperare TO_DATA con la chiamata ajax selectDate
//         const TO_DATA = moment().subtract(1, 'day').toDate();
//         const FROM_DATA = new Date(moment(TO_DATA).clone().subtract(1, 'month'));
//         rangePickerActions.push(changeFromData(FROM_DATA));
//         rangePickerActions.push(changeToData(TO_DATA));
//         rangePickerActions.push(changePeriodToData(TO_DATA));
//         rangePickerActions.push(changePeriod("1"));
//         if (appState.fixedrangepicker.showFixedRangePicker) {
//             rangePickerActions.push(toggleRangePickerPlugin());
//         }
//         if (appState.fixedrangepicker.isPluginLoaded) {
//             rangePickerActions.push(markFixedRangeAsNotLoaded());
//         }
//         if (appState.freerangepicker.isPluginLoaded) {
//             rangePickerActions.push(markFreeRangeAsNotLoaded());
//         }
//         return Observable.of(...rangePickerActions);
//     });


// const loadMapConfigByDateRangeEpic = (action$) =>
//     action$.ofType(LOAD_MAP_CONFIG)
//         .switchMap((action) => {
//             if (!action.config) {
//                 const configName = action.configName;
//                 const mapId = action.mapId;
//                 return Observable.fromPromise(getMapLayersConfiguration(configName))
//                     .switchMap((data) => Observable.of(loadMapConfig(configName, mapId, data))) // Loads the map configuration with updated layers
//                     .catch((error) => Observable.of(configureError(error.message || error, mapId))); // Handles the error
//             }
//             return Observable.empty();
//         });

// const checkFetchAvailableDatesEpic = (action$, store) =>
//     action$.ofType(FREERANGE_CHECK_FETCH_SELECT_DATE, FIXEDRANGE_CHECK_FETCH_SELECT_DATE)
//         .filter((action) => {
//             const appState = store.getState();
//             if (action.type === FREERANGE_CHECK_FETCH_SELECT_DATE) {
//                 return !appState.fixedrangepicker?.isPluginLoaded && !appState.infochart?.isPluginLoaded;
//             }
//             if (action.type === FIXEDRANGE_CHECK_FETCH_SELECT_DATE) {
//                 return !appState.freerangepicker?.isPluginLoaded && !appState.infochart?.isPluginLoaded;
//             }
//             return false;
//         })
//         .switchMap((action) =>
//             Observable.of(fetchSelectDate(action.variableSelectDate, action.urlSelectDate, action.type, action.timeUnit))
//         );

/**
 * Epic that handles the toggling of a plugin based on action parameters.
 *
 * This function listens for the `TOGGLE_PLUGIN` action type and, based on the
 * `source` (either `FixedRangePlugin` or `FreeRangePlugin`), performs different operations.
 * The purpose of this epic is to set the plugin's dates.
 * If the necessary parameters (like `layerParams`) are not provided, the epic does nothing.
 *
 * - If `source` is `FIXED_RANGE`, it calculates a start and end date (using the active layer's data
 *   or a default value) and emits actions to update the dates for `FixedRangePlugin`.
 * - If `source` is `FREE_RANGE`, it only updates the end date and emits an action to modify the
 *   period for `FreeRangePlugin`.
 *
 * The function returns an Observable that emits the generated actions.
 *
 * @param {Object} action$ - Stream of incoming actions, managed by redux-observable.
 * @param {Object} store - The application state, used to access global data.
 * @returns {Observable} - Observable that emits Redux actions to modify the state.
 */
const togglePluginEpic = (action$, store) =>
    action$.ofType(TOGGLE_PLUGIN)
        .switchMap((action) => {
            if (!action.layerParams) {
                return Observable.empty();
            }
            const appState = store.getState();
            let newActions = [];
            const layers = getVisibleLayers(appState.layers.flat, action.layerParams);
            if (action.source === FIXED_RANGE) {
                const toData = layers[0]?.params?.toData || appState.fixedrangepicker.lastAvailableDate;
                const fromData = layers[0]?.params?.fromData || moment(toData).clone().subtract(1, 'month');
                // Verifica validità delle date
                if (toData && !isNaN(new Date(toData)) && fromData && !isNaN(new Date(fromData))) {
                    newActions.push(changeFromData(new Date(fromData)));
                    newActions.push(changeToData(new Date(toData)));
                }
            }
            if (action.source === FREE_RANGE) {
                const toData = layers[0]?.params?.toData || appState.freerangepicker.lastAvailableDate;
                // Verifica validità delle date
                if (toData && !isNaN(new Date(toData))) {
                    const defaultPeriod = appState.fixedrangepicker?.periodTypes?.find(period => period.isDefault);
                    newActions.push(changePeriod(defaultPeriod));
                    newActions.push(changePeriodToData(new Date(toData)));
                }
            }
            return Observable.of(...newActions);
        });


export {
    setPluginsDatesEpic,
    combinedDateMapConfigEpic,
    updateParamsByDateRangeEpic,
    togglePluginEpic
};

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import axios from '../../MapStore2/web/client/libs/ajax';
import { loadMapConfig, configureError } from '@mapstore/actions/config';
import { FIXEDRANGE_MAP_CONFIG, SET_SELECT_DATE } from '../actions/fixedrangepicker';
import { FREERANGE_MAP_CONFIG, CHECK_LAUNCH_SELECT_DATE, setSelectDate as setSelectDateFreeRange,
    fetchSelectDate } from '../actions/freerangepicker';
import DateAPI from '../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

// Function to get the layer configuration based on the date range
const getMapLayersConfiguration = (configName, toData) => {
    return axios.get(configName).then((response) => {
        if (response.data && typeof response.data === 'object' && response.data.map?.layers) {
            const toDataFormatted = moment(toData).format('YYYY-MM-DD');
            const fromDataFormatted = moment(toData).clone().subtract(1, 'month').format('YYYY-MM-DD');
            const updatedLayers = response.data.map.layers.map((layer) => {
                if (layer.params) {
                    const mapFileName = DateAPI.setGCMapFile(
                        fromDataFormatted,
                        toDataFormatted,
                        layer.params.map
                    );
                    return {
                        ...layer,
                        params: {
                            ...layer.params,
                            map: mapFileName,
                            fromData: fromDataFormatted,
                            toData: toDataFormatted
                        }
                    };
                }
                return layer;
            });
            // Returns the new configuration with updated layers
            return { ...response.data, map: { ...response.data.map, layers: updatedLayers } };
        }
        // If the response structure is invalid, throws an error
        throw new Error(`Invalid response structure in config: ${configName}`);
    });
};

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

const loadMapConfigByDateRangeEpic = (action$) =>
    action$.ofType(FIXEDRANGE_MAP_CONFIG, FREERANGE_MAP_CONFIG)
        .switchMap((action) => {
            const configName = action.configName;
            const mapId = action.mapId;
            const toData = action.lastAvailableData;
            return Observable.fromPromise(getMapLayersConfiguration(configName, toData))
                .switchMap((data) => Observable.of(loadMapConfig(configName, mapId, data))) // Loads the map configuration with updated layers
                .catch((error) => Observable.of(configureError(error.message || error, mapId))); // Handles the error
        });

const checkSelectDateEpic = (action$, store) =>
    action$.ofType(CHECK_LAUNCH_SELECT_DATE)
        .switchMap((action) => {
            const appState = store.getState();
            if (!appState.fixedrangepicker?.isPluginLoaded) {
                return Observable.of(fetchSelectDate(action.variableSelectDate,
                    action.urlSelectDate, action.mapId, action.mapConfig));
            }
            return Observable.empty();
        });

const checkSetDateFreeRangePlugin = (action$, store) =>
    action$.ofType(SET_SELECT_DATE)
        .switchMap((action) => {
            const appState = store.getState();
            if (appState.freerangepicker?.isPluginLoaded) {
                return Observable.of(setSelectDateFreeRange(action.dataInizio,
                    action.dataFine));
            }
            return Observable.empty();
        });

export { loadMapConfigByDateRangeEpic, checkSelectDateEpic, checkSetDateFreeRangePlugin };

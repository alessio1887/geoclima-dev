/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import axios from '../../MapStore2/web/client/libs/ajax';
import { loadMapConfig, configureError, LOAD_MAP_CONFIG } from '@mapstore/actions/config';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import { LOADING } from '@mapstore/actions/maps';
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import { changeFromData, changeToData } from '../actions/freerangepicker';
import { changeYear, changePeriod, toggleRangePickerPlugin } from '../actions/fixedrangepicker';
import moment from 'moment';


// Function to get the layer configuration based on the date range
const getMapLayersConfiguration = (configName, fromData, toData) => {
    return axios.get(configName).then((response) => {
        if (typeof response.data === 'object' && response.data.map?.layers) {
            const updatedLayers = response.data.map.layers.map((data) => {
                if (isVariabiliMeteoLayer(data?.name)) {
                    const mapFile = DateAPI.setGCMapFile(
                        moment(fromData).format('YYYY-MM-DD'),
                        moment(toData).format('YYYY-MM-DD')
                    );
                    return {
                        ...data,
                        params: {
                            ...data.params,
                            map: mapFile,
                            fromData: moment(fromData).format('YYYY-MM-DD'),
                            toData: moment(toData).format('YYYY-MM-DD')
                        }
                    };
                }
                return data;
            });
            // Returns the new configuration with updated layers
            return { ...response.data, map: { ...response.data.map, layers: updatedLayers } };
        }
        // If the response structure is invalid, throws an error
        throw new Error(`Invalid response structure in config: ${configName}`);
    });
};

/**
 * Epic triggered when the user navigates back to the Home Page.
 * Resets plugins and application state to their default values,
 * including the range picker, selected year, and active period.
 * Ensures a consistent initial state for the user interface.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - The Redux store, used to access the current state.
 * @returns {Observable} - Stream of actions to dispatch to Redux.
 */
const restoreDefaultsOnHome = (action$, store) =>
    action$.ofType(LOADING).switchMap(() => {
        let rangePickerActions = [];
        const appState = store.getState();
        rangePickerActions.push(changeFromData(FROM_DATA));
        rangePickerActions.push(changeToData(TO_DATA));
        rangePickerActions.push(changeYear(TO_DATA));
        rangePickerActions.push(changePeriod("1"));
        if (!appState.fixedrangepicker.showFixedRangePicker) {
            rangePickerActions.push(toggleRangePickerPlugin());
        }
        return Observable.of(...rangePickerActions);
    });


const loadMapConfigByDateRangeEpic = (action$) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap((action) => {
            if (!action.config) {
                const configName = action.configName;
                const mapId = action.mapId;
                return Observable.fromPromise(getMapLayersConfiguration(configName, FROM_DATA, TO_DATA))
                    .switchMap((data) => Observable.of(loadMapConfig(configName, mapId, data))) // Loads the map configuration with updated layers
                    .catch((error) => Observable.of(configureError(error.message || error, mapId))); // Handles the error
            }
            return Observable.empty();
        });

export { restoreDefaultsOnHome, loadMapConfigByDateRangeEpic };

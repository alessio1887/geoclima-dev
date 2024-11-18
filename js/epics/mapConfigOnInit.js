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
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import moment from 'moment';


// Function to get the layer configuration based on the date range
const getMapLayersConfiguration = (configName, mapId, fromData, toData) => {
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


const loadMapConfigByDateRangeEpic = (action$) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap((action) => {
            if (!action.config) {
                const configName = action.configName;
                const mapId = action.mapId;
                return Observable.fromPromise(getMapLayersConfiguration(configName, mapId, FROM_DATA, TO_DATA))
                    .switchMap((data) => Observable.of(loadMapConfig(configName, mapId, data))) // Loads the map configuration with updated layers
                    .catch((error) => Observable.of(configureError(error.message || error, mapId))); // Handles the error
            }
            return Observable.empty();
        });

export default loadMapConfigByDateRangeEpic;

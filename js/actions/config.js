/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../../MapStore2/web/client/libs/ajax';
import DateAPI from '../utils/ManageDateUtils';
import moment from 'moment';


export const LOAD_NEW_MAP = 'MAP:LOAD_NEW_MAP';
export const LOAD_MAP_CONFIG = "MAP_LOAD_MAP_CONFIG";
export const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
export const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
export const LOAD_MAP_INFO = 'MAP_LOAD_INFO';
export const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
export const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
export const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';
export const MAP_SAVE_ERROR = 'MAP:MAP_SAVE_ERROR';
export const MAP_SAVED = 'MAP:MAP_SAVED';
export const RESET_MAP_SAVE_ERROR = 'MAP:RESET_MAP_SAVE_ERROR';


export function configureMap(conf, mapId, zoomToExtent) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId,
        zoomToExtent
    };
}

export function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

export function loadNewMap(configName, contextId) {
    return {
        type: LOAD_NEW_MAP,
        configName,
        contextId
    };
}

export function loadMapConfig(configName, mapId, fromData, toData, fromDataReal, toDataReal) {
    return (dispatch) => {
        return axios.get(configName).then((response) => {
            if (typeof response.data === 'object') {
                response.data.map.layers.map((data) => {
                    if (data && data.group && (data.group === "Variabili Meteo.Pioggia" ||
                        data.group === "Variabili Meteo.Temperatura" ||
                        data.group === "Variabili Meteo.Evapotraspirazione" ||
                        data.group === "Variabili Meteo.Bilancio Idrico Semplificato" ||
                        data.group === "Layer di Base")) {
                        const mapFile = DateAPI.setAITMapFile(moment(fromData).format('YYYY-MM-DD'), moment(toData).format('YYYY-MM-DD'));
                        Object.assign(data, {params: {map: mapFile, fromData: moment(fromData).format('YYYY-MM-DD'), toData: moment(toData).format('YYYY-MM-DD')}});
                    } else if ( data.group === "Variabili Meteo.SPI" ||
                        data.group === "Variabili Meteo.SPEI") {
                        const mapFile = DateAPI.setAITMapFile(moment(fromData).format('YYYY-MM-DD'), moment(toData).format('YYYY-MM-DD'));
                        Object.assign(data, {params: {map: mapFile, fromData: moment(fromDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD'), toData: moment(toDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD')}});
                    }
                }, this);
                dispatch(configureMap(response.data, mapId));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(configureError('Configuration file broken (' + configName + '): ' + e.message, mapId));
                }
            }
        }).catch((e) => {
            dispatch(configureError(e, mapId));
        });
    };
}

export function mapInfoLoaded(info, mapId, merge = false) {
    return {
        type: MAP_INFO_LOADED,
        mapId,
        info,
        merge
    };
}
export function mapInfoLoadError(mapId, error) {
    return {
        type: MAP_INFO_LOAD_ERROR,
        mapId,
        error
    };
}
export function mapInfoLoadStart(mapId) {
    return {
        type: MAP_INFO_LOAD_START,
        mapId
    };
}
export function loadMapInfo(mapId) {
    return {
        type: LOAD_MAP_INFO,
        mapId
    };
}

export const mapSaveError = error => ({type: MAP_SAVE_ERROR, error});

export const mapSaved = (resourceId) => ({type: MAP_SAVED, resourceId});

export const resetMapSaveError = () => ({type: RESET_MAP_SAVE_ERROR});

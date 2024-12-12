/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import GeoClimaAPI from '../api/GeoClimaApi';

export const FROMDATA_CHANGED = 'FREERANGE:FROMDATA_CHANGED';
export const TODATA_CHANGED = 'FREERANGE:TODATA_CHANGED';
export const CLICK_THUMBNAIL_HOME = 'CLICK_THUMBNAIL_HOME';
export const OPEN_ALERT = 'FREERANGE:OPEN_ALERT';
export const CLOSE_ALERT = 'FREERANGE:CLOSE_ALERT';
export const COLLAPSE_RANGE_PICKER = 'FREERANGE:COLLAPSE_RANGE_PICKER';
export const PLUGIN_LOADED = 'FREERANGE:PLUGIN_LOADED';
export const PLUGIN_NOT_LOADED = 'FREERANGE:PLUGIN_NOT_LOADED';
export const SET_SELECT_DATE = 'FREERANGE:SET_LAST_AVAILABLE_DATA';
export const CHECK_LAUNCH_SELECT_DATE = 'FREERANGE:CHECK_LAUNCH_SELECT_DATE';
export const FREERANGE_ERROR_FETCH = 'FREERANGE_ERROR_FETCH';
export const FETCH_SELECT_DATE = 'FREERANGE:FETCH_SELECT_DATE';
export const FREERANGE_MAP_CONFIG = 'FREERANGE:LOAD_SELECT_DATE_MAP_CONFIG';

export function changeFromData(fromData) {
    return {
        type: FROMDATA_CHANGED,
        fromData
    };
}

export function changeToData(toData) {
    return {
        type: TODATA_CHANGED,
        toData
    };
}

export function openAlert(alertMessage) {
    return {
        type: OPEN_ALERT,
        alertMessage
    };
}
export function closeAlert() {
    return {
        type: CLOSE_ALERT
    };
}
export function collapsePlugin() {
    return {
        type: COLLAPSE_RANGE_PICKER
    };
}

export function markFreeRangeAsLoaded() {
    return {
        type: PLUGIN_LOADED
    };
}

export function markFreeRangeAsNotLoaded() {
    return {
        type: PLUGIN_NOT_LOADED
    };
}

export function setSelectDate(dataInizio, dataFine) {
    return {
        type: SET_SELECT_DATE,
        dataInizio,
        dataFine
    };
}

export const checkLaunchSelectDateQuery = (variableSelectDate, urlSelectDate, mapId, mapConfig) => {
    return {
        type: CHECK_LAUNCH_SELECT_DATE,
        variableSelectDate,
        urlSelectDate,
        mapId,
        mapConfig
    };
};

export function apiError(errorMessage) {
    return {
        type: FREERANGE_ERROR_FETCH,
        errorMessage
    };
}

export const loadMapConfig = (lastAvailableData, mapId, configName) => {
    return {
        type: FREERANGE_MAP_CONFIG,
        lastAvailableData,
        mapId,
        configName
    };
};

export function fetchSelectDate(variabileLastAvailableData, urlGetLastAvailableData, mapId, mapConfig) {
    return (dispatch) => {
        GeoClimaAPI.getAvailableDates(variabileLastAvailableData, urlGetLastAvailableData)
            .then(response => {
                const dataFine = new Date(response.data[0].data_fine);
                const dataInizio = new Date(response.data[0].data_inizio);
                dispatch(setSelectDate(dataInizio, dataFine));
                dispatch(loadMapConfig(dataFine, mapId, mapConfig));
            })
            .catch(error => {
                dispatch(apiError(error));
            });
    };
}

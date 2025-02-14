/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import GeoClimaAPI from '../api/GeoClimaApi';

export const UPDATEPARAMS_ERROR_FETCH = 'UPDATEPARAMS_ERROR_FETCH';
export const FETCH_AVAILABLE_DATES = 'FETCH_AVAILABLE_DATES';
export const FETCHED_AVAILABLE_DATES = 'FETCHED_AVAILABLE_DATES';

export function apiError(errorMessage) {
    return {
        type: UPDATEPARAMS_ERROR_FETCH,
        errorMessage
    };
}

export function updateParams(dataInizio, dataFine, timeUnit, defaultPeriod) {
    return {
        type: FETCHED_AVAILABLE_DATES,
        dataInizio,
        dataFine,
        timeUnit,
        defaultPeriod
    };
}

/**
 * This action calls the getAvailableDates service, which retrieves the first and last dates
 * of the period that can be considered for analysis. These dates are passed to the plugins
 * through the updateParams action.
 *
 * This action is called only once at the beginning during map loading.
 * It is triggered by one of these three plugins—FixedRangePlugin, FreeRangePlugin, or InfoChart—
 * based on their showOneDatePicker prop.
 */
export function fetchSelectDate(variabileLastAvailableData, urlGetLastAvailableData, timeUnit, defaultPeriod) {
    return (dispatch) => {
        GeoClimaAPI.getAvailableDates(variabileLastAvailableData, urlGetLastAvailableData)
            .then(response => {
                const dataFine = new Date(response.data[0].data_fine);
                const dataInizio = new Date(response.data[0].data_inizio);
                dispatch(updateParams(dataInizio, dataFine, timeUnit, defaultPeriod));
            })
            .catch(error => {
                dispatch(apiError(error));
            });
    };
}

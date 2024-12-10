/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import GeoClimaAPI from '../api/GeoClimaApi';

export const CHARTVARIABLE_CHANGED = 'CHARTVARIABLE_CHANGED';
export const TODATA_CHANGED = 'INFOCHART:TODATA_CHANGED';
export const FROMDATA_CHANGED = 'INFOCHART:FROMDATA_CHANGED';
export const TODATA_FIXEDRANGE_CHANGED = 'INFOCHART:TODATA_FIXEDRANGE_CHANGED';
export const SET_INFOCHART_VISIBILITY = 'SET_INFOCHART_VISIBILITY';
export const CHART_PERIOD_CHANGED = 'CHART_PERIOD_CHANGED';
export const FETCH_INFOCHART_DATA = 'FETCH_INFOCHART_DATA';
export const FETCHED_INFOCHART_DATA = 'FETCHED_INFOCHART_DATA';
export const TOGGLE_INFOCHART = 'TOGGLE_INFOCHART';
export const COLLAPSE_RANGE_PICKER = 'INFOCHART:COLLAPSE_RANGE_PICKER';
export const SET_RANGE_MANAGER = 'INFOCHART:SET_RANGE_MANAGER';
export const OPEN_ALERT = 'INFOCHART:OPEN_ALERT';
export const CLOSE_ALERT = 'INFOCHART:CLOSE_ALERT';
export const SET_CHART_RELAYOUT = 'INFOCHART:SET_CHART_RELAYOUT';
export const RESET_CHART_RELAYOUT = 'INFOCHART:RESET_CHART_RELAYOUT';
export const RESIZE_INFOCHART = 'RESIZE_INFOCHART';
export const SET_IDVARIABILI_LAYERS = 'SET_ID_VARIABILI_LAYERS';
export const SET_DEFAULT_URL = 'INFOCHART:SET_DEFULT_URL';
export const SET_DEFAULT_DATES = 'INFOCHART:SET_DEFULT_DATES';
export const INFOCHART_ERROR_FETCH = 'INFOCHART_ERROR_FETCH';

export function changeChartVariable(variable) {
    return {
        type: CHARTVARIABLE_CHANGED,
        variable
    };
}

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

export function changeFixedRangeToData(toData) {
    return {
        type: TODATA_FIXEDRANGE_CHANGED,
        toData
    };
}

export function changePeriod(periodType) {
    return {
        type: CHART_PERIOD_CHANGED,
        periodType
    };
}

export function setInfoChartVisibility(status) {
    return {
        type: SET_INFOCHART_VISIBILITY,
        status,
        data: [],
        maskLoading: true
    };
}

export function fetchInfoChartData(params) {
    return {
        type: FETCH_INFOCHART_DATA,
        params
    };
}

export function fetchedInfoChartData(data, maskLoading) {
    return {
        type: FETCHED_INFOCHART_DATA,
        data,
        maskLoading
    };
}

/**
 * when fullscreen have to be toggled
 * @memberof actions.fullscreen
 * @param  {boolean} enable          true for enable, false for disable
 * @param  {string} elementSelector querySelector string to use to get the element to fullscreen.
 * @return {action}                   the action of type `TOGGLE_FULLSCREEN` with enable flag and element selector.
 */
export function toggleInfoChart(enable, elementSelector) {
    return {
        type: TOGGLE_INFOCHART,
        enable,
        elementSelector
    };
}
// To collapse the InfoChart's range picker
export function collapseRangePicker() {
    return {
        type: COLLAPSE_RANGE_PICKER
    };
}

export function setRangeManager(rangeManager) {
    return {
        type: SET_RANGE_MANAGER,
        rangeManager
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

export function setChartRelayout(chartRelayout) {
    return {
        type: SET_CHART_RELAYOUT,
        chartRelayout
    };
}

export function resetChartRelayout() {
    return {
        type: RESET_CHART_RELAYOUT
    };
}

export function resizeInfoChart(widthResizable, heightResizable) {
    return {
        type: RESIZE_INFOCHART,
        widthResizable,
        heightResizable
    };
}

export function setIdVariabiliLayers(idVariabiliLayers) {
    return {
        type: SET_IDVARIABILI_LAYERS,
        idVariabiliLayers
    };
}

export function setDefaultUrlGeoclimaChart(defaultUrlGeoclimaChart) {
    return {
        type: SET_DEFAULT_URL,
        defaultUrlGeoclimaChart
    };
}

export function setDefaultDates(toData, periodTypes) {
    return {
        type: SET_DEFAULT_DATES,
        toData,
        periodTypes
    };
}

export function apiError(errorMessage) {
    return {
        type: INFOCHART_ERROR_FETCH,
        errorMessage
    };
}

export const fetchLastAvailableData = (variabileLastAvailableData, urlGetLastAvailableData, periodTypes) => {
    return (dispatch) => {
        GeoClimaAPI.getLastAvailableData(variabileLastAvailableData, urlGetLastAvailableData)
            .then(response => {
                const lastAvailableData = new Date(response.data[0].data);
                dispatch(setDefaultDates(lastAvailableData, periodTypes));
            })
            .catch(error => {
                dispatch(apiError(error));
            });
    };
};

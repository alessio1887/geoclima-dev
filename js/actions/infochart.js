/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const CHARTVARIABLE_CHANGED = 'CHARTVARIABLE_CHANGED';
export const TODATA_CHANGED = 'INFOCHART:TODATA_CHANGED';
export const FROMDATA_CHANGED = 'INFOCHART:FROMDATA_CHANGED';
export const TODATA_FIXEDRANGE_CHANGED = 'INFOCHART:TODATA_FIXEDRANGE_CHANGED';
export const SET_INFOCHART_VISIBILITY = 'SET_INFOCHART_VISIBILITY';
export const CHART_PERIOD_CHANGED = 'CHART_PERIOD_CHANGED';
export const FETCH_INFOCHART_DATA = 'FETCH_INFOCHART_DATA';
export const FETCHED_INFOCHART_DATA = 'FETCHED_INFOCHART_DATA';
export const TOGGLE_INFOCHART = 'TOGGLE_INFOCHART';
export const RESET_INFO_CHART_DATES = 'RESET_INFO_CHART_DATES';
export const COLLAPSE_RANGE_PICKER = 'INFOCHART:COLLAPSE_RANGE_PICKER';
export const SWITCH_RANGE_MANAGER = 'INFOCHART:SWITCH_RANGE_MANAGER';
export const OPEN_ALERT = 'INFOCHART:OPEN_ALERT';
export const CLOSE_ALERT = 'INFOCHART:CLOSE_ALERT';

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


export function resetInfoChartDates() {
    return {
        type: RESET_INFO_CHART_DATES
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

export function switchRangeManager() {
    return {
        type: SWITCH_RANGE_MANAGER
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

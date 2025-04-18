/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const TODATA_CHANGED = 'TODATA_CHANGED';
export const MAP_PERIOD_CHANGED = 'MAP_PERIOD_CHANGED';
export const TOGGLE_PLUGIN = 'TOGGLE_PLUGIN';
export const CLICK_THUMBNAIL_HOME = 'CLICK_THUMBNAIL_HOME';
export const OPEN_ALERT = 'FIXEDRANGE:OPEN_ALERT';
export const CLOSE_ALERT = 'FIXEDRANGE:CLOSE_ALERT';
export const COLLAPSE_RANGE_PICKER = 'FIXEDRANGE:COLLAPSE_RANGE_PICKER';
export const PLUGIN_LOADED = 'FIXEDRANGE:PLUGIN_LOADED';
export const PLUGIN_NOT_LOADED = 'FIXEDRANGE:PLUGIN_NOT_LOADED';

export function changePeriodToData(toData) {
    return {
        type: TODATA_CHANGED,
        toData
    };
}

export function changePeriod(periodType) {
    return {
        type: MAP_PERIOD_CHANGED,
        periodType
    };
}

export function toggleRangePickerPlugin(variabiliMeteoLayers, source, defaultPeriod) {
    return {
        type: TOGGLE_PLUGIN,
        variabiliMeteoLayers,
        source,
        defaultPeriod
    };
}

export function clickThumbnail(showModal, imgSrc) {
    return {
        type: CLICK_THUMBNAIL_HOME,
        showModal,
        imgSrc
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


export function markFixedRangeAsLoaded(showOneDatePicker, checkPrefixes, variabiliMeteo) {
    return {
        type: PLUGIN_LOADED,
        showOneDatePicker,
        checkPrefixes,
        variabiliMeteo
    };
}

export function markFixedRangeAsNotLoaded() {
    return {
        type: PLUGIN_NOT_LOADED
    };
}

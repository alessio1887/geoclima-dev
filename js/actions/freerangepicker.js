/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const FROMDATA_CHANGED = 'FREERANGE:FROMDATA_CHANGED';
export const TODATA_CHANGED = 'FREERANGE:TODATA_CHANGED';
export const CLICK_THUMBNAIL_HOME = 'CLICK_THUMBNAIL_HOME';
export const OPEN_ALERT = 'FREERANGE:OPEN_ALERT';
export const CLOSE_ALERT = 'FREERANGE:CLOSE_ALERT';
export const COLLAPSE_RANGE_PICKER = 'FREERANGE:COLLAPSE_RANGE_PICKER';
export const PLUGIN_LOADED = 'FREERANGE:PLUGIN_LOADED';
export const PLUGIN_NOT_LOADED = 'FREERANGE:PLUGIN_NOT_LOADED';

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

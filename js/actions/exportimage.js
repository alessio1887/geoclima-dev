/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const UPDATE_DATES = 'EXPORTIMAGE:UPDATE_DATES';
export const NOT_FOUND_LAYER = 'EXPORTIMAGE:NOT_FOUND_LAYER';
export const LAYER_DATE_MISSING = 'EXPORTIMAGE:LAYER_DATE_MISSING';
export const SET_VARIABILIMETEO = 'EXPORTIMAGE:SET_VARIABILIMETEO';
export const INITIALIZE_TABS = 'EXPORTIMAGE:INITIALIZE_TABS';
export const TAB_CHANGED = 'EXPORTIMAGE:TAB_CHANGED';
export const IMAGEVARIABLE_CHANGED = 'EXPORTIMAGE:IMAGEVARIABLE_CHANGED';

export function updateExportImageDates(layerId, fromData, toData) {
    return {
        type: UPDATE_DATES,
        layerId,
        fromData,
        toData
    };
}
export function errorLayerDateMissing(layerId,  fromData, toData) {
    return {
        type: LAYER_DATE_MISSING,
        layerId,
        fromData,
        toData
    };
}
export function errorLayerNotFound(layerId) {
    return {
        type: NOT_FOUND_LAYER,
        layerId
    };
}

export function setVariabiliMeteo(variabiliMeteo) {
    return {
        type: SET_VARIABILIMETEO,
        variabiliMeteo
    };
}

export function initializeVariableTabs(tabVariables) {
    return {
        type: INITIALIZE_TABS,
        tabVariables
    };
}

export function changeTab(idTab) {
    return {
        type: TAB_CHANGED,
        idTab
    };
}

export function changeImageVariable(idTab, variable) {
    return {
        type: IMAGEVARIABLE_CHANGED,
        idTab,
        variable
    };
}

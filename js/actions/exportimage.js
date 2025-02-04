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

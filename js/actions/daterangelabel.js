/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const UPDATE_RANGE_LABEL = 'UPDATE_RANGE_LABEL';
export const NOT_FOUND_LAYER = 'NOT_FOUND_LAYER';
export const LAYER_DATE_MISSING = 'LAYER_DATE_MISSING';
export const SET_VARIABILIMETEO = 'RANGE_LABEL:SET_VARIABILIMETEO';

export function updateRangeLabelDates(layerId, fromData, toData) {
    return {
        type: UPDATE_RANGE_LABEL,
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

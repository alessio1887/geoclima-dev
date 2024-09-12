/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const MAP_YEAR_CHANGED = 'MAP_YEAR_CHANGED';
export const MAP_PERIOD_CHANGED = 'MAP_PERIOD_CHANGED';
export const TOGGLE_PLUGIN = 'TOGGLE_PLUGIN';
export const CLICK_THUMBNAIL_HOME = 'CLICK_THUMBNAIL_HOME';

export function changeYear(toData) {
    return {
        type: MAP_YEAR_CHANGED,
        toData
    };
}

export function changePeriod(periodType) {
    return {
        type: MAP_PERIOD_CHANGED,
        periodType
    };
}

export function toggleDecadeRangePicker() {
    return {
        type: TOGGLE_PLUGIN
    };
}

export function clickThumbnail(showModal, imgSrc) {
    return {
        type: CLICK_THUMBNAIL_HOME,
        showModal,
        imgSrc
    };
}

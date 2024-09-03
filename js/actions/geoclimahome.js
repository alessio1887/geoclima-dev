/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const FROMDATA_CHANGED = 'FROMDATA_CHANGED';
export const TODATA_CHANGED = 'TODATA_CHANGED';
export const CLICK_THUMBNAIL_HOME = 'CLICK_THUMBNAIL_HOME';

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

export function clickThumbnail(showModal, imgSrc) {
    return {
        type: CLICK_THUMBNAIL_HOME,
        showModal,
        imgSrc
    };
}

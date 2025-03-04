/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import GeoClimaAPI from '../api/GeoClimaApi';

export const UPDATE_DATES = 'EXPORTIMAGE:UPDATE_DATES';
export const NOT_FOUND_LAYER = 'EXPORTIMAGE:NOT_FOUND_LAYER';
export const LAYER_DATE_MISSING = 'EXPORTIMAGE:LAYER_DATE_MISSING';
export const SET_VARIABILIMETEO = 'EXPORTIMAGE:SET_VARIABILIMETEO';
export const INITIALIZE_TABS = 'EXPORTIMAGE:INITIALIZE_TABS';
export const TAB_CHANGED = 'EXPORTIMAGE:TAB_CHANGED';
export const IMAGEVARIABLE_CHANGED = 'EXPORTIMAGE:IMAGEVARIABLE_CHANGED';
export const EXPORTIMAGE_ERROR = 'EXPORTIMAGE:EXPORTIMAGE_ERROR';
export const EXPORTIMAGE_SUCCESS = 'EXPORTIMAGE:EXPORTIMAGE_SUCCESS';
export const EXPORTIMAGE_LOADING = 'EXPORTIMAGE:EXPORT_IMAGE_LOADING';
export const CLEAR_IMAGE_URL = 'EXPORTIMAGE:CLEAR_IMAGE_URL';
// export const TOGGLE_PLUGIN = 'EXPORTIMAGE:TOGGLE_PLUGIN';

// export function togglePlugin(isOpen) {
//     return {
//         type: TOGGLE_PLUGIN,
//         payload: isOpen
//     };
// }

export function updateExportImageDates(fromData, toData, layerId) {
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

export function apiError(errorMessage) {
    return {
        type: EXPORTIMAGE_ERROR,
        errorMessage
    };
}

export function exportImageSuccess(urlExportImage, fileName) {
    return {
        type: EXPORTIMAGE_SUCCESS,
        urlExportImage,
        fileName
    };
}

export function clearImageUrl() {
    return {
        type: CLEAR_IMAGE_URL
    };
}


// export function exportImage(layerName, fromData, toData, defaultUrlExportImage) {
//     return (dispatch) => {
//         GeoClimaAPI.exportImage(layerName, fromData, toData, defaultUrlExportImage)
//             .then(response => {
//                 const blob = new Blob([response.data], { type: 'image/png' });
//                 const url = window.URL.createObjectURL(blob);

//                 const contentDisposition = response.headers['content-disposition'];
//                 let fileName = 'exported_image.png'; // Nome di default
//                 if (contentDisposition) {
//                     const match = contentDisposition.match(/filename="?([^"]+)"?/);
//                     if (match && match[1]) {
//                         fileName = match[1];
//                     }
//                 }

//                 dispatch(exportImageSuccess(url, fileName));
//             })
//             .catch(error => {
//                 dispatch(apiError(error));
//             });
//     };
// }

export function exportImage(layerName, fromData, toData, defaultUrlExportImage) {
    return {
        type: EXPORTIMAGE_LOADING,
        layerName, fromData, toData, defaultUrlExportImage
    };
}

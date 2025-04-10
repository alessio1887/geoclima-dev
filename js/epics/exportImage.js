/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { LAYER_LOAD } from '@mapstore/actions/layers';
import { EXPORTIMAGE_LOADING, updateExportImageDates, apiError, resetTabVariables,
    errorLayerNotFound, errorLayerDateMissing, exportImageSuccess } from '../actions/exportimage';
import { exportImageEnabledSelector, tabVariablesSelector } from '../selectors/exportImage';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import { toggleControl } from '@mapstore/actions/controls';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { LOADING } from '@mapstore/actions/maps';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import GeoClimaAPI from '../api/GeoClimaApi';

/**
 * exportImageEpic listens for the EXPORT_IMAGE action and performs the following steps:
 * 1. Converts the API call (GeoClimaAPI.exportImage) from a Promise into an Observable.
 * 2. When the API call completes successfully, it:
 *    - Creates a Blob from the returned image data.
 *    - Generates an object URL for the Blob.
 *    - Extracts the file name from the "Content-Disposition" header (if present),
 *      defaulting to 'exported_image.png' otherwise.
 * 3. Dispatches the exportImageSuccess action with the generated URL and the file name.
 * 4. If an error occurs during the API call, it catches the error and dispatches an apiError action.
 */
const exportImageEpic = (action$) =>
    action$.ofType(EXPORTIMAGE_LOADING)
        .switchMap(action =>
        // Usa defer per ritardare l'esecuzione della funzione
            Observable.defer(() => {
                return GeoClimaAPI.exportImage(
                    action.layerName,
                    action.fromData,
                    action.toData,
                    action.defaultUrlExportImage
                ).then(response => {
                    // Crea un blob dalla response data e genera un URL per il download
                    const blob = new Blob([response.data], { type: 'image/png' });
                    const url = window.URL.createObjectURL(blob);
                    // Estrai il nome del file dall'header Content-Disposition se presente
                    const contentDisposition = response.headers['content-disposition'];
                    let fileName = 'exported_image.png';
                    if (contentDisposition) {
                        const match = contentDisposition.match(/filename="?([^"]+)"?/);
                        if (match && match[1]) {
                            fileName = match[1];
                        }
                    }
                    // Restituisce l'azione di successo con l'URL e il nome del file
                    return exportImageSuccess(url, fileName);
                }).catch(error => {
                    // Gestione degli errori
                    return apiError(error);
                });
            })
        );

const updateDatesExportImageEpic = (action$, store) =>
    action$.ofType(LAYER_LOAD)
        // .filter(() => exportImageEnabledSelector(store.getState()))
        .mergeMap(({layerId}) => {
            const currentState = store.getState();
            const layers = currentState.layers?.flat || [];
            const variabiliMeteo = currentState.exportimage.climateLayers;
            const activeLayer = layers.find(layer => layer.id === layerId);
            if (!activeLayer) {
                return Observable.of(errorLayerNotFound(layerId));
            }
            if (!isVariabiliMeteoLayer(activeLayer?.name, variabiliMeteo)) {
                // do nothing
                return Observable.empty();
            }
            const { fromData, toData } = activeLayer.params || {};
            if (!fromData || !toData) {
                return Observable.of(errorLayerDateMissing(layerId, fromData, toData));
            }
            return Observable.of(updateExportImageDates(fromData, toData, layerId));
        });

// Close ExportImage when user come back to homepage
const closeExportImagePanel = (action$, store) =>
    action$.ofType(LOADING)
        .filter(() => exportImageEnabledSelector(store.getState()))
        .map(() => toggleControl('exportImage', 'enabled')
        );

// Epic that resets the tabVariables state when the LOADING action is dispatched (i.e. when the user returns to the homepage)
const resetTabVariablesEpic = (action$, store) =>
    action$.ofType(LOADING)
        .filter(() => {
            const tabVariables = tabVariablesSelector(store.getState());
            return Array.isArray(tabVariables) && tabVariables.length > 0;
        }).map(() => resetTabVariables()
        );

/**
 * Epic that ensures the correct map layout when the plugin is open.
 * - Listens for the UPDATE_MAP_LAYOUT action.
 * - If the "exportImage" plugin is open and the right panel's width is set to 0,
 *   it updates the layout to move the toolbar to the right.
 */
const updateToolbarLayoutEpic  = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(() => {
            const appState = store.getState();
            return exportImageEnabledSelector(appState) && appState.maplayout?.layout?.right === 0;
        })
        .switchMap((action) => {
            const updatedLayout = {
                ...action.layout,
                right: 440,  // Imposta right a 440
                rightPanel: true  // Imposta rightPanel a true
            };

            return Observable.of(updateMapLayout(updatedLayout));
        });

const disablePluginWhenLoadFeatureInfo = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(() => {
            const appState = store.getState();
            // return appState.controls?.chartinfo?.enabled && exportImageEnabledSelector(appState);
            return appState.mapInfo?.enabled && exportImageEnabledSelector(appState);
        })
        .switchMap(() => {
            return Observable.of(toggleControl('exportImage', 'enabled'));
        });

// const disablePluginWhenFetchInfoChartData = (action$, store) =>
//     action$.ofType(SET_INFOCHART_VISIBILITY)
//         .filter(({ status }) => {
//             const appState = store.getState();
//             // Controlla se mapInfo è attivo o se l'azione ha status === true
//             return appState.controls?.chartinfo?.enabled && status === true && exportImageEnabledSelector(appState);
//         })
//         .switchMap(() => {
//             return Observable.of(toggleControl('exportImage', 'enabled'));
//         });

export { exportImageEpic,
    updateDatesExportImageEpic,
    updateToolbarLayoutEpic,
    disablePluginWhenLoadFeatureInfo,
    resetTabVariablesEpic,
    closeExportImagePanel
};


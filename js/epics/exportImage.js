/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { LAYER_LOAD } from '@mapstore/actions/layers';
import { EXPORTIMAGE_LOADING, updateExportImageDates,
    errorLayerNotFound, errorLayerDateMissing, exportImageSuccess, apiError,
    togglePlugin } from '../actions/exportimage';
import { isPluginOpenSelector } from '../selectors/exportImage';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import { TOGGLE_CONTROL } from '@mapstore/actions/controls';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import GeoClimaAPI from '../api/GeoClimaApi';

const TOOLBAR_OFFSET_RIGHT = {
    bottom: 0,
    left: 0,
    right: 440,
    transform: 'none',
    height: 'calc(100% - 30px)',
    boundingMapRect: {
        bottom: 0,
        left: 0,
        right: 440
    },
    boundingSidebarRect: {
        right: 0,
        left: 0,
        bottom: 0
    },
    rightPanel: true,
    leftPanel: false
};


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
            const variabiliMeteo = currentState.exportimage.variabiliMeteo;
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
/**
 * Epic that listens for the TOGGLE_CONTROL action related to the "exportImage" plugin.
 * - If the control is toggled and the plugin is not open, it sets `isOpen` to true.
 * - Dispatches the `togglePlugin` action to update the plugin's state.
 */
const toggleExportImageEpic = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control, property }) => {
            return control === "exportImage" && property === "enabled";
        })
        .switchMap(() => {
            const appState = store.getState();
            let actions = [];
            let isOpen = false;
            if (!isPluginOpenSelector(appState)) {
                isOpen = true;
            }
            actions.push(togglePlugin(isOpen));
            return Observable.of(...actions);
        });
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
            return isPluginOpenSelector(appState) && appState.maplayout?.layout?.right === 0;
        })
        .switchMap(() => {
            return Observable.of(updateMapLayout(TOOLBAR_OFFSET_RIGHT));
        });


export { exportImageEpic,
    updateDatesExportImageEpic,
    toggleExportImageEpic,
    updateToolbarLayoutEpic
};

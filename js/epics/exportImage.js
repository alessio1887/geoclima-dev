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
    errorLayerNotFound, errorLayerDateMissing, exportImageSuccess, apiError } from '../actions/exportimage';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
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
export const exportImageEpic = (action$) =>
    action$.ofType(EXPORTIMAGE_LOADING)
        .switchMap(action =>
            Observable.fromPromise(GeoClimaAPI.exportImage(
                action.layerName,
                action.fromData,
                action.toData,
                action.defaultUrlExportImage
            ).then(response => response)))
        .switchMap(response => {
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
            return Observable.of(exportImageSuccess(url, fileName));
        })
        .catch(error => Observable.of(apiError(error))
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
            return Observable.of(updateExportImageDates(layerId, fromData, toData));
        });

export default updateDatesExportImageEpic;

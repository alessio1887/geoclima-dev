/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { LAYER_LOAD } from '@mapstore/actions/layers';
import { updateDatesLayer, errorLayerNotFound, errorLayerDateMissing } from '../actions/daterangelabel';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';

const updateDateLabelEpic = (action$, store) =>
    action$.ofType(LAYER_LOAD)
        .mergeMap(({layerId}) => {
            const currentState = store.getState();
            const layers = currentState.layers?.flat || [];
            const variabiliMeteo = currentState.daterangelabel.variabiliMeteo;
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
            return Observable.of(updateDatesLayer(layerId, fromData, toData));
        });

export default updateDateLabelEpic;

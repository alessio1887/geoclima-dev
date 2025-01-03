/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { LAYER_LOAD } from '@mapstore/actions/layers';
import { updateRangeLabelDates, errorLayerNotFound, errorLayerDateMissing } from '../actions/daterangelabel';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import defaultConfig from '../../configs/pluginsConfig.json';

const updateDateLabelEpic = (action$, store) =>
    action$.ofType(LAYER_LOAD)
        .mergeMap(({layerId}) => {
            const currentState = store.getState();
            const layers = currentState.layers?.flat || [];
            const activeLayer = layers.find(layer => layer.id === layerId);
            if (!activeLayer) {
                return Observable.of(errorLayerNotFound(layerId));
            }
            const dateRangeLabelConfig = defaultConfig.plugins.find(plugin => plugin.name === "DateRangeLabel");
            if (!isVariabiliMeteoLayer(activeLayer?.name, dateRangeLabelConfig.defaultConfig?.variabiliMeteo)) {
                // do nothing
                return Observable.empty();
            }
            const { fromData, toData } = activeLayer.params || {};
            if (!fromData || !toData) {
                return Observable.of(errorLayerDateMissing(layerId, fromData, toData));
            }
            return Observable.of(updateRangeLabelDates(layerId, fromData, toData));
        });

export default updateDateLabelEpic;

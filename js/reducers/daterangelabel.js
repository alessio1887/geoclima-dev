/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { UPDATE_RANGE_LABEL, SET_VARIABILIMETEO } from '../actions/daterangelabel';

const defaultState = {
    fromData: new Date(),
    toData: new Date()
};

function daterangelabel(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_RANGE_LABEL:
        return {
            ...state,
            fromData: action.fromData,
            toData: action.toData
        };
    case SET_VARIABILIMETEO:
        return {
            ...state,
            variabiliMeteo: action.variabiliMeteo
        };
    default:
        return state;
    }
}

export default daterangelabel;

/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { LAYER_LOADING, LAYER_LOAD, LAYER_ERROR} from '@mapstore/actions/layers';
import moment from 'moment';
import {FROMDATA_CHANGED, TODATA_CHANGED, OPEN_ALERT, CLOSE_ALERT} from '../actions/freerangepicker';

const defaultState = {
    fromData: new Date(moment().subtract(1, 'month')._d),
    toData: new Date(moment().subtract(1, 'day')._d),
    showModal: false,
    imgSrc: "",
    map: "geoclima",
    alertMessage: null
};

function freerangepicker(state = defaultState, action) {
    switch (action.type) {
    case FROMDATA_CHANGED:
        return {
            ...state,
            fromData: action.fromData,
            toData: state.toData,
            map: state.map
        };
    case TODATA_CHANGED:
        return {
            ...state,
            fromData: state.fromData,
            toData: action.toData,
            map: state.map
        };
    case OPEN_ALERT:
        return {
            ...state,
            alertMessage: action.alertMessage
        };
    case CLOSE_ALERT:
        return {
            ...state,
            alertMessage: null
        };
    case LAYER_LOADING:
        return {
            ...state,
            isInteractionDisabled: true
        };
    case LAYER_LOAD:
    case LAYER_ERROR:
        return {
            ...state,
            isInteractionDisabled: false
        };
    default:
        return state;
    }
}

export default freerangepicker;

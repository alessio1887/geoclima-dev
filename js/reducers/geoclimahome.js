/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import moment from 'moment';
import {FROMDATA_CHANGED, TODATA_CHANGED, CLICK_THUMBNAIL_HOME} from '../actions/geoclimahome';

const defaultState = {
    fromData: new Date(moment().subtract(1, 'day')._d),
    toData: new Date(moment().subtract(1, 'day')._d),
    showModal: false,
    imgSrc: "",
    map: "geoclima"
};

function geoclimahome(state = defaultState, action) {
    switch (action.type) {
    case FROMDATA_CHANGED:
        return {
            fromData: action.fromData,
            toData: state.toData,
            showModal: false,
            imgSrc: "",
            map: state.map
        };
    case TODATA_CHANGED:
        return {
            fromData: state.fromData,
            toData: action.toData,
            showModal: false,
            imgSrc: "",
            map: state.map
        };
    case CLICK_THUMBNAIL_HOME:
        return {
            fromData: action.fromData,
            toData: action.toData,
            showModal: action.showModal,
            imgSrc: action.imgSrc,
            map: state.map
        };
    default:
        return state;
    }
}

export default geoclimahome;

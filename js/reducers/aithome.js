/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {MAP_YEAR_CHANGED, MAP_PERIOD_CHANGED, TOGGLE_PLUGIN, OPEN_ALERT, CLOSE_ALERT } from '../actions/aithome';
import DateAPI from '../utils/ManageDateUtils';

const defaultState = {
    periodType: "1",
    fromData: new Date(DateAPI.calculateDateFromKeyReal("1").fromData),
    toData: new Date(DateAPI.calculateDateFromKeyReal("1").toData),
    showModal: false,
    imgSrc: "",
    // map: "/opt/ait/ait.map"
    map: "geoclima",
    showFixedRangePicker: true
};

function aithome(state = defaultState, action) {
    switch (action.type) {
    case MAP_YEAR_CHANGED:
        return {
            fromData: new Date(DateAPI.calculateDateFromKeyReal(state.periodType, action.toData).fromData),
            toData: new Date(DateAPI.calculateDateFromKeyReal(state.periodType, action.toData).toData),
            periodType: state.periodType,
            showModal: false,
            imgSrc: "",
            map: state.map,
            showFixedRangePicker: state.showFixedRangePicker,
            alertMessage: null
        };
    case MAP_PERIOD_CHANGED:
        return {
            fromData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType, state.toData).fromData),
            toData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType, state.toData).toData),
            periodType: action.periodType,
            showModal: false,
            imgSrc: "",
            map: state.map,
            showFixedRangePicker: state.showFixedRangePicker,
            alertMessage: null
        };
    case TOGGLE_PLUGIN:
        return {
            ...state,
            showFixedRangePicker: !state.showFixedRangePicker
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
    default:
        return state;
    }
}

export default aithome;

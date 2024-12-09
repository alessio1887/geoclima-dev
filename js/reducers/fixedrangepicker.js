/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { LAYER_LOADING, LAYER_LOAD, LAYER_ERROR} from '@mapstore/actions/layers';
import {TODATA_CHANGED, MAP_PERIOD_CHANGED, TOGGLE_PLUGIN, OPEN_ALERT, CLOSE_ALERT,
    PLUGIN_LOADED, PLUGIN_NOT_LOADED, COLLAPSE_RANGE_PICKER } from '../actions/fixedrangepicker';
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';

const defaultState = {
    isCollapsedPlugin: false,
    periodType: "1",
    fromData: FROM_DATA,
    toData: TO_DATA,
    showModal: false,
    imgSrc: "",
    map: "geoclima",
    showFixedRangePicker: false,
    isInteractionDisabled: false,
    isPluginLoaded: false
};

function fixedrangepicker(state = defaultState, action) {
    switch (action.type) {
    case TODATA_CHANGED:
        return {
            ...state,
            fromData: new Date(DateAPI.calculateDateFromKeyReal(state.periodType, action.toData).fromData),
            toData: new Date(DateAPI.calculateDateFromKeyReal(state.periodType, action.toData).toData),
            periodType: state.periodType
        };
    case MAP_PERIOD_CHANGED:
        return {
            ...state,
            fromData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType, state.toData).fromData),
            toData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType, state.toData).toData),
            periodType: action.periodType
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
    case COLLAPSE_RANGE_PICKER:
        return {
            ...state,
            isCollapsedPlugin: !state.isCollapsedPlugin
        };
    case PLUGIN_LOADED:
        return {
            ...state,
            isPluginLoaded: true
        };
    case PLUGIN_NOT_LOADED:
        return {
            ...state,
            isPluginLoaded: false
        };
    default:
        return state;
    }
}

export default fixedrangepicker;

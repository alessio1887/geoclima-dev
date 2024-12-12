/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { LAYER_LOADING, LAYER_LOAD, LAYER_ERROR} from '@mapstore/actions/layers';
import {TODATA_CHANGED, MAP_PERIOD_CHANGED, TOGGLE_PLUGIN, OPEN_ALERT, CLOSE_ALERT,
    PLUGIN_LOADED, PLUGIN_NOT_LOADED, COLLAPSE_RANGE_PICKER, SET_SELECT_DATE } from '../actions/fixedrangepicker';
import DateAPI, { DEFAULT_DATA_FINE, DEFAULT_DATA_INIZIO } from '../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const defaultState = {
    isCollapsedPlugin: false,
    periodType: "1",
    fromData: moment(DEFAULT_DATA_FINE).clone().subtract(1, 'month').startOf('day').toDate(),
    toData: DEFAULT_DATA_FINE,
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
    case SET_SELECT_DATE:
        const newDataFine = action.dataFine || DEFAULT_DATA_FINE;
        const newDataInizio = action.dataInizio || DEFAULT_DATA_INIZIO;
        const newFromData = moment(newDataFine).subtract(1, 'month').toDate();
        return {
            ...state,
            toData: newDataFine,
            fromData: newFromData,
            firstAvalableDate: newDataInizio,
            lastAvalableDate: newDataFine
        };
    default:
        return state;
    }
}

export default fixedrangepicker;

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
import { CHARTVARIABLE_CHANGED, TODATA_FIXEDRANGE_CHANGED, FROMDATA_CHANGED,
    TODATA_CHANGED, CHART_PERIOD_CHANGED, SET_INFOCHART_VISIBILITY, FETCH_INFOCHART_DATA,
    FETCHED_INFOCHART_DATA, RESET_INFO_CHART_DATES, COLLAPSE_RANGE_PICKER,
    OPEN_ALERT, CLOSE_ALERT, SET_CHART_RELAYOUT, RESET_CHART_RELAYOUT, RESIZE_INFOCHART, SET_RANGE_MANAGER } from '../actions/infochart';
import DateAPI, { FROM_DATA, TO_DATA, PERIOD_TYPES } from '../utils/ManageDateUtils';
import assign from 'object-assign';

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: FROM_DATA,
        toData: TO_DATA,
        variable: { "id": "prec", "name": "Precipitazione cumulata"},
        latlng: {lat: 0, lng: 0},
        periodType: PERIOD_TYPES[0].key
    },
    data: [],
    maskLoading: true,
    variable: "prec",
    fromData: FROM_DATA,
    toData: TO_DATA,
    periodType: PERIOD_TYPES[0].key,
    isCollapsedFormGroup: false,
    activeRangeManager: FREE_RANGE,
    alertMessage: null,
    chartRelayout: {
        startDate: null,
        endDate: null,
        variabileStart: null,
        variabileEnd: null,
        dragmode: null
    },
    infoChartSize: {
        widthResizable: 880,
        heightResizable: 880
    }
};

function infochart(state = infoChartDefaultState, action) {
    switch (action.type) {
    case CHARTVARIABLE_CHANGED:
        return {
            ...state,
            variable: action.variable.id
        };
    case TODATA_CHANGED:
        return {
            ...state,
            toData: action.toData
        };
    case FROMDATA_CHANGED:
        return {
            ...state,
            fromData: action.fromData
        };
    case TODATA_FIXEDRANGE_CHANGED:
        return {
            ...state,
            fromData: new Date(DateAPI.calculateDateFromKeyReal(state.periodType, action.toData).fromData),
            toData: action.toData
        };
    case CHART_PERIOD_CHANGED:
        return {
            ...state,
            fromData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType, state.toData).fromData),
            periodType: action.periodType
        };
    case SET_INFOCHART_VISIBILITY: {
        return assign({}, state, {showInfoChartPanel: action.status, data: action.data, maskLoading: action.maskLoading});
    }
    case FETCH_INFOCHART_DATA: {
        return assign({}, state, {
            infoChartData: action.params,
            data: [],
            maskLoading: action.maskLoading,
            isInteractionDisabled: !state.isInteractionDisabled,
            variable: action.params.variable
        });
    }
    case FETCHED_INFOCHART_DATA: {
        return assign({}, state, {data: action.data, maskLoading: action.maskLoading, isInteractionDisabled: !state.isInteractionDisabled});
    }
    case COLLAPSE_RANGE_PICKER: {
        return {
            ...state,
            isCollapsedFormGroup: !state.isCollapsedFormGroup
        };
    }
    case SET_RANGE_MANAGER: {
        return {
            ...state,
            activeRangeManager: action.rangeManager
        };
    }
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
    case RESET_INFO_CHART_DATES: {
        return { ...infoChartDefaultState }; // Creates and returns a copy of the object
    }
    case SET_CHART_RELAYOUT:
        return {
            ...state,
            chartRelayout: {
                ...state.chartRelayout,
                ...action.chartRelayout
            }
        };
    case RESET_CHART_RELAYOUT:
        return {
            ...state,
            chartRelayout: {}
        };
    case RESIZE_INFOCHART:
        return  {
            ...state,
            infoChartSize: {
                widthResizable: action.widthResizable,
                heightResizable: action.heightResizable
            }
        };
    default:
        return state;
    }
}

export default infochart;

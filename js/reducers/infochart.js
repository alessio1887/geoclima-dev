/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FREE_RANGE, FIXED_RANGE } from '@js/utils/VariabiliMeteoUtils';
import { CHARTVARIABLE_CHANGED, TODATA_FIXEDRANGE_CHANGED, FROMDATA_CHANGED,
    TODATA_CHANGED, CHART_PERIOD_CHANGED, SET_INFOCHART_VISIBILITY, FETCH_INFOCHART_DATA,
    FETCHED_INFOCHART_DATA, RESET_INFO_CHART_DATES, COLLAPSE_RANGE_PICKER, SWITCH_RANGE_MANAGER } from '../actions/infochart';
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import assign from 'object-assign';

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: FROM_DATA,
        toData: TO_DATA,
        variable: { "id": "prec", "name": "Precipitazione Minima"},
        latlng: {lat: 0, lng: 0},
        periodType: "1"
    },
    data: [],
    maskLoading: true,
    variable: { "id": "prec", "name": "Precipitazione Minima"},
    fromData: FROM_DATA,
    toData: TO_DATA,
    periodType: "1",
    isCollapsedFormGroup: false,
    activeRangeManager: FIXED_RANGE
};

function infochart(state = infoChartDefaultState, action) {
    switch (action.type) {
    case CHARTVARIABLE_CHANGED:
        return {
            ...state,
            variable: action.variable
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
        return assign({}, state, {infoChartData: action.params, data: [], maskLoading: action.maskLoading, isInteractionDisabled: !state.isInteractionDisabled});
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
    case SWITCH_RANGE_MANAGER: {
        const newRangeManager = state.activeRangeManager === FREE_RANGE ? FIXED_RANGE : FREE_RANGE;
        return {
            ...state,
            activeRangeManager: newRangeManager
        };
    }
    case RESET_INFO_CHART_DATES: {
        return {
            ...state,
            fromData: FROM_DATA,
            toData: TO_DATA,
            periodType: action.periodType,
            variable: { "id": "prec", "name": "Precipitazione Minima"},
            infoChartData: {
                ...state.infoChartData,
                fromData: FROM_DATA,
                toData: TO_DATA,
                periodType: action.periodType,
                variable: { "id": "prec", "name": "Precipitazione Minima"}
            },
            isCollapsedFormGroup: false,
            activeRangeManager: FIXED_RANGE
        };
    }
    default:
        return state;
    }
}

export default infochart;

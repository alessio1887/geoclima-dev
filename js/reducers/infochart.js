/*
 * Copyright 2018, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { CHARTVARIABLE_CHANGED, FROMDATA_CHANGED, TODATA_CHANGED, CHART_PERIOD_CHANGED, SET_INFOCHART_VISIBILITY, FETCH_INFOCHART_DATA, FETCHED_INFOCHART_DATA} from '../actions/infochart';
import moment from 'moment';
import DateAPI from '../utils/ManageDateUtils';
import assign from 'object-assign';

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: new Date(moment().subtract(1, 'month')._d),
        toData: new Date(moment().subtract(1, 'day')._d),
        variable: { "id": "prec", "name": "Precipitazione Minima"},
        latlng: {lat: 0, lng: 0},
        periodType: "1"
    },
    data: [],
    maskLoading: true,
    variable: "prec",
    fromData: new Date(DateAPI.calculateDateFromKeyReal("1").fromData),
    toData: new Date(DateAPI.calculateDateFromKeyReal("1").toData),
    periodType: "1"
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
    case CHART_PERIOD_CHANGED:
        return {
            ...state,
            fromData: new Date(DateAPI.calculateDateFromKeyReal(action.periodType).fromData),
            periodType: action.periodType
        };
    case SET_INFOCHART_VISIBILITY: {
        return assign({}, state, {showInfoChartPanel: action.status, data: action.data, maskLoading: action.maskLoading});
    }
    case FETCH_INFOCHART_DATA: {
        return assign({}, state, {infoChartData: action.params, data: [], maskLoading: action.maskLoading});
    }
    case FETCHED_INFOCHART_DATA: {
        return assign({}, state, {data: action.data, maskLoading: action.maskLoading});
    }
    default:
        return state;
    }
}

export default infochart;

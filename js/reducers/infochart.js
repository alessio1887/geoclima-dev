/*
 * Copyright 2018, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {SET_INFOCHART_VISIBILITY, FETCH_INFOCHART_DATA, FETCHED_INFOCHART_DATA} from '../actions/infochart';
import moment from 'moment';
import DateAPI from '../utils/ManageDateUtils';
import assign from 'object-assign';

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: new Date(DateAPI.calculateDateFromKey("10", moment().subtract(1, 'day')._d).fromData),
        toData: new Date(DateAPI.calculateDateFromKey("1", moment().subtract(1, 'day')._d).toData),
        variable: "prec",
        latlng: {lat: 0, lng: 0},
        fromDataReal: new Date(DateAPI.calculateDateFromKeyReal("10", moment().subtract(1, 'day')._d).fromData),
        toDataReal: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        periodType: "1"

    },
    data: [],
    maskLoading: true
};

function infochart(state = infoChartDefaultState, action) {
    switch (action.type) {
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

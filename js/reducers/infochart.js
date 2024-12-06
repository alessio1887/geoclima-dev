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
    FETCHED_INFOCHART_DATA, COLLAPSE_RANGE_PICKER,
    OPEN_ALERT, CLOSE_ALERT, SET_CHART_RELAYOUT, RESET_CHART_RELAYOUT, RESIZE_INFOCHART,
    SET_RANGE_MANAGER, SET_IDVARIABILI_LAYERS, SET_DEFAULT_URL, SET_DEFAULT_DATES } from '../actions/infochart';
import DateAPI, { PERIOD_TYPES } from '../utils/ManageDateUtils';
import assign from 'object-assign';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: moment().subtract(1, 'month').startOf('day').toDate(),
        toData: moment().subtract(1, 'day').startOf('day').toDate(),
        variable: PERIOD_TYPES[0],
        latlng: {lat: 0, lng: 0},
        periodType: PERIOD_TYPES[0]
    },
    data: [],
    maskLoading: true,
    variable: "prec",
    fromData: moment().subtract(1, 'month').startOf('day').toDate(),
    toData: moment().subtract(1, 'day').startOf('day').toDate(),
    periodType: PERIOD_TYPES[0],
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
    },
    idVariabiliLayers: {
        "prec": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima"],
        "tmed": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Media_clima"],
        "tmin": ["Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Minima_clima"],
        "tmax": [ "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Massima_clima"],
        "ret": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
        "bis": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
            "BilancioIdricoSemplificato_clima"]
    },
    defaultUrlGeoclimaChart: 'geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/geoclima_chart.py',
    lastAvailableToData: moment().subtract(1, 'day').startOf('day').toDate()
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
    case SET_IDVARIABILI_LAYERS:
        return {
            ...state,
            idVariabiliLayers: action.idVariabiliLayers
        };
    case SET_DEFAULT_URL:
        return {
            ...state,
            defaultUrlGeoclimaChart: action.defaultUrlGeoclimaChart
        };
    case SET_DEFAULT_DATES:
        const newToData = action.toData;
        const newFromData = moment(newToData).subtract(1, 'month').toDate();
        return {
            ...state,
            toData: newToData,
            fromData: newFromData,
            lastAvailableToData: newToData,
            infoChartData: {
                ...state.infoChartData,
                toData: newToData,
                fromData: newFromData,
                periodType: action.periodTypes[0]
            }
        };
    default:
        return state;
    }
}

export default infochart;

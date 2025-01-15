/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { FETCHED_AVAILABLE_DATES } from '../actions/updateDatesParams';
import {CHARTVARIABLE_CHANGED, TAB_CHANGED, TODATA_FIXEDRANGE_CHANGED, FROMDATA_CHANGED,
    TODATA_CHANGED, CHART_PERIOD_CHANGED, SET_INFOCHART_VISIBILITY, FETCH_INFOCHART_DATA,
    FETCHED_INFOCHART_DATA, COLLAPSE_RANGE_PICKER,  OPEN_ALERT, CLOSE_ALERT, SET_CHART_RELAYOUT, RESET_CHART_RELAYOUT, RESIZE_INFOCHART,
    SET_RANGE_MANAGER, SET_IDVARIABILI_LAYERS, SET_DEFAULT_URL, SET_DEFAULT_DATES, INITIALIZE_TABS,
    PLUGIN_LOADED, PLUGIN_NOT_LOADED, SET_TABLIST, SET_TIMEUNIT } from '../actions/infochart';
import DateAPI, { DATE_FORMAT, DEFAULT_DATA_FINE, DEFAULT_DATA_INIZIO, PERIOD_TYPES } from '../utils/ManageDateUtils';
import assign from 'object-assign';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const infoChartDefaultState = {
    showInfoChartPanel: false,
    infoChartData: {
        fromData: moment().subtract(1, 'month').startOf('day').toDate(),
        toData: DEFAULT_DATA_FINE,
        variables: "prec",
        latlng: {lat: 0, lng: 0},
        periodType: PERIOD_TYPES[0].key
    },
    data: [],
    maskLoading: true,
    fromData: moment().subtract(1, 'month').startOf('day').toDate(),
    toData: DEFAULT_DATA_FINE,
    periodType: PERIOD_TYPES[0].key,
    isCollapsedFormGroup: false,
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
    firstAvailableDate: DEFAULT_DATA_INIZIO,
    lastAvailableDate: DEFAULT_DATA_FINE,
    // timeUnit: DATE_FORMAT,
    tabVariables: [
        {
            id: "variableList",
            variables: [{ "id": "prec", "name": "Precipitazione", "unit": "mm", "yaxis": "Valore (mm)" }],
            active: true
        },
        {
            id: "spiList",
            variables: [{ id: "spi1", name: "SPI-1" }],
            active: false
        },
        {
            id: "speiList",
            variables: [{ id: "spei1", name: "SPEI-1" }],
            active: false
        }
    ]
};

function infochart(state = infoChartDefaultState, action) {
    switch (action.type) {
    case CHARTVARIABLE_CHANGED:
        return {
            ...state,
            tabVariables: state.tabVariables.map(tab =>
                tab.id === action.idTab
                    ? { ...tab, variables: action.variables } // Aggiorna le variabili del tab corrispondente
                    : tab
            )

        };
    case TAB_CHANGED:
        return {
            ...state,
            tabVariables: state.tabVariables.map(tab => ({
                ...tab,
                active: tab.id === action.idTab // Imposta true solo per il tab con id uguale a idTab
            }))
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
            isInteractionDisabled: !state.isInteractionDisabled
        });
    }
    case FETCHED_INFOCHART_DATA: {
        return assign({}, state, {
            data: action.data,
            maskLoading: action.maskLoading,
            isInteractionDisabled: !state.isInteractionDisabled
        });
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
    case SET_TABLIST:
        return {
            ...state,
            tabList: action.tabList
        };
    case FETCHED_AVAILABLE_DATES:
        return {
            ...state,
            firstAvailableDate: action.dataInizio,
            lastAvailableDate: action.dataFine
        };
    case SET_TIMEUNIT:
        return {
            ...state,
            timeUnit: action.timeUnit
        };
    case SET_DEFAULT_DATES:
        const newToData = action.toData || moment().subtract(1, 'day').startOf('day').toDate();
        const newFromData = moment(newToData).subtract(1, 'month').toDate();
        return {
            ...state,
            toData: newToData,
            fromData: newFromData,
            infoChartData: {
                ...state.infoChartData,
                toData: newToData,
                fromData: newFromData,
                periodType: action.periodTypes?.[0] || PERIOD_TYPES[0]
            }
        };
    case INITIALIZE_TABS:
        return {
            ...state,
            tabVariables: action.tabVariables
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

export default infochart;

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {connect} from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import {setInfoChartVisibility, changeFixedRangeToData, fetchInfoChartData, fetchedInfoChartData, toggleInfoChart,
    changeChartVariable, changePeriod, changeFromData, changeToData, setDefaultDates, collapseRangePicker,
    openAlert, closeAlert, setChartRelayout, resetChartRelayout, resizeInfoChart, setIdVariabiliLayers,
    setRangeManager, setDefaultUrlGeoclimaChart, setTimeUnit, changeChartType,
    markInfoChartAsLoaded, changeTab, setTabList, initializeVariableTabs } from '../actions/infochart';
import { removeAdditionalLayer  } from '@mapstore/actions/additionallayers';
import InfoChartButton from '../components/buttons/InfoChartButton';
import InfoChart from '../components/infochart/InfoChart';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import infoChartReducer from '../reducers/infochart';
import { fetchSelectDate } from '@js/actions/updateDatesParams';
import * as infoChartEpic from '../epics/infochart';
import assign from 'object-assign';
import { FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
import { isPluginLoadedSelector, fromDataFormSelector, toDataFormSelector,
    firstAvailableDateSelector, lastAvailableDateSelector } from '../selectors/infoChart';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

/*
Plugin configuration
"name": "InfoChart",
      "defaultConfig": {
         "defaultUrlGeoclimaChart": "geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/geoclima_chart_test.py",
         "defaultUrlSelectDate": "geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/selectDate.py",
         "variabileSelectDate": "prec",
         "isFetchAvailableDates": false,
        "periodTypes": [
          { "key": "a", "label": "7 giorni", "max": 6 },
          { "key": "b", "label": "10 giorni", "max": 9, "isDefault": true  },
          { "key": "c", "label": "30 giorni", "max": 29 },
          { "key": "d", "label": "90 giorni", "max": 89 },
          { "key": "e", "label": "180 giorni", "max": 179 },
          { "key": "f", "label": "365 giorni", "max": 364 }
      ],
          "tabList": [
            {"id": "variableList", "name": "Variabili Meteo", "groupList": [
                                                                  { "id": "prec", "name": "Precipitazione", "unit": "mm", "yaxis": "Valore (mm)" },
                                                                  { "id": "tmed", "name": "Temperatura Media", "unit": "°C", "yaxis": "Temperatura (°C)"  },
                                                                  { "id": "tmax", "name": "Temperatura Massima", "unit": "°C", "yaxis": "Temperatura (°C)"  },
                                                                  { "id": "tmin", "name": "Temperatura Minima", "unit": "°C", "yaxis": "Temperatura (°C)"  },
                                                                  { "id": "ret", "name": "Evapotraspirazione Potenziale", "unit": "mm", "yaxis": "Valore (mm)"  },
                                                                  { "id": "bis", "name": "Bilancio Idrico Semplificato", "unit": "mm", "yaxis": "Valore (mm)"  }
                                                              ],
                                                          "menuType": "single_select",
                                                          "chartType": "single_variable"
              },
            {"id": "spiList", "name": "SPI", "groupList": [
                                                                  { "id": "spi1", "name": "SPI-1" },
                                                                  { "id": "spi3", "name": "SPI-3" },
                                                                  { "id": "spi6", "name": "SPI-6" },
                                                                  { "id": "spi12", "name": "SPI-12" }
                                                                ],
                                                          "chartTitle": "Indice SPI - Standardized Precipitation Index",
                                                          "menuType": "multi_select",
                                                          "chartType": "multi_variable"
              },
            {"id": "speiList", "name": "SPEI", "groupList": [
                                                                    { "id": "spei1", "name": "SPEI-1" },
                                                                    { "id": "spei3", "name": "SPEI-3" },
                                                                    { "id": "spei6", "name": "SPEI-6" },
                                                                    { "id": "spei12", "name": "SPEI-12" }
                                                          ],
                                                          "chartTitle": "Indice SPEI - Standardized Precipitation-Evapotranspiration Index",
                                                          "menuType": "multi_select",
                                                          "chartType": "multi_variable"
            }
          ],
          "idVariabiliLayers": {
            "prec": [
              "Pioggia_Anomalia_perc",
              "Pioggia_Anomalia_mm",
              "Pioggia_Cumulata",
              "Pioggia_Cumulata_clima",
              "Pioggia_Cumulata_Giornaliera",
              "Prec_stazioni",
              "Prec_stazioni_non_utilizzate"],
            "tmed": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Media_clima","Vven_stazioni",
              "Vven_stazioni_non_utilizzate",
              "Umidita_media_giornaliera",
              "Umid_stazioni",
              "Umid_stazioni_non_utilizzate",
              "Pressione_Mare_Giornaliera",
              "Pressione_Suolo_Giornaliera",
              "Mslp_stazioni",
              "Mslp_stazioni_non_utilizzate",
              "Radiazione_Globale_Giornaliera",
              "Evapotraspirazione_Potenziale_Giornaliera"],
            "tmin": ["Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Minima_clima", "Temperatura_Minima_Giornaliera","Tmin_stazioni",
              "Tmin_stazioni_non_utilizzate"],
            "tmax": [ "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Massima_clima",
              "Temperatura_Massima_Giornaliera",
              "Tmax_stazioni",
              "Tmax_stazioni_non_utilizzate"],
            "ret": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            "bis": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                    "BilancioIdricoSemplificato_clima"],
            "spi1": ["spi1"],
            "spi3": ["spi3"],
            "spi6": ["spi6"],
            "spi12": ["spi12"],
            "spei1": ["spei1"],
            "spei3": ["spei3"],
            "spei6": ["spei6"],
            "spei12": ["spei12"]
          },
          "timeUnit": "YYYY-MM-DD",
          "unitPrecipitazione": "mm",
          "unitTemperatura": "°C"
      },
      "override": {
        "Toolbar": {
          "alwaysVisible": true
        }
      },
      "dependencies": [
        "Toolbar",
        "Expander"
      ]
*/
const mapStateToProps = (state) => ({
    active: state && state.controls && state.controls.chartinfo && state.controls.chartinfo.enabled
});

const mapDispatchToProps = {
    onClick: (pressed, options) => toggleInfoChart(pressed, options.querySelector)
};

const InfoChartPlugin = connect(
    mapStateToProps,
    mapDispatchToProps
)(InfoChartButton);

const InfoChartPanel = connect(
    createStructuredSelector({
        active: (state) => state.controls?.chartinfo?.enabled || false,
        activeRangeManager: (state) => state.infochart?.activeRangeManager || FREE_RANGE,
        alertMessage: (state) => state.infochart?.alertMessage || null,
        data: (state) => state.infochart?.data || '',
        infoChartData: (state) => ({
            fromData: state.infochart?.infoChartData?.fromData,
            toData: state.infochart?.infoChartData?.toData,
            variables: state.infochart?.infoChartData?.variables,
            latlng: state.infochart?.infoChartData?.latlng || {},
            periodType: state.infochart?.infoChartData?.periodType,
            idTab: state.infochart?.infoChartData?.idTab
        }),
        mapinfoActive: (state) => state.mapInfo?.enabled || false,
        maskLoading: (state) => state.infochart?.maskLoading,
        fromData: fromDataFormSelector,
        periodType: (state) => state.infochart?.periodType,
        isInteractionDisabled: (state) => state.infochart?.isInteractionDisabled || false,
        isCollapsedFormGroup: (state) => state.infochart?.isCollapsedFormGroup || false,
        chartRelayout: (state) => state.infochart?.chartRelayout,
        infoChartSize: (state) => state.infochart?.infoChartSize || { widthResizable: 880, heightResizable: 880 },
        firstAvailableDate: firstAvailableDateSelector,
        lastAvailableDate: lastAvailableDateSelector,
        isPluginLoaded: isPluginLoadedSelector,
        show: (state) => state.infochart?.showInfoChartPanel || false,
        tabVariables: (state) => state.infochart?.tabVariables,
        toData: toDataFormSelector
    }), {
        onFetchAvailableDates: fetchSelectDate,
        onFetchInfoChartData: fetchInfoChartData,
        onFetchedInfoChartData: fetchedInfoChartData,
        onChangeChartVariable: changeChartVariable,
        onChangeTab: compose(changeTab, (event) => event),
        onChangeChartType: changeChartType,
        onChangeToData: compose(changeToData, (event) => event),
        onChangeFromData: compose(changeFromData, (event) => event),
        onChangeFixedRangeTodata: compose(changeFixedRangeToData, (event) => event),
        onChangePeriod: changePeriod,
        onSetInfoChartDates: setDefaultDates,
        onSetInfoChartVisibility: setInfoChartVisibility,
        onSetTimeUnit: setTimeUnit,
        onCollapseRangePicker: collapseRangePicker,
        onInitializeVariableTabs: initializeVariableTabs,
        onSetRangeManager: setRangeManager,
        onSetTabList: setTabList,
        onOpenAlert: openAlert,
        onCloseAlert: closeAlert,
        onSetChartRelayout: compose(setChartRelayout, (event) => event),
        onResetChartRelayout: resetChartRelayout,
        onResizeInfoChart: resizeInfoChart,
        onSetIdVariabiliLayers: setIdVariabiliLayers,
        onSetDefaultUrlGeoclimaChart: setDefaultUrlGeoclimaChart,
        onMarkPluginAsLoaded: markInfoChartAsLoaded,
        onHideMapinfoMarker: removeAdditionalLayer
    })(InfoChart);


export default createPlugin(
    'InfoChartPlugin',
    {
        component: assign(InfoChartPlugin, {
            Toolbar: {
                name: "infochart",
                position: 8,
                alwaysVisible: true,
                tool: true,
                priority: 1,
                tools: [InfoChartPanel],
                panel: InfoChartPanel
            }
        }),
        reducers: {
            infochart: infoChartReducer
        },
        epics: infoChartEpic
    }
);

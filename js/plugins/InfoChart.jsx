/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {connect} from 'react-redux';
import { compose } from 'redux';
import {setInfoChartVisibility, changeFixedRangeToData, fetchInfoChartData, fetchedInfoChartData, toggleInfoChart,
    changeChartVariable, changePeriod, changeFromData, changeToData, setDefaultDates, collapseRangePicker,
    openAlert, closeAlert, setChartRelayout, resetChartRelayout, resizeInfoChart, setIdVariabiliLayers,
    setRangeManager, setDefaultUrlGeoclimaChart, checkLaunchSelectDateQuery, setTimeUnit,
    markInfoChartAsLoaded, changeTab, setTabList, initializeVariableTabs } from '../actions/infochart';
import { hideMapinfoMarker } from '@mapstore/actions/mapInfo';
import InfoChartButton from '../components/buttons/InfoChartButton';
import InfoChart from '../components/infochart/InfoChart';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import infoChartReducer from '../reducers/infochart';
import * as infoChartEpic from '../epics/infochart';
import assign from 'object-assign';
import { FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
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
         "periodTypes": [
              { "key": "1", "label": "1 Mese" },
              { "key": "3", "label": "3 Mesi" },
              { "key": "4", "label": "4 Mesi" },
              { "key": "6", "label": "6 Mesi" },
              { "key": "12", "label": "12 Mesi" },
              { "key": "10", "label": "dal 1° Ottobre" }
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
                                                          "menuType": "single_select", // The type of variable selection for this tab menu: single variable (single_select) or multiple variables selected (multi_select)
                                                          "chartType": "single_variable" // The chart type: 'single_variable' for a chart with one variable, 'multi_variable' for multiple variables (specific for layout in InfoChartRender)
              },
            {"id": "spiList", "name": "SPI", "groupList": [
                                                                  { "id": "spi1", "name": "SPI-1" },
                                                                  { "id": "spi3", "name": "SPI-3" },
                                                                  { "id": "spi6", "name": "SPI-6" },
                                                                  { "id": "spi12", "name": "SPI-12" }
                                                                ],
                                                          "chartTitle": "Indice SPI - Standardized Precipitation Index",
                                                          "menuType": "multi_select", // The type of variable selection for this tab menu: single variable (single_select) or multiple variables selected (multi_select)
                                                          "chartType": "multi_variable"  // The chart type: 'single_variable' for a chart with one variable, 'multi_variable' for multiple variables (specific for layout in InfoChartRender)
              },
            {"id": "speiList", "name": "SPEI", "groupList": [
                                                                    { "id": "spei1", "name": "SPEI-1" },
                                                                    { "id": "spei3", "name": "SPEI-3" },
                                                                    { "id": "spei6", "name": "SPEI-6" },
                                                                    { "id": "spei12", "name": "SPEI-12" }
                                                          ],
                                                          "chartTitle": "Indice SPEI - Standardized Precipitation-Evapotranspiration Index",
                                                          "menuType": "multi_select", // The type of variable selection for this tab menu: single variable (single_select) or multiple variables selected (multi_select)
                                                          "chartType": "multi_variable" // The chart type: 'single_variable' for a chart with one variable, 'multi_variable' for multiple variables (specific for layout in InfoChartRender)
            }
          ],
          "idVariabiliLayers": {
            "prec": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima"],
            "tmed": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Media_clima"],
            "tmin": ["Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Minima_clima"],
            "tmax": [ "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Massima_clima"],
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
      }
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

const InfoChartPanel = connect((state) => ({
    active: state.controls?.chartinfo?.enabled || false,
    activeRangeManager: state.infochart?.activeRangeManager || FREE_RANGE,
    alertMessage: state.infochart?.alertMessage || null,
    data: state.infochart?.data || '',
    infoChartData: {
        fromData: state.infochart?.infoChartData?.fromData,
        toData: state.infochart?.infoChartData?.toData,
        variables: state.infochart?.infoChartData?.variables,
        latlng: state.infochart?.infoChartData?.latlng || {},
        periodType: state.infochart?.infoChartData?.periodType,
        idTab: state.infochart?.infoChartData?.idTab
    },
    mapinfoActive: state.mapInfo?.enabled || false,
    maskLoading: state.infochart?.maskLoading,
    // Initializes 'fromData' based on Infochart's date range; defaults to a calculated date if missing
    fromData: state.infochart?.fromData,
    periodType: state.infochart?.periodType,
    isInteractionDisabled: state.infochart?.isInteractionDisabled || false,
    isCollapsedFormGroup: state.infochart?.isCollapsedFormGroup || false,
    chartRelayout: state.infochart?.chartRelayout,
    infoChartSize: state.infochart?.infoChartSize || { widthResizable: 880, heightResizable: 880 },
    firstAvailableDate: state?.infochart?.firstAvailableDate,
    lastAvailableDate: state?.infochart?.lastAvailableDate,
    isPluginLoaded: state?.infochart?.isPluginLoaded,
    show: state.infochart && state.infochart.showInfoChartPanel || false,
    tabVariables: state.infochart?.tabVariables,
    // Initializes 'toData' based on Infochar's date range; defaults to a calculated date if missing
    toData: state.infochart?.toData
}), {
    onSetInfoChartVisibility: setInfoChartVisibility,
    onSetTimeUnit: setTimeUnit,
    onFetchInfoChartData: fetchInfoChartData,
    onFetchedInfoChartData: fetchedInfoChartData,
    onChangeChartVariable: changeChartVariable,
    onChangeTab: compose(changeTab, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeFixedRangeTodata: compose(changeFixedRangeToData, (event) => event),
    onChangePeriod: changePeriod,
    onSetInfoChartDates: setDefaultDates,
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
    onCheckFetchAvailableDates: checkLaunchSelectDateQuery,
    onMarkPluginAsLoaded: markInfoChartAsLoaded,
    onHideMapinfoMarker: hideMapinfoMarker
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

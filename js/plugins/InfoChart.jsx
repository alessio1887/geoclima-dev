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
    setRangeManager, setDefaultUrlGeoclimaChart, checkLaunchSelectDateQuery,
    markInfoChartAsLoaded } from '../actions/infochart';
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
"name":"InfoChart",
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
          "variabiliMeteo": {
            "precipitazione": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima","Pioggia_Cumulata_Giornaliera"],
            "temperatura": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Minima", "Temperatura_Minima_Anomalia",
                    "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Media_clima", "Temperatura_Massima_clima", "Temperatura_Minima_clima"],
            "evapotraspirazione": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            "bilancioIdricoSemplificato": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                    "BilancioIdricoSemplificato_clima"],
            "spi": [ "spi1", "spi3", "spi6", "spi12"],
            "spei":[ "spei1", "spei3", "spei6", "spei12"]
          },
          "variableList": [
            { "id": "prec", "name": "Precipitazione" },
            { "id": "tmed", "name": "Temperatura Media" },
            { "id": "tmax", "name": "Temperatura Massima" },
            { "id": "tmin", "name": "Temperatura Minima" },
            { "id": "ret", "name": "Evapotraspirazione Potenziale" },
            { "id": "bis", "name": "Bilancio Idrico Semplificato" }
          ],
          "spiList": [ "spi1", "spi3", "spi6", "spi12"],
          "speiList": [ "spei1", "spei3", "spei6", "spei12"],
          "idVariabiliLayers": {
            "prec": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima"],
            "tmed": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Media_clima"],
            "tmin": ["Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Minima_clima"],
            "tmax": [ "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Massima_clima"],
            "ret": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            "bis": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                    "BilancioIdricoSemplificato_clima"]
          },
          "variablePrecipitazione": "prec",
          "variableEvotrasporazione": "ret",
          "variableTemperaturaList": [
            "tmed",
            "tmax",
            "tmin"
          ]
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

const InfoChartPanel = connect((state) => ({
    show: state.infochart && state.infochart.showInfoChartPanel || false,
    infoChartData: {
        fromData: state.infochart?.infoChartData?.fromData,
        toData: state.infochart?.infoChartData?.toData,
        variables: state.infochart?.infoChartData?.variables,
        latlng: state.infochart?.infoChartData?.latlng || {},
        periodType: state.infochart?.infoChartData?.periodType
    },
    variables: state.infochart?.variables,
    data: state.infochart?.data || '',
    maskLoading: state.infochart?.maskLoading,
    active: state.controls?.chartinfo?.enabled || false,
    mapinfoActive: state.mapInfo?.enabled || false,
    // Initializes 'fromData' based on Infochart's date range; defaults to a calculated date if missing
    fromData: state.infochart?.fromData,
    // Initializes 'toData' based on Infochart's date range; defaults to a calculated date if missing
    toData: state.infochart?.toData,
    periodType: state.infochart?.periodType,
    isInteractionDisabled: state.infochart?.isInteractionDisabled || false,
    isCollapsedFormGroup: state.infochart?.isCollapsedFormGroup || false,
    activeRangeManager: state.infochart?.activeRangeManager || FREE_RANGE,
    alertMessage: state.infochart?.alertMessage || null,
    chartRelayout: state.infochart?.chartRelayout,
    infoChartSize: state.infochart?.infoChartSize || { widthResizable: 880, heightResizable: 880 },
    firstAvailableDate: state?.infochart?.firstAvailableDate,
    lastAvailableDate: state?.infochart?.lastAvailableDate,
    isPluginLoaded: state?.infochart?.isPluginLoaded
}), {
    onSetInfoChartVisibility: setInfoChartVisibility,
    onFetchInfoChartData: fetchInfoChartData,
    onFetchedInfoChartData: fetchedInfoChartData,
    onChangeChartVariable: compose(changeChartVariable, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeFixedRangeTodata: compose(changeFixedRangeToData, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onSetInfoChartDates: setDefaultDates,
    onCollapseRangePicker: collapseRangePicker,
    onSetRangeManager: setRangeManager,
    onOpenAlert: openAlert,
    onCloseAlert: closeAlert,
    onSetChartRelayout: compose(setChartRelayout, (event) => event),
    onResetChartRelayout: resetChartRelayout,
    onResizeInfoChart: resizeInfoChart,
    onSetIdVariabiliLayers: setIdVariabiliLayers,
    onSetDefaultUrlGeoclimaChart: setDefaultUrlGeoclimaChart,
    onCheckFetchAvailableDates: checkLaunchSelectDateQuery,
    onMarkPluginAsLoaded: markInfoChartAsLoaded
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

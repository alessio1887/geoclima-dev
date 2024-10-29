/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {connect} from 'react-redux';
import { compose } from 'redux';
import {setInfoChartVisibility, fetchInfoChartData, fetchedInfoChartData, toggleInfoChart, changeChartVariable, changePeriod, changeFromData, changeToData } from '../actions/infochart';
import InfoChartButton from '../components/buttons/InfoChartButton';
import InfoChart from '../components/infochart/InfoChart';
import moment from 'moment';
import DateAPI, { PERIOD_TYPES } from '../utils/ManageDateUtils';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import infoChartReducer from '../reducers/infochart';
import * as infoChartEpic from '../epics/infochart';
import assign from 'object-assign';

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
        fromData: state.infochart?.infoChartData?.fromData || new Date(DateAPI.calculateDateFromKeyReal("10", moment().subtract(1, 'day')._d).fromData),
        toData: state.infochart?.infoChartData?.toData || new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        variable: state.infochart?.infoChartData?.variable || state?.localConfig?.variabileChartPrecipitazione,
        latlng: state.infochart?.infoChartData?.latlng || {},
        periodType: state.infochart?.infoChartData?.periodType || "1",
        periodTypes: state?.localConfig?.periodTypes || PERIOD_TYPES,
        variableList: state?.localConfig?.variabiliChartList
    },
    data: state.infochart?.data || '',
    maskLoading: state.infochart?.maskLoading,
    active: state.controls?.chartinfo?.enabled || false,
    mapinfoActive: state.mapInfo?.enabled || false,
    variabileChartPrecipitazione: state?.localConfig?.variabileChartPrecipitazione,
    variabileChartEvotrasporazione: state?.localConfig?.variabileChartEvotrasporazione,
    variabiliChartTemperatura: state?.localConfig?.variabiliChartTemperatura,
    variable: state.infochart?.variable || state?.localConfig?.variabileChartPrecipitazione,
    // Initializes 'fromData' based on Infochart's date range; defaults to a calculated date if missing
    fromData: state.infochart?.fromData || new Date(DateAPI.calculateDateFromKeyReal("10", moment().subtract(1, 'day')._d).fromData),
    // Initializes 'toData' based on Infochart's date range; defaults to a calculated date if missing
    toData: state.infochart?.toData || new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
    periodType: state.infochart?.periodType || "1"
}), {
    onSetInfoChartVisibility: setInfoChartVisibility,
    onFetchInfoChartData: fetchInfoChartData,
    onFetchedInfoChartData: fetchedInfoChartData,
    onChangeChartVariable: compose(changeChartVariable, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key)
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

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {connect} from 'react-redux';
import {setInfoChartVisibility, fetchInfoChartData, fetchedInfoChartData, toggleInfoChart} from '../actions/infochart';
import InfoChartButton from '../components/buttons/InfoChartButton';
import InfoChart from '../components/infochart/InfoChart';
import moment from 'moment';
import DateAPI, { PERIOD_TYPES } from '../utils/ManageDateUtils';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import infoChartReducer from '../reducers/infochart';
import * as infoChartEpic from '../epics/infochart';
import assign from 'object-assign';

import { PREC } from '../utils/VariabiliMeteoUtils';

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
        fromData: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.fromData || new Date(DateAPI.calculateDateFromKeyReal("10", moment().subtract(1, 'day')._d).fromData),
        toData: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.toData || new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        variable: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.variable || PREC,
        latlng: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.latlng || {},
        periodType: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.periodType || "1",
        periodTypes: state.infochart && state.infochart.infoChartData && state.infochart.infoChartData.periodTypes || PERIOD_TYPES
    },
    data: state.infochart && state.infochart.data || '',
    maskLoading: state.infochart && state.infochart.maskLoading,
    active: state && state.controls && state.controls.chartinfo && state.controls.chartinfo.enabled || false,
    mapinfoActive: state && state.mapInfo && state.mapInfo.enabled || false
}), {
    onSetInfoChartVisibility: setInfoChartVisibility,
    onFetchInfoChartData: fetchInfoChartData,
    onFetchedInfoChartData: fetchedInfoChartData
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

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
    changeChartVariable, changePeriod, changeFromData, changeToData, resetInfoChartDates, collapseRangePicker,
    openAlert, closeAlert, setChartRelayout, resetChartRelayout, resizeInfoChart,
    setRangeManager} from '../actions/infochart';
import InfoChartButton from '../components/buttons/InfoChartButton';
import InfoChart from '../components/infochart/InfoChart';
import { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import infoChartReducer from '../reducers/infochart';
import * as infoChartEpic from '../epics/infochart';
import assign from 'object-assign';
import { FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';

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
        fromData: state.infochart?.infoChartData?.fromData || FROM_DATA,
        toData: state.infochart?.infoChartData?.toData || TO_DATA,
        variable: state.infochart?.infoChartData?.variable,
        latlng: state.infochart?.infoChartData?.latlng || {},
        periodType: state.infochart?.infoChartData?.periodType
    },
    data: state.infochart?.data || '',
    maskLoading: state.infochart?.maskLoading,
    active: state.controls?.chartinfo?.enabled || false,
    mapinfoActive: state.mapInfo?.enabled || false,
    variable: state.infochart?.variable,
    // Initializes 'fromData' based on Infochart's date range; defaults to a calculated date if missing
    fromData: state.infochart?.fromData || FROM_DATA,
    // Initializes 'toData' based on Infochart's date range; defaults to a calculated date if missing
    toData: state.infochart?.toData || TO_DATA,
    periodType: state.infochart?.periodType,
    isInteractionDisabled: state.infochart?.isInteractionDisabled || false,
    isCollapsedFormGroup: state.infochart?.isCollapsedFormGroup || false,
    activeRangeManager: state.infochart?.activeRangeManager || FREE_RANGE,
    alertMessage: state.infochart?.alertMessage || null,
    chartRelayout: state.infochart?.chartRelayout,
    infoChartSize: state.infochart?.infoChartSize || { widthResizable: 880, heightResizable: 880 }
}), {
    onSetInfoChartVisibility: setInfoChartVisibility,
    onFetchInfoChartData: fetchInfoChartData,
    onFetchedInfoChartData: fetchedInfoChartData,
    onChangeChartVariable: compose(changeChartVariable, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeFixedRangeTodata: compose(changeFixedRangeToData, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onResetInfoChartDates: resetInfoChartDates,
    onCollapseRangePicker: collapseRangePicker,
    onSetRangeManager: setRangeManager,
    onOpenAlert: openAlert,
    onCloseAlert: closeAlert,
    onSetChartRelayout: compose(setChartRelayout, (event) => event),
    onResetChartRelayout: resetChartRelayout,
    onResizeInfoChart: resizeInfoChart
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

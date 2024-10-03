/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';

import {Glyphicon, Panel, Grid, FormGroup, ControlLabel} from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

import Dialog from '../../../MapStore2/web/client/components/misc/Dialog';
import BorderLayout from '../../../MapStore2/web/client/components/layout/BorderLayout';
import Plot from '../../../MapStore2/web/client/components/charts/PlotlyChart.jsx';
import moment from 'moment';
import { DateTimePicker, DropdownList } from 'react-widgets';
import DateAPI from '../../utils/ManageDateUtils';

import './infochart.css';
/**
  * Component used to show a panel with the charts data sar
  * @class InfoChart
  * @memberof components
  * @prop {function} onSetInfoChartVisibility
  * @prop {function} onFetchInfoChartData
  * @prop {object} infoChartData
  * @prop {array} data
  * @prop {bool} show
  *
  */
class InfoChart extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        panelClassName: PropTypes.string,
        panelStyle: PropTypes.object,
        closeGlyph: PropTypes.string,
        onSetInfoChartVisibility: PropTypes.func,
        onFetchInfoChartData: PropTypes.func,
        show: PropTypes.bool,
        infoChartData: PropTypes.object,
        maskLoading: PropTypes.bool,
        data: PropTypes.array,
        glyphicon: PropTypes.string,
        text: PropTypes.string,
        btnSize: PropTypes.oneOf(['large', 'small', 'xsmall']),
        btnType: PropTypes.oneOf(['normal', 'image']),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        tooltip: PropTypes.element,
        tooltipPlace: PropTypes.string,
        className: PropTypes.string,
        bsStyle: PropTypes.string,
        style: PropTypes.object,
        onToggleControl: PropTypes.func,
        active: PropTypes.bool,
        mapinfoActive: PropTypes.bool,
        chartStyle: PropTypes.object,
        animated: PropTypes.bool,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        classNameInfoChartDate: PropTypes.string,
        styleInfoChartDate: PropTypes.object,
        onChangeChartDate: PropTypes.func,
        variableList: PropTypes.array,
        periodTypes: PropTypes.array
    }
    static defaultProps = {
        id: "mapstore-sarchart-panel",
        panelClassName: "toolbar-panel portal-dialog",
        panelStyle: {
            width: "880px",
            maxWidth: "880px",
            left: "calc(50% - 440px)",
            height: "fit-content",
            top: "0px"
        },
        closeGlyph: "1-close",
        onSetInfoChartVisibility: () => {},
        onFetchInfoChartData: () => {},
        show: false,
        infoChartData: {},
        maskLoading: true,
        data: [],
        glyphicon: "signal",
        text: undefined,
        btnSize: 'xsmall',
        btnType: 'normal',
        tooltipPlace: "left",
        bsStyle: "primary",
        className: "square-button",
        onToggleControl: () => {},
        active: false,
        mapinfoActive: false,
        chartStyle: {
            margin: {
                top: 5,
                right: 5,
                left: 5,
                bottom: 5
            },
            width: 850,
            height: 400
        },
        animated: true,
        classNameInfoChartDate: "mapstore-infochartdate",
        styleInfoChartDate: {
            top: 0,
            left: "305px",
            position: 'absolute',
            height: '100%'
        },
        onChangeChartDate: () => {},
        variableList: [
            {id: "prec", name: "Precipitazione"},
            {id: "tmed", name: "Temperatura Media"},
            {id: "tmax", name: "Temperatura Massima"},
            {id: "tmin", name: "Temperatura Minima"},
            {id: "ret", name: "Evapotraspirazione Potenziale"},
            {id: "bis", name: "Bilancio Idrico Semplificato"}
        ],
        periodTypes: [
            { key: "1", label: "1 Mese"},
            { key: "3", label: "3 Mesi"},
            { key: "4", label: "4 Mesi"},
            { key: "6", label: "6 Mesi"},
            { key: "12", label: "12 Mesi"},
            { key: "10", label: "dal 1° Ottobre"}
        ]
    }
    shouldComponentUpdate(newProps) {
        return newProps.active
            || newProps.mapinfoActive
            || newProps.data.length > 0;
    }
    // Chart's definition
    showChart = () => {
        if (!this.props.maskLoading) {
            const chartData = this.props.infoChartData.variable === 'prec' || this.props.infoChartData.variable === 'ret'
                ? this.formatDataCum(this.props.data)
                : this.formatDataTemp(this.props.data);

            const climaColor = this.props.infoChartData.variable === 'tmed' ? '#8884d8' :  '#FF0000';
            const currentColor = this.props.infoChartData.variable === 'tmed' ? '#FF0000' : '#8884d8';

            return (
                <Plot
                    data={[
                        {
                            x: chartData.map(d => d.name || d.data),
                            y: chartData.map(d => d.st_value_clima),
                            customdata: chartData.map(d => d.st_value),
                            type: 'scatter',
                            mode: 'lines+markers',
                            fill: 'tonexty',
                            name: 'Climatologia (mm)',
                            line: { color: climaColor },
                            hovertemplate: '<b>%{x}</b><br><b>Anno in corso (mm): %{customdata}</b><br><b>Climatologia (mm): %{y}</b><extra></extra>'
                        },
                        {
                            x: chartData.map(d => d.name || d.data),
                            y: chartData.map(d => d.st_value),
                            customdata: chartData.map(d => d.st_value_clima),
                            type: 'scatter',
                            mode: 'lines+markers',
                            fill: 'tonexty',
                            name: 'Anno in corso (mm)',
                            line: { color: currentColor },
                            hovertemplate: '<b>%{x}</b><br><b>Anno in corso (mm): %{y}</b><br><b>Climatologia (mm): %{customdata}</b><extra></extra>'
                        }
                    ]}
                    layout={{
                        width: this.props.chartStyle.width,
                        height: this.props.chartStyle.height,
                        xaxis: { // Dates format
                            tickformat: '%Y-%m-%d'
                        },
                        yaxis: { title: ['tmed', 'tmax', 'tmin'].includes(this.props.infoChartData.variable)  ? 'Temperatura (°C)' : 'Valore (mm)' },
                        margin: this.props.chartStyle.margin,
                        showlegend: true,
                        legend: {
                            orientation: 'h',
                            x: 0.5,
                            y: -0.2
                        }
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    modeBar
                />
            );
        }
        return null;
    }
    getBody = () => {
        return (
            <Dialog maskLoading={this.props.maskLoading} id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                <span role="header">
                    <span className="layer-settings-metadata-panel-title">Pannello Grafici - Latitudine: {parseFloat(this.props.infoChartData.latlng.lat.toFixed(5))}, Longitudine: {parseFloat(this.props.infoChartData.latlng.lng.toFixed(5))}</span>
                    <button onClick={() => this.closePanel()} className="layer-settings-metadata-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                </span>
                <div role="body">
                    <Panel >
                        <Grid fluid style={{paddingTop: 2, paddingBottom: 2}}>
                            <FormGroup>
                                <ControlLabel style={{fontSize: "14px"}}><Message msgId="infochart.selectMeteoVariable"/></ControlLabel>
                                <DropdownList
                                    key="charts"
                                    data={this.props.variableList}
                                    valueField = "id"
                                    textField = "name"
                                    value={this.props.infoChartData?.variable || "prec"}
                                    onChange={(value) => {
                                        this.changeChartVariable(value);
                                    }}/>
                                <ControlLabel style={{fontSize: "14px", marginTop: "10px"}}><Message msgId="gcapp.fixedRangePicker.selectDateHidrologicYear"/></ControlLabel>
                                <DateTimePicker
                                    culture="it"
                                    time={false}
                                    min={new Date("1995-01-01")}
                                    max={moment().subtract(1, 'day')._d}
                                    format={"DD MMMM, YYYY"}
                                    editFormat={"YYYY-MM-DD"}
                                    value={new Date(this.props.infoChartData.toData)}
                                    onChange={(value) => this.changeChartDateTo(value)}/>
                                <ControlLabel style={{fontSize: "14px", marginTop: "10px"}}><Message msgId="gcapp.fixedRangePicker.selectCumulativePeriod"/></ControlLabel>
                                <DropdownList
                                    key="period"
                                    data={this.props.periodTypes}
                                    valueField = "key"
                                    textField = "label"
                                    value={this.props.infoChartData?.periodType || "1"}
                                    onChange={(value) => {
                                        this.changeChartDateFrom(value.key);
                                    }}/>
                            </FormGroup>
                        </Grid>
                    </Panel>
                    {this.showChart()}
                </div>
            </Dialog>
        );
    }
    render() {
        return (
            this.props.show ? (
                <BorderLayout style={{zIndex: 1023}} children={this.getBody()}/>
            ) : null
        );
    }

    closePanel = () => {
        this.props.onSetInfoChartVisibility(false);
    }

    // LA DATA DEVE ESSERE IN FORMATO 'YYYY-MM-DD'
    changeChartDateFrom = (value) => {
        let toData = this.props.infoChartData.toData;
        let fromData = DateAPI.calculateDateFromKeyReal(value, moment(this.props.infoChartData.toData).format('YYYY-MM-DD')).fromData;

        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData,
            fromData,
            variable: this.props.infoChartData.variable,
            periodType: value
        });
    }
    changeChartDateTo = (value) => {
        let toData = DateAPI.calculateDateFromKeyReal(this.props.infoChartData.periodType, moment(value).format('YYYY-MM-DD')).toData;
        let fromData = DateAPI.calculateDateFromKeyReal(this.props.infoChartData.periodType, moment(value).format('YYYY-MM-DD')).fromData;

        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData,
            fromData,
            variable: this.props.infoChartData.variable,
            periodType: this.props.infoChartData.periodType
        });
    }
    changeChartVariable = (value) => {
        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData: this.props.infoChartData.toData,
            fromData: this.props.infoChartData.fromData,
            variable: value.id,
            periodType: this.props.infoChartData.periodType
        });
    }
    formatDataCum(values) {
        let data = [];
        let cum = 0;
        let cumClima = 0;
        values.forEach(function(o) {
            data.push(
                {
                    "name": o.data.substring(0, 10),
                    "st_value": parseFloat(cum.toFixed(1)),
                    "st_value_clima": parseFloat(cumClima.toFixed(1))
                }
            );
            cum += o.st_value;
            cumClima += o.st_value_clima;
        }, this);
        return data;
    }
    formatDataTemp(values) {
        let data = [];
        values.forEach(function(o) {
            data.push(
                {
                    "data": o.data.substring(0, 10),
                    "st_value": parseFloat(o.st_value.toFixed(1)),
                    "st_value_clima": parseFloat(o.st_value_clima.toFixed(1))
                }
            );
        }, this);
        return data;
    }
}
export default InfoChart;

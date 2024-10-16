/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';

import { Button, Glyphicon, Panel, Grid, FormGroup, Label} from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

import Dialog from '../../../MapStore2/web/client/components/misc/Dialog';
import BorderLayout from '../../../MapStore2/web/client/components/layout/BorderLayout';
import Plot from '../../../MapStore2/web/client/components/charts/PlotlyChart.jsx';
import moment from 'moment';
import { DropdownList } from 'react-widgets';
import FixedRangeManager from '../../components/datepickers/FixedRangeManager';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import DateAPI, { PERIOD_TYPES }  from '../../utils/ManageDateUtils';
import { TMED, TMAX, TMIN, PREC, RET, VARIABLE_LIST  }  from '../../utils/VariabiliMeteoUtils';

import './infochart.css';

const FIXED_RANGE = "fixed";
const FREE_RANGE = "free";

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
        variableList: VARIABLE_LIST,
        periodTypes: PERIOD_TYPES
    }

    // Stato locale per gestire quale range manager mostrare
    state = {
        activeRangeManager: FIXED_RANGE
    };
    // Funzione per gestire il click del pulsante
    toggleRangeManager  = () => {
        this.setState(prevState => ({
            activeRangeManager: prevState.activeRangeManager === FIXED_RANGE ? FREE_RANGE : FIXED_RANGE
        }));
    };

    shouldComponentUpdate(newProps) {
        return newProps.active
            || newProps.mapinfoActive
            || newProps.data.length > 0;
    }
    // Chart's definition
    showChart = () => {
        if (!this.props.maskLoading) {
            const chartData = this.props.infoChartData.variable === PREC || this.props.infoChartData.variable === RET
                ? this.formatDataCum(this.props.data)
                : this.formatDataTemp(this.props.data);

            const climaColor = [TMED, TMAX, TMIN].includes(this.props.infoChartData.variable) ? '#8884d8' :  '#FF0000';
            const currentColor = [TMED, TMAX, TMIN].includes(this.props.infoChartData.variable) ? '#FF0000' : '#8884d8';

            // Definizione delle unità di misura dinamiche
            const unit = [TMED, TMAX, TMIN].includes(this.props.infoChartData.variable) ? '°C' : 'mm';
            const climaLabel = "Climatologia " + unit;
            const currentYearLabel = "Anno in corso " + unit;

            const scatterClimatologia = {
                x: chartData.map(d => d.name || d.data),
                y: chartData.map(d => d.st_value_clima),
                customdata: chartData.map(d => d.st_value),
                type: 'scatter',
                mode: 'lines+markers',
                fill: 'none',
                name: climaLabel,
                line: { color: climaColor },
                hovertemplate: `<b>%{x}</b><br><b>${currentYearLabel}: %{customdata}</b><br><b> ${climaLabel}: %{y}</b><extra></extra>`
            };

            const scatterCurrentYear = {
                x: chartData.map(d => d.name || d.data),
                y: chartData.map(d => d.st_value),
                customdata: chartData.map(d => d.st_value_clima),
                type: 'scatter',
                mode: 'lines+markers',
                fill: 'tonexty',
                name: currentYearLabel,
                line: { color: currentColor },
                hovertemplate: `<b>%{x}</b><br><b>${currentYearLabel}: %{y}</b><br><b>${climaLabel}: %{customdata}</b><extra></extra>`
            };

            return (
                <Plot
                    data={[scatterClimatologia, scatterCurrentYear]}
                    layout={{
                        width: this.props.chartStyle.width,
                        height: this.props.chartStyle.height,
                        xaxis: { // Dates format
                            tickformat: '%Y-%m-%d'
                        },
                        yaxis: {
                            title: [TMED, TMAX, TMIN].includes(this.props.infoChartData.variable)  ? 'Temperatura (°C)' : 'Valore (mm)'
                        },
                        margin: this.props.chartStyle.margin,
                        showlegend: true,
                        legend: {
                            orientation: 'h',
                            x: 0.5,
                            y: -0.2
                        }
                    }}
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
                                <Label className="labels-infochart"><Message msgId="infochart.selectMeteoVariable"/></Label>
                                <DropdownList
                                    key="charts"
                                    data={this.props.variableList}
                                    valueField = "id"
                                    textField = "name"
                                    value={this.props.infoChartData?.variable || "prec"}
                                    onChange={(value) => {
                                        this.changeChartVariable(value);
                                    }}/>
                                {/* Alterna tra FixedRangeManager e FreeRangeManager in base a activeRangeManager */}
                                {this.state.activeRangeManager === FIXED_RANGE ? (
                                    <FixedRangeManager
                                        toData={this.props.infoChartData.toData}
                                        periodType={this.props.infoChartData.periodType}
                                        onChangeToData={(value) => this.changeChartDateTo(value)}
                                        onChangePeriod={(value) => this.changeChartDateFrom(value.key)}
                                        isInteractionDisabled={false}
                                        styleLabels="labels-infochart"
                                    />
                                ) : (
                                    <FreeRangeManager
                                        fromData={this.props.infoChartData.fromData}
                                        toData={this.props.infoChartData.toData}
                                        onChangeFromData={(value) => this.changeChartDateFrom(value)}
                                        onChangeToData={(value) => this.changeChartDateTo(value)}
                                        isInteractionDisabled={false}
                                        styleLabels="labels-infochart"
                                    />
                                )}
                                <Button className="rangepicker-button" onClick={this.toggleRangeManager }>
                                    <Message msgId={this.state.activeRangeManager === FIXED_RANGE
                                        ? "gcapp.fixedRangePicker.dateRangeButton"
                                        : "gcapp.freeRangePicker.dateRangeButton"}  />
                                </Button>
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
    // @param {any} value - Input che viene interpretato come chiave del periodo (RANGE_FIXED) o come una data in formato libero (FREE_RANGE)
    changeChartDateFrom = (value) => {
        // TODO: crea due funzionidiverse: una per FIXED_RANGE e una per FREE_RANGE
        let fromData; let toData; let periodKey;
        toData = this.props.infoChartData.toData;
        if (this.state.activeRangeManager === FIXED_RANGE) {
            fromData = DateAPI.calculateDateFromKeyReal(value, moment(this.props.infoChartData.toData).format('YYYY-MM-DD')).fromData;
            periodKey = value;
        } else { // FREE_RANGE
            fromData = moment(value).clone().format('YYYY-MM-DD');
            // Get the key of the first period as the default value
            periodKey = PERIOD_TYPES[0]?.key;
        }
        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData,
            fromData,
            variable: this.props.infoChartData.variable,
            periodType: periodKey
        });
    }
    changeChartDateTo = (value) => {
        let fromData; let toData; let periodKey;
        if (this.state.activeRangeManager === FIXED_RANGE) {
            toData = DateAPI.calculateDateFromKeyReal(this.props.infoChartData.periodType, moment(value).format('YYYY-MM-DD')).toData;
            fromData = DateAPI.calculateDateFromKeyReal(this.props.infoChartData.periodType, moment(value).format('YYYY-MM-DD')).fromData;
            periodKey = this.props.infoChartData.periodType;
        } else { // FREE_RANGE
            toData = moment(value).clone().format('YYYY-MM-DD');
            fromData = this.props.infoChartData.fromData;
            // Get the key of the first period as the default value
            periodKey = PERIOD_TYPES[0]?.key;
        }
        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData,
            fromData,
            variable: this.props.infoChartData.variable,
            periodType: periodKey
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

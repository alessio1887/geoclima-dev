/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';

import { Collapse, Button, ButtonGroup, Glyphicon, Panel, Grid, FormGroup, Label} from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

import Dialog from '../../../MapStore2/web/client/components/misc/Dialog';
import BorderLayout from '../../../MapStore2/web/client/components/layout/BorderLayout';
import Plot from '../../../MapStore2/web/client/components/charts/PlotlyChart.jsx';
import moment from 'moment';
import { DropdownList } from 'react-widgets';
import FixedRangeManager from '../../components/datepickers/FixedRangeManager';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import { PERIOD_TYPES }  from '../../utils/ManageDateUtils';
import { fillAreas  }  from '../../utils/VariabiliMeteoUtils';

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
        variable: PropTypes.object,
        periodType: PropTypes.string,
        classNameInfoChartDate: PropTypes.string,
        styleInfoChartDate: PropTypes.object,
        onChangeChartDate: PropTypes.func
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
        onChangeChartDate: () => {}
    }


    state = {
        // Stato locale per gestire quale range manager mostrare
        activeRangeManager: FIXED_RANGE,
        zoomData: {
            startDate: null,
            endDate: null
        },
        dragModeChart: null,
        isCollapsedFormGroup: false,
        alertMessage: null
    };
    // Funzione per gestire il click del pulsante
    toggleRangeManager  = () => {
        this.setState(prevState => ({
            activeRangeManager: prevState.activeRangeManager === FIXED_RANGE ? FREE_RANGE : FIXED_RANGE
        }));
    };
    handleRelayout = (eventData) => {
        if (eventData['xaxis.range[0]'] && eventData['xaxis.range[1]']) {
            const zoomData = {
                startDate: new Date(eventData['xaxis.range[0]']),
                endDate: new Date(eventData['xaxis.range[1]'])
            };
            // set local state
            this.setState({ zoomData });
        }
        if (eventData.dragmode) {
            this.setState({ dragModeChart: eventData.dragmode
            });
        }
    };
    showChart = () => {
        if (!this.props.maskLoading) {
            // These three values are retrieved from 'infoChartData' in 'props', which is configured based on settings in localConfig.json
            const PREC = this.props.variabileChartPrecipitazione;
            const RET = this.props.variabileChartEvotrasporazione;
            const TEMP_LIST = this.props.variabiliChartTemperatura;

            const chartData = this.props.infoChartData.variable === PREC || this.props.infoChartData.variable === RET
                ? this.formatDataCum(this.props.data)
                : this.formatDataTemp(this.props.data);

            // Definizione delle unità di misura dinamiche
            const unit = TEMP_LIST.includes(this.props.infoChartData.variable) ? '°C' : 'mm';
            const climaLabel = "Climatologia " + unit;
            const currentYearLabel = "Anno in corso " + unit;

            const dateObjects = chartData.map(item => new Date(item.data));
            const observedData = chartData.map(item => item.st_value);
            const climatologicalData = chartData.map(item => item.st_value_clima);
            const fillTraces = fillAreas(dateObjects, observedData, climatologicalData, this.props.infoChartData.variable);

            const colorTraceObserved = this.props.infoChartData.variable === PREC ? 'rgba(0, 0, 255, 1)' : 'rgba(255, 0, 0, 1)';
            const trace1 = {
                x: dateObjects,
                y: climatologicalData,
                mode: 'lines',
                name: climaLabel,
                line: { color: '#38293C',  width: 1 }
            };

            const trace2 = {
                x: dateObjects,
                y: observedData,
                mode: 'lines',
                name: currentYearLabel,
                line: { color: colorTraceObserved,  width: 1 }
            };
            const dataChart = [trace1, trace2].concat(fillTraces);
            const layoutChart = {
                width: this.props.chartStyle.width,
                height: this.props.chartStyle.height,
                xaxis: { // Dates format
                    tickformat: '%Y-%m-%d',
                    range: [this.state.zoomData.startDate || Math.min(...dateObjects), this.state.zoomData.endDate || Math.max(...dateObjects)] // Mantieni il range di zoom
                },
                yaxis: {
                    title: TEMP_LIST.includes(this.props.infoChartData.variable)  ? 'Temperatura (°C)' : 'Valore (mm)'
                },
                margin: this.props.chartStyle.margin,
                showlegend: true,
                hovermode: 'x unified',
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    y: -0.2
                },
                dragmode: this.state.dragModeChart
            };
            return (
                <Plot
                    data={dataChart}
                    layout={layoutChart}
                    style={{ width: '100%', height: '100%' }}
                    onRelayout={this.handleRelayout}
                    config={{ // Chart toolbar config
                        displayModeBar: true,
                        modeBarButtonsToRemove: ['autoScale2d']
                    }}
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
                    <Button onClick={() => this.setState({ isCollapsedFormGroup: !this.state.isCollapsedFormGroup })}>
                        {this.state.isCollapsedFormGroup ? 'Espandi' : 'Collassa'}
                    </Button>
                    <Collapse in={!this.state.isCollapsedFormGroup}>
                        <Panel >
                            <Grid fluid style={{paddingTop: 2, paddingBottom: 2}}>
                                <FormGroup>
                                    <Label className="labels-infochart"><Message msgId="infochart.selectMeteoVariable"/></Label>
                                    <DropdownList
                                        key="charts"
                                        data={this.props.infoChartData?.variableList}
                                        valueField = "id"
                                        textField = "name"
                                        value={this.props.variable}
                                        onChange={this.props.onChangeChartVariable}/>
                                    {/* Alterna tra FixedRangeManager e FreeRangeManager in base a activeRangeManager */}
                                    {this.state.activeRangeManager === FIXED_RANGE ? (
                                        <FixedRangeManager
                                            toData={this.props.toData}
                                            periodType={this.props.periodType}
                                            periodTypes={this.props.infoChartData?.periodTypes}
                                            onChangeToData={this.props.onChangeFixedRangeTodata}
                                            onChangePeriod={this.props.onChangePeriod}
                                            isInteractionDisabled={false}
                                            styleLabels="labels-infochart"
                                        />
                                    ) : (
                                        <FreeRangeManager
                                            fromData={this.props.fromData}
                                            toData={this.props.toData}
                                            onChangeFromData={this.props.onChangeFromData}
                                            onChangeToData={this.props.onChangeToData}
                                            isInteractionDisabled={false}
                                            styleLabels="labels-infochart"
                                        />
                                    )}
                                    <ButtonGroup className="button-group-wrapper">
                                        <Button className="rangepicker-button" onClick={this.handleApplyPeriod}>
                                            <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton"/>
                                        </Button>
                                        <Button className="rangepicker-button" onClick={this.toggleRangeManager }>
                                            <Message msgId={this.state.activeRangeManager === FIXED_RANGE
                                                ? "gcapp.fixedRangePicker.dateRangeButton"
                                                : "gcapp.freeRangePicker.dateRangeButton"}  />
                                        </Button>
                                    </ButtonGroup>
                                </FormGroup>
                                {this.state.alertMessage && (
                                    <div className="alert-date" >
                                        <strong><Message msgId="warning"/></strong>
                                        <span ><Message msgId={this.state.alertMessage}/></span>
                                    </div>
                                )}
                            </Grid>
                        </Panel>
                    </Collapse>
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
    formatDataCum(values) {
        let data = [];
        let cum = 0;
        let cumClima = 0;
        values.forEach(function(o) {
            data.push(
                {
                    "data": o.data.substring(0, 10),
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
    // Date validations
    validateDateRange = (fromData, toData) => {
        const startDate = moment(fromData);
        const endDate = moment(toData);

        if (startDate.isBefore(moment('1991-01-01'))) {
            this.setState({ alertMessage: "gcapp.errorMessages.dateTooEarly" });
            return false;
        }
        if (endDate.isBefore(startDate)) {
            this.setState({ alertMessage: "gcapp.errorMessages.endDateBefore" });
            return false;
        }
        if (endDate.isAfter(startDate.clone().add(1, 'year'))) {
            this.setState({ alertMessage: "gcapp.errorMessages.rangeTooLarge" });
            return false;
        }
        return true;
    };
    handleApplyPeriod = () => {
        // Set fromData, toData, periodKey and variabile meteo
        const fromData = moment(this.props.fromData).clone().format('YYYY-MM-DD');
        const toData = moment(this.props.toData).clone().format('YYYY-MM-DD');
        // Set the period key as the first in the list if necessary if FREE_RANGE
        const periodKey = this.state.activeRangeManager === FIXED_RANGE ? this.props.periodType : PERIOD_TYPES[0]?.key;
        const variableId = this.props.variable.id || this.props.variable;
        // Date validations
        if (!this.validateDateRange(fromData, toData)) {
            return;
        }
        // Clear alert message if validations pass
        if (this.state.alertMessage !== null) {
            this.setState({ alertMessage: null });
        }
        // Ensure dates are in 'YYYY-MM-DD' format before making the fetch call
        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData: toData,
            fromData: fromData,
            variable: variableId,
            periodType: periodKey
        });
        // Reset zoom
        const zoomData = {
            startDate: null,
            endDate: null
        };
        this.setState({ zoomData });
    }
}


export default InfoChart;

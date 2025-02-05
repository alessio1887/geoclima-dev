/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 'react-resizable';

import { Collapse, Button, ButtonGroup, Glyphicon, Panel, Grid, FormGroup, Label} from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

import Dialog from '../../../MapStore2/web/client/components/misc/Dialog';
import BorderLayout from '../../../MapStore2/web/client/components/layout/BorderLayout';
import InfoChartRender from './InfoChartRender';
import SelectVariableTab from '../../components/dropdowns/SelectVariableTab';
import FixedRangeManager from '../../components/datepickers/FixedRangeManager';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import DateAPI, { DATE_FORMAT, DEFAULT_DATA_INIZIO, DEFAULT_DATA_FINE } from '../../utils/ManageDateUtils';
import { FIXED_RANGE, FREE_RANGE, MULTI_VARIABLE_CHART }  from '../../utils/VariabiliMeteoUtils';
import { get, isEqual } from 'lodash';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import 'react-resizable/css/styles.css';
import './infochart.css';

class InfoChart extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        isFetchAvailableDates: PropTypes.bool,
        panelClassName: PropTypes.string,
        closeGlyph: PropTypes.string,
        onSetInfoChartVisibility: PropTypes.func,
        onFetchInfoChartData: PropTypes.func,
        onCollapseRangePicker: PropTypes.func,
        onSetInfoChartDates: PropTypes.func,
        onSetChartRelayout: PropTypes.func,
        onResetChartRelayout: PropTypes.func,
        onResizeInfoChart: PropTypes.func,
        onSetRangeManager: PropTypes.func,
        onSetTabList: PropTypes.func,
        onHideMapinfoMarker: PropTypes.func,
        show: PropTypes.bool,
        infoChartData: PropTypes.object,
        tabVariables: PropTypes.array,
        maskLoading: PropTypes.bool,
        // data fetched by epic loadInfoChartDataEpic
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
        onToggleControl: PropTypes.func,
        onInitializeVariableTabs: PropTypes.func,
        active: PropTypes.bool,
        mapinfoActive: PropTypes.bool,
        animated: PropTypes.bool,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        firstAvailableDate: PropTypes.instanceOf(Date),
        lastAvailableDate: PropTypes.instanceOf(Date),
        variables: PropTypes.array,
        periodType: PropTypes.object,
        periodTypes: PropTypes.array,
        classNameInfoChartDate: PropTypes.string,
        styleInfoChartDate: PropTypes.object,
        isInteractionDisabled: PropTypes.bool,
        isCollapsedFormGroup: PropTypes.bool,
        activeRangeManager: PropTypes.string,
        alertMessage: PropTypes.string,
        chartRelayout: PropTypes.object,
        infoChartSize: PropTypes.object,
        unitPrecipitazione: PropTypes.string,
        unitTemperatura: PropTypes.string,
        tabList: PropTypes.array,
        idVariabiliLayers: PropTypes.object,
        defaultUrlGeoclimaChart: PropTypes.string,
        defaultUrlSelectDate: PropTypes.string,
        variabileSelectDate: PropTypes.string,
        timeUnit: PropTypes.string,
        isPluginLoaded: PropTypes.bool
    }
    static defaultProps = {
        id: "mapstore-sarchart-panel",
        panelClassName: "toolbar-panel portal-dialog",
        closeGlyph: "1-close",
        onSetInfoChartVisibility: () => {},
        onFetchInfoChartData: () => {},
        onCollapseRangePicker: () => {},
        onSetRangeManager: () => {},
        onSetInfoChartDates: () => {},
        onSetTabList: () => {},
        onSetChartRelayout: () => {},
        onResetChartRelayout: () => {},
        onResizeInfoChart: () => {},
        onInitializeVariableTabs: () => {},
        unitPrecipitazione: "mm",
        unitTemperatura: "°C",
        periodTypes: [
            { "key": "1", "label": "1 Mese" },
            { "key": "3", "label": "3 Mesi" },
            { "key": "4", "label": "4 Mesi" },
            { "key": "6", "label": "6 Mesi" },
            { "key": "12", "label": "12 Mesi" },
            { "key": "10", "label": "dal 1° Ottobre" }
        ],
        idVariabiliLayers: {
            "prec": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima"],
            "tmed": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Media_clima"],
            "tmin": ["Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Minima_clima"],
            "tmax": [ "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Massima_clima"],
            "ret": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            "bis": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                "BilancioIdricoSemplificato_clima"]
        },
        tabList: [
            {"id": "variableList", "name": "Variabili Meteo", "groupList": [
                { "id": "prec", "name": "Precipitazione" },
                { "id": "tmed", "name": "Temperatura Media" },
                { "id": "tmax", "name": "Temperatura Massima" },
                { "id": "tmin", "name": "Temperatura Minima" },
                { "id": "ret", "name": "Evapotraspirazione Potenziale" },
                { "id": "bis", "name": "Bilancio Idrico Semplificato" }
            ],
            "type": "single_select"
            },
            {"id": "spiList", "name": "SPI", "groupList": [
                { "id": "spi1", "name": "SPI-1" },
                { "id": "spi3", "name": "SPI-3" },
                { "id": "spi6", "name": "SPI-6" },
                { "id": "spi12", "name": "SPI-12" }
            ],
            "chartTitle": "Indice SPI - Standardized Precipitation Index",
            "type": "multi_select"
            },
            {"id": "speiList", "name": "SPEI", "groupList": [
                { "id": "spei1", "name": "SPEI-1" },
                { "id": "spei3", "name": "SPEI-3" },
                { "id": "spei6", "name": "SPEI-6" },
                { "id": "spei12", "name": "SPEI-12" }
            ],
            "chartTitle": "Indice SPEI - Standardized Precipitation-Evapotranspiration Index",
            "type": "multi_select"
            }
        ],
        defaultUrlGeoclimaChart: 'geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/geoclima_chart.py',
        defaultUrlSelectDate: "geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/selectDate.py",
        variabileSelectDate: "prec",
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
        animated: true,
        classNameInfoChartDate: "mapstore-infochartdate",
        isCollapsedFormGroup: false,
        infoChartSize: {
            widthResizable: 880,
            heightResizable: 880
        },
        firstAvailableDate: DEFAULT_DATA_INIZIO,
        lastAvailableDate: DEFAULT_DATA_FINE,
        timeUnit: DATE_FORMAT,
        isPluginLoaded: false
    }

    state = {
        // Default date values to use in case of invalid or missing date input
        defaultFromData: new Date(moment(this.props.lastAvailableDate).clone().subtract(1, 'month').startOf('day')),
        defaultToData: new Date(this.props.lastAvailableDate)
    }

    initializeTabs = () => {
        const variableTabs = this.props.tabList.map((tab, index) => ({
            id: tab.id,
            variables: [tab.groupList[0]], // Seleziona il primo come default
            active: index === 0 // Imposta il primo tab come attivo
        }));
        this.props.onInitializeVariableTabs(variableTabs);
    }

    mapfilenameSuffixes = [];

    // Set some props to the plugin's state
    componentDidMount() {
        if (!this.props.isPluginLoaded) {
            this.props.onSetIdVariabiliLayers(this.props.idVariabiliLayers);
            this.props.onSetTabList(this.props.tabList);
            this.props.onSetTimeUnit(this.props.timeUnit);
            this.initializeTabs();
            this.props.onSetDefaultUrlGeoclimaChart(this.props.defaultUrlGeoclimaChart);
            this.mapfilenameSuffixes = this.props.periodTypes.map(t => t.key);
            if ( this.props.isFetchAvailableDates && this.props.defaultUrlSelectDate && this.props.variabileSelectDate) {
                this.props.onFetchAvailableDates(this.props.variabileSelectDate, this.props.defaultUrlSelectDate, this.props.timeUnit, this.props.periodTypes);
            }
            this.props.onMarkPluginAsLoaded();
        }
    }

    shouldComponentUpdate(newProps) {
        // // List of prop to compare
        const propsToCompare = ['show', 'maskLoading', 'active', 'mapinfoActive', 'tabVariables', 'data',
            'fromData', 'toData', 'periodType', 'isInteractionDisabled', 'isCollapsedFormGroup',
            'activeRangeManager', 'alertMessage', 'chartRelayout', 'infoChartSize', 'isPluginLoaded'];
        for (let key of propsToCompare) {
        // Use get to access nested properties
            if (!isEqual(get(newProps, key), get(this.props, key))) {
                return true; // Aggiorna il componente se c'è una differenza
            }
        }
        // None of the selected properties have changed
        return false;
    }
    onResize = (event, { size }) => {
        // Aggiorna le dimensioni del pannello
        this.props.onResizeInfoChart(size.width, size.height);
    };
    switchRangeManager = () => {
        const newRangeManager = this.props.activeRangeManager === FIXED_RANGE ? FREE_RANGE : FIXED_RANGE;
        this.props.onSetRangeManager(newRangeManager);
    }
    handleRelayout = (eventData) => {
        // Autoscale case: reset zoom data to default values
        if (eventData['xaxis.autorange'] || eventData['yaxis.autorange']) {
            this.props.onResetChartRelayout();
        } else {
            const zoomData = this.props.chartRelayout ? { ...this.props.chartRelayout } : {};
            if (eventData['xaxis.range[0]'] && eventData['xaxis.range[1]']) {
                zoomData.startDate = new Date(eventData['xaxis.range[0]']);
                zoomData.endDate = new Date(eventData['xaxis.range[1]']);
            }
            if (eventData['yaxis.range[0]'] && eventData['yaxis.range[1]']) {
                zoomData.variabileStart = eventData['yaxis.range[0]'];
                zoomData.variabileEnd = eventData['yaxis.range[1]'];
            }
            if (eventData.dragmode) {
                zoomData.dragmode = eventData.dragmode;
            }
            this.props.onSetChartRelayout(zoomData);
        }
    };
    getActiveTab = () => {
        return this.props.tabVariables.find(tab => tab.active === true);
    }
    getVariableParams = () => {
        const variableListParam = this.props.tabList.find(
            tab => tab.id === this.props.infoChartData.idTab
        );
        const variableArray = this.props.infoChartData.variables?.split(',') || [];
        // Restituisci sempre variabili e tipo, con un check per chartTitle
        const result = {
            variables: variableListParam.groupList.filter(variable =>
                variableArray.includes(variable.id)
            ),
            type: variableListParam.chartType,
            variableName: variableListParam.name
        };

        if (variableListParam.chartType === MULTI_VARIABLE_CHART && variableListParam.chartTitle) {
            result.chartTitle = variableListParam.chartTitle;
        }
        return result;
    };

    showChart = () => {
        if (!this.props.maskLoading) {
            const variableParams = this.getVariableParams();
            return (<InfoChartRender
                dataFetched = {this.props.data}
                variables =  { variableParams.variables }
                handleRelayout= { this.handleRelayout }
                chartRelayout= { this.props.chartRelayout}
                infoChartSize={ this.props.infoChartSize}
                isCollapsedFormGroup={this.props.isCollapsedFormGroup}
                variableParams={ variableParams }
                unitPrecipitazione = { this.props.unitPrecipitazione }
                format={ this.props.timeUnit }
            />);
            // const PREC = this.props.variablePrecipitazione;
            // const RET = this.props.variableEvotrasporazione;
            // const TEMP_LIST = this.props.variableTemperaturaList;
            // const chartVariable = this.props.infoChartData.variables;
            // const propVariable = "st_value_" + chartVariable;
            // const chartData = chartVariable === PREC || chartVariable === RET
            //     ? formatDataCum(this.props.data, propVariable)
            //     : formatDataTemp(this.props.data, propVariable);
            //     // Definizione delle unità di misura dinamiche
            // const unit = TEMP_LIST.includes(chartVariable) ? '°C' : 'mm';
            // const climaLabel = "Climatologia " + unit;
            // const currentYearLabel = "Anno in corso " + unit;

            // const dates = chartData.map(item => new Date(item.data));
            // const observedData = chartData.map(item => item[propVariable]);
            // const climatologicalData = chartData.map(item => item.st_value_clima);
            // const fillTraces = fillAreas(dates, observedData, climatologicalData, chartVariable, PREC);

            // const colorTraceObserved = chartVariable === PREC ? 'rgba(0, 0, 255, 1)' : 'rgba(255, 0, 0, 1)';
            // const trace1 = {
            //     x: dates,
            //     y: climatologicalData,
            //     mode: 'lines',
            //     name: climaLabel,
            //     line: { color: '#38293C',  width: 1 }
            // };

            // const trace2 = {
            //     x: dates,
            //     y: observedData,
            //     mode: 'lines',
            //     name: currentYearLabel,
            //     line: { color: colorTraceObserved,  width: 1 }
            // };
            // dataChart = [trace1, trace2].concat(fillTraces);
            // layoutChart = {
            //     width: this.props.infoChartSize.widthResizable - 10,
            //     height: this.props.infoChartSize.heightResizable - (this.props.isCollapsedFormGroup ? 140 : 440 ), // Set the height based on the collapse state of the FormGroup
            //     xaxis: { // Dates format
            //         tickformat: '%Y-%m-%d',
            //         range: [this.props.chartRelayout?.startDate || Math.min(...dates), this.props.chartRelayout?.endDate || Math.max(...dates)]
            //     },
            //     yaxis: {
            //         title: TEMP_LIST.includes(this.props.infoChartData.variable)  ? 'Temperatura (°C)' : 'Valore (mm)',
            //         range: [this.props.chartRelayout?.variabileStart || Math.min(...observedData, ...climatologicalData),
            //             this.props.chartRelayout?.variabileEnd || Math.max(...observedData, ...climatologicalData)]
            //     },
            //     margin: this.props.chartStyle.margin,
            //     showlegend: true,
            //     hovermode: 'x unified',
            //     legend: {
            //         orientation: 'h',
            //         x: 0.5,
            //         y: -0.2
            //     },
            //     dragmode: this.props.chartRelayout?.dragmode
            // };
            // return (
            //     <Plot
            //         data={dataChart}
            //         layout={layoutChart}
            //         style={{ width: '100%', height: '100%' }}
            //         onRelayout={this.handleRelayout}
            //         config={{ // Chart toolbar config
            //             displayModeBar: true,
            //             modeBarButtonsToRemove: ['resetScale2d'],
            //             autosizable: true
            //         }}
            //     />
            // );
        }
        return null;
    }
    getHeader = () => {
        return ( <span role="header" style={{ position: 'relative', zIndex: 1000, padding: "10px" }}>
            <span>Pannello Grafici - Latitudine: {parseFloat(this.props.infoChartData.latlng.lat.toFixed(5))}, Longitudine: {parseFloat(this.props.infoChartData.latlng.lng.toFixed(5))}</span>
            <button onClick={() => this.closePanel()} className="layer-settings-metadata-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
        </span>
        );
    }
    getPanelFormGroup = () => {
        return (
            <Panel className="infochart-panel">
                <Grid fluid style={{padding: 0}}>
                    <FormGroup>
                        <Label className="labels-infochart"><Message msgId="infochart.selectMeteoVariable"/></Label>
                        <SelectVariableTab
                            tabList={this.props.tabList}
                            onChangeSingleVariable={this.updateSingleVariable}
                            onChangeMultiVariable={this.props.onChangeChartVariable}
                            activeTab={this.getActiveTab()}
                            onChangeTab={this.handleChangeTab}
                        />
                        {/* Toggle between FixedRangeManager and FreeRangeManager based on activeRangeManager*/}
                        {this.props.activeRangeManager === FIXED_RANGE ? (
                            <FixedRangeManager
                                minDate={this.props.firstAvailableDate}
                                maxDate={this.props.lastAvailableDate}
                                toData={this.props.toData}
                                periodType={this.props.periodType}
                                periodTypes={this.props.periodTypes}
                                onChangeToData={this.props.onChangeFixedRangeTodata}
                                onChangePeriod={this.handleChangePeriod}
                                isInteractionDisabled={false}
                                styleLabels="labels-infochart"
                                format={this.props.timeUnit}
                            />
                        ) : (
                            <FreeRangeManager
                                minDate={this.props.firstAvailableDate}
                                maxDate={this.props.lastAvailableDate}
                                fromData={this.props.fromData}
                                toData={this.props.toData}
                                onChangeFromData={this.props.onChangeFromData}
                                onChangeToData={this.props.onChangeToData}
                                isInteractionDisabled={false}
                                styleLabels="labels-infochart"
                                format={this.props.timeUnit}
                            />
                        )}
                        <ButtonGroup className="button-group-wrapper">
                            <Button className="rangepicker-button" onClick={() => this.handleApplyPeriod(this.props.variable)} disabled={this.props.isInteractionDisabled}>
                                <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton"/>
                            </Button>
                            <Button className="rangepicker-button" onClick={ this.switchRangeManager } disabled={this.props.isInteractionDisabled}>
                                <Message msgId={this.props.activeRangeManager === FIXED_RANGE
                                    ? "gcapp.fixedRangePicker.dateRangeButton"
                                    : "gcapp.freeRangePicker.dateRangeButton"}  />
                            </Button>
                        </ButtonGroup>
                    </FormGroup>
                    {this.props.alertMessage && (
                        <div className="alert-date" >
                            <strong><Message msgId="warning"/></strong>
                            <span ><Message msgId={this.props.alertMessage}
                                msgParams={{toData: moment(this.props.lastAvailableDate).format(this.props.timeUnit),
                                    fromData: moment(this.props.firstAvailableDate).format(this.props.timeUnit)
                                }}/></span>
                        </div>
                    )}
                </Grid>
            </Panel>
        );
    }
    getBody = () => {
        const rotateIcon = this.props.isCollapsedFormGroup ? 'rotate(180deg)' : 'rotate(0deg)';
        return (
            <Dialog maskLoading={this.props.maskLoading} id={this.props.id}
                style={{
                    maxWidth: "100vw",
                    maxHeight: "100vh",
                    left: "calc(50% - 440px)",
                    top: "-100px",
                    width: this.props.infoChartSize.widthResizable,
                    height: "fit-content"
                }}
                className={this.props.panelClassName}>
                {this.getHeader()}
                <div role="body"
                    style={{
                        position: 'relative',
                        display: "flex",
                        flexDirection: "column",
                        width: '100%',
                        height: '100%'
                    }}>
                    <Resizable
                        width={this.props.infoChartSize.widthResizable}
                        height={this.props.infoChartSize.heightResizable}
                        onResize={this.onResize}
                        minConstraints={[400, 600]}
                        style={{
                            flexDirection: "column",
                            top: 10,
                            right: 17
                        }}>
                        <div style={{ display: "flex", flexDirection: "column",
                            width: this.props.infoChartSize.widthResizable,  padding: '5px'}}>
                            <div style={{ position: "relative",  top: "-25px", marginBottom: "-15px"  }}>
                                <Button onClick={this.props.onCollapseRangePicker} style={{ padding: "2px"}} >
                                    <Message msgId={this.props.isCollapsedFormGroup
                                        ? "gcapp.infochart.expand"
                                        : "gcapp.infochart.collapse"}  />
                                    <span className="collapse-rangepicker-icon"  style={{ transform: rotateIcon }}>&#9650;</span>
                                </Button>
                                <Collapse in={!this.props.isCollapsedFormGroup}>
                                    {this.getPanelFormGroup()}
                                </Collapse>
                                {this.showChart()}
                            </div>
                        </div>
                    </Resizable>
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
        this.props.onSetInfoChartDates(this.props.lastAvailableDate, this.props.periodTypes );
        this.props.onResetChartRelayout();
        if ( this.props.infoChartSize.widthResizable !== 880 || this.props.infoChartSize.heightResizable !== 880) {
            this.props.onResizeInfoChart(880, 880);
        }
        this.initializeTabs();
        this.props.onHideMapinfoMarker();
        if (this.props.alertMessage) {
            this.props.onCloseAlert();
        }
    }
    handleChangePeriod = (periodType) => {
        this.props.onChangePeriod(periodType);
        this.handleApplyPeriod(null, null, periodType);
    }
    handleChangeTab = (idTab) => {
        this.props.onChangeTab(idTab);
        this.handleApplyPeriod(this.props.tabVariables.find(tab => tab.id === idTab).variables, idTab, null);
    }
    updateSingleVariable = (selectedVariable, tabVariable) => {
        this.props.onChangeChartVariable(tabVariable, [selectedVariable]);
        this.handleApplyPeriod([selectedVariable], tabVariable);
    }
    handleApplyPeriod = (selectedVariables, tabVariable, newPeriod) => {
        let periodApplied = newPeriod || this.props.periodType;
        let newFromData = this.props.fromData;
        let newToData = this.props.toData;
        if (!newFromData || !newToData || isNaN(newFromData) || isNaN(newToData) || !(newToData instanceof Date) || !(newFromData instanceof Date)) {
            // restore defult values
            this.props.onChangePeriodToData(new Date(this.state.defaultToData));
            return;
        }
        // Set fromData, toData, periodKey and variabile meteo
        if ( this.props.activeRangeManager === FIXED_RANGE) {
            // fromData = DateAPI.calculateDateFromKeyReal( periodApplied, toData).fromData;
            newFromData = moment(newToData).clone().subtract(periodApplied.max, 'days').toDate();
        } else {
            // set default period
            periodApplied = this.props.periodTypes.find(period => period.isDefault);
        }
        const variableIds = selectedVariables ? selectedVariables.map(variable => variable.id).join(',')
            : this.getActiveTab().variables.map(variable => variable.id).join(',');
        const idTab = tabVariable || this.getActiveTab().id;

        // Date validations
        const validation = DateAPI.validateDateRange(newFromData, newToData, this.props.firstAvailableDate, this.props.lastAvailableDate, this.props.timeUnit);
        if (!validation.isValid) {
            this.props.onOpenAlert(validation.errorMessage);
            return;
        }
        // Clear alert message if validations pass
        if (this.props.alertMessage) {
            this.props.onCloseAlert();
        }
        // Ensure dates are in 'YYYY-MM-DD' format before making the fetch call
        this.props.onFetchInfoChartData({
            latlng: this.props.infoChartData.latlng,
            toData: moment(newToData).clone().format(this.props.timeUnit),
            fromData: moment(newFromData).clone().format(this.props.timeUnit),
            variables: variableIds,
            periodType: periodApplied.key,
            idTab: idTab
        });
        this.props.onResetChartRelayout();
        // set default values
        this.setState({ defaultFromData: new Date(newFromData)});
        this.setState({ defaultToData: new Date(newToData)});
    }
}


export default InfoChart;

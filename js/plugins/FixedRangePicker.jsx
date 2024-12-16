/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Collapse, FormGroup, Glyphicon } from 'react-bootstrap';
import Message from '../../MapStore2/web/client/components/I18N/Message';
import { updateSettings, updateNode } from '../../MapStore2/web/client/actions/layers';
import { compose } from 'redux';
import { changePeriodToData, changePeriod, toggleRangePickerPlugin, openAlert,
    closeAlert, collapsePlugin, markFixedRangeAsLoaded, markFixedRangeAsNotLoaded,
    fetchSelectDate } from '../actions/fixedrangepicker';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import DateAPI, { DEFAULT_DATA_INIZIO, DEFAULT_DATA_FINE } from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';
import FixedRangeManager from '../components/datepickers/FixedRangeManager';
import DailyManager from '@js/components/datepickers/DailyManager';

import fixedrangepicker from '../reducers/fixedrangepicker';
import layers from '../../MapStore2/web/client/reducers/layers';

import * as rangePickerEpics from '../epics/dateRangeConfig';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);
/*
Plugin configuration
"name": "FixedRangePicker",
          "cfg" : {
            "id": "mapstore-fixedrangepicker-map",
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
            "showOneDatePicker": false
          }
*/
class FixedRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        isCollapsedPlugin: PropTypes.bool,
        onCollapsePlugin: PropTypes.func,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        firstAvailableDate: PropTypes.instanceOf(Date),
        lastAvailableDate: PropTypes.instanceOf(Date),
        onFetchSelectDate: PropTypes.func,
        onSetSelectDate: PropTypes.func,
        onChangePeriodToData: PropTypes.func,
        onChangePeriod: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        onUpdateNode: PropTypes.func,
        onMarkPluginAsLoaded: PropTypes.func,
        onMarkFixedRangeAsNotLoaded: PropTypes.func,
        defaultUrlSelectDate: PropTypes.string,
        variabileSelectDate: PropTypes.string,
        settings: PropTypes.object,
        layers: PropTypes.object,
        variabiliMeteo: PropTypes.object,
        periodType: PropTypes.string,
        periodTypes: PropTypes.array,
        showFixedRangePicker: PropTypes.bool, // If true, show this plugin; otherwise, show FreeRangePlugin if inserted in context
        onToggleFixedRangePicker: PropTypes.func,
        alertMessage: PropTypes.string,
        onOpenAlert: PropTypes.func,
        onCloseAlert: PropTypes.func,
        isInteractionDisabled: PropTypes.bool,
        shiftRight: PropTypes.bool,
        showOneDatePicker: PropTypes.bool,
        showChangeRangePickerButton: PropTypes.bool,
        isPluginLoaded: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: true,
        onChangePeriodToData: () => { },
        onChangePeriod: () => { },
        onUpdateSettings: () => { },
        onCollapsePlugin: () => { },
        onMarkFixedRangeAsNotLoaded: () => { },
        periodType: "1",
        periodTypes: [
            { "key": "1", "label": "1 Mese" },
            { "key": "3", "label": "3 Mesi" },
            { "key": "4", "label": "4 Mesi" },
            { "key": "6", "label": "6 Mesi" },
            { "key": "12", "label": "12 Mesi" },
            { "key": "10", "label": "dal 1° Ottobre" }
        ],
        id: "mapstore-fixederange",
        variabiliMeteo: {
            "precipitazione": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima", "Pioggia_Cumulata_Giornaliera"],
            "temperatura": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Minima", "Temperatura_Minima_Anomalia",
                "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Media_clima", "Temperatura_Massima_clima", "Temperatura_Minima_clima"],
            "evapotraspirazione": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            "bilancioIdricoSemplificato": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                "BilancioIdricoSemplificato_clima"],
            "spi": [ "spi1", "spi3", "spi6", "spi12"],
            "spei": [ "spei1", "spei3", "spei6", "spei12"]
        },
        defaultUrlSelectDate: "geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/selectDate.py",
        variabileSelectDate: "prec",
        className: "mapstore-fixederange",
        style: {
            top: 0,
            position: 'absolute',
            zIndex: 10
        },
        showFixedRangePicker: false,
        showOneDatePicker: false,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false,
        showChangeRangePickerButton: false,
        firstAvailableDate: DEFAULT_DATA_INIZIO,
        lastAvailableDate: DEFAULT_DATA_FINE,
        isPluginLoaded: false
    };

    state = {
        // Default date values to use in case of invalid or missing date input
        defaultFromData: new Date(moment(this.props.lastAvailableDate).clone().subtract(1, 'month')),
        defaultToData: new Date(this.props.lastAvailableDate)
    }

    componentDidMount() {
        this.props.onToggleFixedRangePicker();
        this.props.onMarkPluginAsLoaded();
        this.props.onFetchSelectDate(this.props.variabileSelectDate, this.props.defaultUrlSelectDate);
    }

    // Resets the plugin's state to default values when navigating back to the Home Page
    componentWillUnmount() {
        const TO_DATA = this.props.lastAvailableDate;
        this.props.onChangePeriodToData(TO_DATA);
        this.props.onChangePeriod("1");
        this.props.onMarkFixedRangeAsNotLoaded();
        if (this.props.showFixedRangePicker) {
            this.props.onToggleFixedRangePicker();
        }
    }

    render() {
        if (!this.props.showFixedRangePicker) {
            return null;
        }
        const marginLeft = this.props.shiftRight ? '265px' : '5px';
        const pluginStyle = {
            marginLeft,
            left: "40px",
            ...this.props.style
        };
        const rotateIcon = this.props.isCollapsedPlugin ? 'rotate(180deg)' : 'rotate(0deg)';
        return (
            <div className="ms-fixedrangepicker-action" style={pluginStyle}>
                <Button  onClick= {this.props.onCollapsePlugin} style={this.props.style}>
                    <Message msgId={!this.props.showOneDatePicker
                        ? "gcapp.fixedRangePicker.collapsePlugin"
                        : "gcapp.dailyDatePicker"}  />{' '}
                    <span className="collapse-rangepicker-icon" style={{ transform: rotateIcon }}>&#9650;</span>
                </Button>
                <Collapse in={!this.props.isCollapsedPlugin} style={{ zIndex: 100,  position: "absolute", top: "30px",
                    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)", backgroundColor: "#FFFFFF"  }}>
                    <FormGroup style={{ marginBottom: "0px" }} bsSize="sm">
                        {
                            !this.props.showOneDatePicker
                                ? this.showFixedRangeManager()
                                : this.showDailyDatePicker()
                        }
                        {this.props.alertMessage && (
                            <div className="alert-date" >
                                <strong><Message msgId="warning"/></strong>
                                <span ><Message msgId={this.props.alertMessage}
                                    msgParams={{toData: moment(this.props.lastAvailableDate).format("DD-MM-YYYY")}}/>
                                </span>
                            </div>
                        )}
                    </FormGroup>
                </Collapse>
            </div>
        );
    }
    showFixedRangeManager = () => {
        return (
            <div className="ms-fixedrangepicker-action">
                <RangePickerInfo
                    labelTitleId="gcapp.fixedRangePicker.titlePeriod"
                    fromData={this.props.fromData}
                    toData={this.props.toData}
                />
                <FixedRangeManager
                    minDate={this.props.firstAvailableDate}
                    maxDate={this.props.lastAvailableDate}
                    toData={this.props.toData}
                    onChangeToData={this.props.onChangePeriodToData}
                    isInteractionDisabled={this.props.isInteractionDisabled}
                    periodType={this.props.periodType}
                    periodTypes={this.props.periodTypes}
                    onChangePeriod={this.props.onChangePeriod}
                    styleLabels="labels-fixedrangepicker"
                />
                <ButtonGroup id="button-rangepicker-container">
                    <Button onClick={this.handleApplyPeriod} disabled={this.props.isInteractionDisabled}>
                        <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton" />
                    </Button>
                    { this.props.showChangeRangePickerButton && (
                        <Button onClick={this.props.onToggleFixedRangePicker} disabled={this.props.isInteractionDisabled}>
                            <Message msgId="gcapp.fixedRangePicker.dateRangeButton" />
                        </Button>
                    )}
                </ButtonGroup>
            </div>
        );
    }
    showDailyDatePicker = () => {
        const normalizedDate = moment(this.props.toData).startOf('day').toDate();
        const isDecrementDisabled = this.props.isInteractionDisabled ||
                                moment(normalizedDate).isSameOrBefore(this.props.firstAvailableDate);
        const isIncrementDisabled = this.props.isInteractionDisabled ||
                                moment(normalizedDate).isSameOrAfter(moment(this.props.lastAvailableDate));
        return (
            <DailyManager
                toData={this.props.toData}
                minDate={this.props.firstAvailableDate}
                maxDate={this.props.lastAvailableDate}
                isInteractionDisabled={this.props.isInteractionDisabled}
                isDecrementDisabled = {isDecrementDisabled}
                isIncrementDisabled = {isIncrementDisabled}
                onChangePeriodToData={this.props.onChangePeriodToData}
                updateParams={this.updateParams}
                alertMessage={this.props.alertMessage}
                onOpenAlert={this.props.onOpenAlert}
                onCloseAlert={this.props.onCloseAlert}
            />
        );
    }
    handleApplyPeriod = () => {
        const { fromData, toData } = this.props;
        if (!fromData || !toData || isNaN(fromData) || isNaN(toData) || !(toData instanceof Date) || !(fromData instanceof Date)) {
            // restore defult values
            this.props.onChangePeriodToData(new Date(this.state.defaultToData));
            return;
        }
        // Verifiche sulle date
        const validation = DateAPI.validateDateRange(fromData, toData, this.props.firstAvailableDate, this.props.lastAvailableDate);
        if (!validation.isValid) {
            this.props.onOpenAlert(validation.errorMessage);
            return;
        }
        if (this.props.alertMessage !== null) {
            this.props.onCloseAlert();
        }
        this.updateParams({
            fromData: fromData,
            toData: toData
        });
        // set default values
        this.setState({ defaultFromData: new Date(fromData)});
        this.setState({ defaultToData: new Date(toData)});
    }
    updateParams = (datesParam, onUpdateNode = true) => {
        this.props.layers.flat.map((layer) => {
            if (onUpdateNode && isVariabiliMeteoLayer(layer.name, this.props.variabiliMeteo)) {
                const mapFile = DateAPI.setGCMapFile(datesParam.fromData, datesParam.toData, layer.params.map);
                const newParams = {
                    params: {
                        map: mapFile,
                        fromData: moment(datesParam.fromData).format('YYYY-MM-DD'),
                        toData: moment(datesParam.toData).format('YYYY-MM-DD')
                    }
                };
                this.props.onUpdateSettings(newParams);
                this.props.onUpdateNode(
                    layer.id,
                    "layers",
                    assign({}, this.props.settings.props, newParams)
                );
            }
        });
    }
}

const mapStateToProps = (state) => {
    return {
        isCollapsedPlugin: state?.fixedrangepicker?.isCollapsedPlugin,
        fromData: state?.fixedrangepicker?.fromData || moment(this.props.lastAvailableDate).clone().subtract(1, 'month'),
        toData: state?.fixedrangepicker?.toData || this.props.lastAvailableDate,
        periodType: state?.fixedrangepicker?.periodType || "1",
        settings: state?.layers?.settings || { expanded: false, options: { opacity: 1 } },
        layers: state?.layers || {},
        showFixedRangePicker: (state?.fixedrangepicker?.showFixedRangePicker) ? true : false,
        alertMessage: state?.fixedrangepicker?.alertMessage || null,
        isInteractionDisabled: state?.fixedrangepicker?.isInteractionDisabled || false,
        shiftRight: state.controls.drawer ? state.controls.drawer.enabled : false,
        showChangeRangePickerButton: state.freerangepicker?.isPluginLoaded ? true : false,
        isPluginLoaded: state?.fixedrangepicker?.isPluginLoaded,
        firstAvailableDate: state?.fixedrangepicker?.firstAvailableDate,
        lastAvailableDate: state?.fixedrangepicker?.lastAvailableDate
    };
};

const FixedRangePickerPlugin = connect(mapStateToProps, {
    onMarkPluginAsLoaded: markFixedRangeAsLoaded,
    onMarkFixedRangeAsNotLoaded: markFixedRangeAsNotLoaded,
    onCollapsePlugin: collapsePlugin,
    onChangePeriodToData: compose(changePeriodToData, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleFixedRangePicker: toggleRangePickerPlugin,
    onOpenAlert: openAlert,
    onCloseAlert: closeAlert,
    onFetchSelectDate: fetchSelectDate
})(FixedRangePicker);

export default createPlugin(
    'FixedRangePickerPlugin',
    {
        component: assign(FixedRangePickerPlugin, {
            GridContainer: {
                id: 'fixedRangePicker',
                name: 'fixedRangePicker',
                tool: true,
                position: 1,
                priority: 1
            }
        }),
        reducers: {
            fixedrangepicker: fixedrangepicker,
            layers: layers
        },
        epics: rangePickerEpics
    }
);

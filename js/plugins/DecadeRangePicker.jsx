/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Label, FormGroup, Glyphicon } from 'react-bootstrap';
import Message from '../../MapStore2/web/client/components/I18N/Message';
import { updateSettings, updateNode } from '../../MapStore2/web/client/actions/layers';
import { DateTimePicker, DropdownList } from 'react-widgets';
import { compose } from 'redux';
import { changeYear, changePeriod, toggleDecadeRangePicker } from '../actions/aithome';
import { isVariabiliMeteoLayer, isSPIorSPEILayer } from '../utils/CheckLayerVariabiliMeteoUtils';
import DateAPI from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import italianCalendar from '../utils/italianCalendar';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import aithome from '../reducers/aithome';
import layers from '../../MapStore2/web/client/reducers/layers';


// This plugin allows you to select periods in decades (multiples of 10 days)
class DecadeRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        // fromData-toDate sono le date ricalcolate in base alla decade in cui ricadono, vengono passare come parametri alle richeiste http
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        // fromDataReal-toDateReal sono le date effettivamente selezionate dal form
        fromDataReal: PropTypes.instanceOf(Date),
        toDataReal: PropTypes.instanceOf(Date),
        onChangeYear: PropTypes.func,
        onChangeMonth: PropTypes.func,
        onChangePeriod: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        onUpdateNode: PropTypes.func,
        settings: PropTypes.object,
        layers: PropTypes.object,
        periodType: PropTypes.string,
        periodTypes: PropTypes.array,
        map: PropTypes.string,
        decadeRanePickerActive: PropTypes.bool, // serve per la visibilita del componente
        onToggleDecadeRangePicker: PropTypes.func
    };
    static defaultProps = {
        fromData: new Date(DateAPI.calculateDateFromKey("1", moment().subtract(1, 'day')._d).fromData),
        toData: new Date(DateAPI.calculateDateFromKey("1", moment().subtract(1, 'day')._d).toData),
        fromDataReal: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
        toDataReal: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        onChangeYear: () => {},
        onChangeMonth: () => {},
        onChangePeriod: () => {},
        onUpdateSettings: () => {},
        periodTypes: [
            { key: "1", label: "1 Mese"},
            { key: "3", label: "3 Mesi"},
            { key: "4", label: "4 Mesi"},
            { key: "6", label: "6 Mesi"},
            { key: "12", label: "12 Mesi"},
            { key: "10", label: "dal 1° Ottobre"}
        ],
        periodType: "1",
        map: "geoclima",
        id: "mapstore-decaderange",
        className: "mapstore-decaderange",
        style: {
            top: 0,
            left: "305px",
            position: 'absolute',
            height: '100%'
        },
        decadeRanePickerActive: false
    };

    render() {
        if (!this.props.decadeRanePickerActive) {
            return null;
        }

        return (
            <div className={this.props.className} style={this.props.style}>
                <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                    <div
                        id="ms-decaderange-action"
                        className="ms-decaderange-action">
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.titleDecadePeriod"/></Label>
                        <div style={{padding: "6px", textAlign: 'center'}} >Dal: <span id="from-data-statistics" >{moment(this.props.fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics" >{moment(this.props.toData).format('DD/MM/YYYY')}</span></div>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.selectDateHidrologicYear"/></Label>
                        <DateTimePicker
                            culture="it"
                            time={false}
                            calendarProps={{
                                monthNames: italianCalendar.monthNames,
                                monthNamesShort: italianCalendar.monthNamesShort,
                                dayNames: italianCalendar.dayNames,
                                dayNamesShort: italianCalendar.dayNamesShort
                            }}
                            min={moment().subtract(1, 'years').startOf('day')._d}
                            max={moment().subtract(1, 'day')._d}
                            format={"DD MMMM, YYYY"}
                            editFormat={"YYYY-MM-DD"}
                            value={new Date(this.props.toDataReal)}
                            onChange={this.props.onChangeYear}/>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.selectCumulativePeriod"/></Label>
                        <DropdownList
                            id="period1"
                            key={this.props.periodType || "1"}
                            data={this.props.periodTypes}
                            valueField = "key"
                            textField = "label"
                            value={this.props.periodType || "1"}
                            onChange={this.props.onChangePeriod}/>
                        <div id="button-rangepicker-container">
                            <Button onClick={this.handleApplyPeriod}>
                                <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton"/>
                            </Button>
                            <Button onClick={this.props.onToggleDecadeRangePicker}>
                                <Message msgId="gcapp.decadeRangeButton"/>
                            </Button>
                        </div>
                    </div>
                </FormGroup>
            </div>
        );
    }

    handleApplyPeriod = () => {
        const mapFile = DateAPI.setGCMapFile(this.props.fromData, this.props.toData);
        this.updateParams({
            params: {
                map: mapFile,
                fromData: moment(this.props.fromData).format('YYYY-MM-DD'),
                toData: moment(this.props.toData).format('YYYY-MM-DD')
            }
        });
        this.updateParamsReal({
            params: {
                map: mapFile,
                fromData: moment(this.props.fromDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD'),
                toData: moment(this.props.toDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD')
            }
        });
    }

    updateParams(newParams, onUpdateNode = true) {
        // let originalSettings = assign({}, this.state.originalSettings);
        // // TODO one level only storage of original settings for the moment
        // Object.keys(newParams).forEach((key) => {
        //     originalSettings[key] = this.state.initialState[key];
        // });
        // this.setState({originalSettings});
        this.props.onUpdateSettings(newParams);
        if (onUpdateNode) {
            this.props.layers.flat.map((layer) => {
                if (isVariabiliMeteoLayer(layer.name) || isSPIorSPEILayer(layer.name)) {
                    // funzione che aggiorna la mappa
                    this.props.onUpdateNode(
                        layer.id,
                        "layers",
                        assign({}, this.props.settings.props, newParams)
                    );
                }
            }, this);
        }
    }
    updateParamsReal(newParams, onUpdateNode = true) {
        // let originalSettings = assign({}, this.state.originalSettings);
        // // TODO one level only storage of original settings for the moment
        // Object.keys(newParams).forEach((key) => {
        //     originalSettings[key] = this.state.initialState[key];
        // });
        // this.setState({originalSettings});
        this.props.onUpdateSettings(newParams);
        if (onUpdateNode) {
            this.props.layers.flat.map((layer) => {
                if (isSPIorSPEILayer(layer.name)) {
                // if (layers.group === "Spazializzazioni" || layers.group === "Aree di allerta meteo" || layers.group === "Stazioni") {
                    this.props.onUpdateNode(
                        layer.id,
                        "layers",
                        assign({}, this.props.settings.props, newParams)
                    );
                }
            }, this);
        }
    }
}

const mapStateToProps = (state) => {
    return {
        fromData: state?.aithome?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.aithome?.toData || new Date(moment().subtract(1, 'day')._d),
        fromDataReal: state?.aithome?.fromDataReal || new Date(moment().subtract(1, 'month')._d),
        toDataReal: state?.aithome?.toDataReal || new Date(moment().subtract(1, 'day')._d),
        periodType: state?.aithome?.periodType || "1",
        periodTypes: state?.aithome?.periodTypes || [
            { key: "1", label: "1 Mese" },
            { key: "3", label: "3 Mesi" },
            { key: "4", label: "4 Mesi" },
            { key: "6", label: "6 Mesi" },
            { key: "12", label: "12 Mesi" },
            { key: "10", label: "dal 1° Ottobre" }
        ],
        settings: state?.layers?.settings || {expanded: false, options: {opacity: 1}},
        layers: state?.layers || {},
        decadeRanePickerActive: (state?.aithome?.showDecadeRangePicker ) ? true : false
    };
};

const DecadeRangePickerPlugin = connect(mapStateToProps, {
    onChangeYear: compose(changeYear, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleDecadeRangePicker: toggleDecadeRangePicker
})(DecadeRangePicker);

export default createPlugin(
    'DecadeRangePickerPlugin',
    {
        component: assign(DecadeRangePickerPlugin, {
            GridContainer: {
                id: 'decadeRangePicker',
                name: 'decadeRangePicker',
                tool: true,
                position: 1,
                priority: 1
            }
        }),
        reducers: {
            aithome: aithome,
            layers: layers
        }
    }
);

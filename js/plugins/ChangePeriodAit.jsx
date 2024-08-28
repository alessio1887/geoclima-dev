/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Label, FormGroup } from 'react-bootstrap';
import Message from '../../MapStore2/web/client/components/I18N/Message';
import { updateSettings, updateNode } from '../../MapStore2/web/client/actions/layers';
import { DateTimePicker, DropdownList } from 'react-widgets';
import { compose } from 'redux';
import { changeYear, changePeriod } from '../actions/aithome';
import DateAPI from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './changeperiodait.css';

import aithome from '../reducers/aithome';
import layers from '../../MapStore2/web/client/reducers/layers';

momentLocaliser(moment);
moment().locale('it');
moment.updateLocale('it', {
    months: [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
        "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ],
    weekdays: 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_')
});


class ChangePeriodAit extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
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
        changePeriodAitActive: PropTypes.bool // serve per la visibilita del componente
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
        map: "ait.map",
        id: "mapstore-changedate",
        className: "mapstore-changedate",
        style: {
            top: 0,
            left: "305px",
            position: 'absolute',
            height: '100%'
        },
        changePeriodAitActive: false
    };
    componentWillReceiveProps(nextProps) {
        if (this.props.id === "mapstore-changedate-map") {
            if (this.props.fromData.getTime() !== nextProps.fromData.getTime() || this.props.toData.getTime() !== nextProps.toData.getTime()) {
                const mapFile = DateAPI.setAITMapFile(nextProps.fromData, nextProps.toData);
                this.updateParams({params: {map: mapFile, fromData: moment(nextProps.fromData).format('YYYY-MM-DD'), toData: moment(nextProps.toData).format('YYYY-MM-DD')}});
            }
            if (this.props.fromDataReal.getTime() !== nextProps.fromDataReal.getTime() || this.props.toDataReal.getTime() !== nextProps.toDataReal.getTime()) {
                const mapFile = DateAPI.setAITMapFile(nextProps.fromData, nextProps.toData);
                this.updateParamsReal({params: {map: mapFile, fromData: moment(nextProps.fromDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD'), toData: moment(nextProps.toDataReal).clone().subtract(1, 'day').format('YYYY-MM-DD')}});
            }
        }
    }

    render() {
        if (!this.props.changePeriodAitActive ) {
            return null;
        }
        return (
            <div className={this.props.className} style={this.props.style}>
                <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                    <div
                        id="ms-changeperiodait-action"
                        className="ms-changeperiodait-action">
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}>Periodo decadi considerate</Label>
                        <div style={{padding: "6px", textAlign: 'center'}} >Dal: <span id="from-data-statistics" >{moment(this.props.fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics" >{moment(this.props.toData).format('DD/MM/YYYY')}</span></div>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="aitapp.selectDateHidrologicYear"/></Label>
                        <DateTimePicker
                            time={false}
                            min={new Date("1995-01-01")}
                            max={moment().subtract(1, 'day')._d}
                            format={"DD MMMM, YYYY"}
                            editFormat={"YYYY-MM-DD"}
                            value={new Date(this.props.toDataReal)}
                            onChange={this.props.onChangeYear}/>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="aitapp.selectCumulativePeriod"/></Label>
                        <DropdownList
                            id="period1"
                            key={this.props.periodType || "1"}
                            data={this.props.periodTypes}
                            valueField = "key"
                            textField = "label"
                            value={this.props.periodType || "1"}
                            onChange={this.props.onChangePeriod}/>
                    </div>
                </FormGroup>
            </div>
        );
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
            this.props.layers.flat.map((layers) => {
                if ([
                    // "Variabili Meteo.Pioggia",
                    "Variabili Meteo.e2b72ce0-639f-11ef-be2b-777eaf553525",
                    "Variabili Meteo.Temperatura",
                    "Variabili Meteo.Evapotraspirazione",
                    "Variabili Meteo.Bilancio Idrico Semplificato",
                    "Variabili Meteo.SPI",
                    "Variabili Meteo.SPEI",
                    "Layer di Base"
                ].includes(layers.groups)) {
                    // funzione che aggiorna la mappa
                    this.props.onUpdateNode(
                        layers.id,
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
                if (layer.group === "Variabili Meteo.SPI" ||
                    layer.group === "Variabili Meteo.SPEI" ||
                    layer.group === "Layer di Base") {
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
        fromData: state.aithome && state.aithome.fromData || new Date('1995-01-01'),
        toData: state.aithome && state.aithome.toData || new Date('1995-01-01'),
        fromDataReal: state.aithome && state.aithome.fromDataReal || new Date('1995-01-01'),
        toDataReal: state.aithome && state.aithome.toDataReal || new Date('1995-01-01'),
        periodType: state.aithome && state.aithome.periodType || "1",
        periodTypes: state.aithome?.periodTypes || [
            { key: "1", label: "1 Mese" },
            { key: "3", label: "3 Mesi" },
            { key: "4", label: "4 Mesi" },
            { key: "6", label: "6 Mesi" },
            { key: "12", label: "12 Mesi" },
            { key: "10", label: "dal 1° Ottobre" }
        ],
        settings: state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}},
        layers: state.layers || {},
        changePeriodAitActive: state.controls.drawer ? state.controls.drawer.enabled : false
    };
};

const ChangePeriodAitPlugin = connect(mapStateToProps, {
    onChangeYear: compose(changeYear, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode
})(ChangePeriodAit);

export default createPlugin(
    'ChangePeriodAitPlugin',
    {
        component: assign(ChangePeriodAitPlugin, {
            GridContainer: {
                id: 'changePeriodAit',
                name: 'changePeriodAit',
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

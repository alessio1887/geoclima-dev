/*
/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Label, FormGroup, Glyphicon, Alert } from 'react-bootstrap';
import Message from '../../MapStore2/web/client/components/I18N/Message';
import { updateSettings, updateNode } from '../../MapStore2/web/client/actions/layers';
import { DateTimePicker  } from 'react-widgets';
import { compose } from 'redux';
import DateAPI from '../utils/ManageDateUtils';
import { isVariabiliMeteoLayer, isSPIorSPEILayer } from '../utils/CheckLayerVariabiliMeteoUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import layers from '../../MapStore2/web/client/reducers/layers';
import geoclimahome from '@js/reducers/geoclimahome';
import { toggleDecadeRangePicker } from '../actions/aithome';
import { changeFromData, changeToData, openAlert, closeAlert } from '@js/actions/geoclimahome';


class FreeRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        onChangeFromData: PropTypes.func,
        onChangeToData: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        onUpdateNode: PropTypes.func,
        settings: PropTypes.object,
        layers: PropTypes.object,
        map: PropTypes.string,
        freeRangePickerIsVisible: PropTypes.bool, // serve per la visibilita del componente
        onToggleFreeRangePicker: PropTypes.func,
        alertMessage: PropTypes.string,
        onOpenAlert: PropTypes.func,
        onCloseAlert: PropTypes.func
    };
    static defaultProps = {
        fromData: new Date(moment().subtract(1, 'month')._d),
        toData: new Date(moment().subtract(1, 'day')._d),
        onChangeFromData: () => {},
        onChangeToData: () => {},
        onUpdateSettings: () => {},
        map: "geoclima",
        id: "mapstore-daterange",
        className: "mapstore-daterange",
        style: {
            top: 0,
            left: "305px",
            position: 'absolute',
            height: '100%'
        },
        freeRangePickerIsVisible: false,
        alertMessage: null
    };

    render() {
        if (!this.props.freeRangePickerIsVisible) {
            return null;
        }
        return (
            <div className={this.props.className} style={this.props.style}>
                {this.props.alertMessage && (
                    <Alert variant="danger" className="alert-date">
                        <div  className="alert-date-close">
                            <Button onClick={this.props.onCloseAlert}  variant="outline-danger" size="sm">
                                <Glyphicon glyph="remove" />
                            </Button>
                        </div>
                        <Message msgId={this.props.alertMessage}/>
                    </Alert>
                )}
                <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                    <div
                        id="ms-freerangepicker-action"
                        className="ms-freerangepicker-action">
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.freeRangePicker.titlePeriod"/></Label>
                        <div style={{padding: "6px", textAlign: 'center'}} >Dal: <span id="from-data-statistics" >{moment(this.props.fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics" >{moment(this.props.toData).format('DD/MM/YYYY')}</span></div>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.freeRangePicker.selectFromDate"/></Label>
                        <DateTimePicker
                            culture="it"
                            time={false}
                            min={new Date("1991-01-01")}
                            max={moment().subtract(1, 'day')._d}
                            format={"DD MMMM, YYYY"}
                            editFormat={"YYYY-MM-DD"}
                            value={new Date(this.props.fromData)}
                            onChange={this.props.onChangeFromData}/>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="gcapp.freeRangePicker.selectToDate"/></Label>
                        <DateTimePicker
                            culture="it"
                            time={false}
                            min={new Date("1991-01-02")}
                            max={moment().subtract(1, 'day')._d}
                            format={"DD MMMM, YYYY"}
                            editFormat={"YYYY-MM-DD"}
                            value={new Date(this.props.toData)}
                            onChange={this.props.onChangeToData}/>
                        <div id="button-rangepicker-container">
                            <Button onClick={this.handleApplyPeriod}>
                                <Glyphicon glyph="calendar" /><Message msgId="gcapp.freeRangePicker.applyPeriodButton"/>
                            </Button>
                            <Button variant="primary" onClick={this.props.onToggleFreeRangePicker}>
                                <Message msgId="gcapp.freeRangePicker.dateRangeButton"/>
                            </Button>
                        </div>
                    </div>
                </FormGroup>
            </div>
        );
    }
    handleApplyPeriod = () => {
        const { fromData, toData } = this.props;

        // Verifiche sulle date
        const startDate = moment(fromData);
        const endDate = moment(toData);
        if (endDate.isBefore(startDate)) {
            this.props.onOpenAlert("gcapp.errorMessages.endDateBefore");
            return;
        }

        const oneYearFromStart = startDate.clone().add(1, 'year');
        if (endDate.isAfter(oneYearFromStart)) {
            this.props.onOpenAlert("gcapp.errorMessages.rangeTooLarge");
            return;
        }

        // Se le verifiche passano, procedi con l'aggiornamento dei parametri
        const mapFile = DateAPI.setGCMapFile(fromData, toData);
        this.updateParams({
            params: {
                map: mapFile,
                fromData: moment(fromData).format('YYYY-MM-DD'),
                toData: moment(toData).format('YYYY-MM-DD')
            }
        });
    }

    updateParams(newParams, onUpdateNode = true) {
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
}

const mapStateToProps = (state) => {
    return {
        fromData: state?.geoclimahome?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.geoclimahome?.toData || new Date(moment().subtract(1, 'day')._d),
        settings: state?.layers?.settings || {expanded: false, options: {opacity: 1}},
        layers: state?.layers || {},
        freeRangePickerIsVisible: (!state?.aithome?.showFixedRangePicker ) ? true : false,
        alertMessage: state?.geoclimahome?.alertMessage || null
    };
};

const FreeRangePickerPlugin = connect(mapStateToProps, {
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleFreeRangePicker: toggleDecadeRangePicker,
    onOpenAlert: openAlert,
    onCloseAlert: closeAlert
})(FreeRangePicker);

export default createPlugin(
    'FreeRangePickerPlugin',
    {
        component: assign(FreeRangePickerPlugin, {
            GridContainer: {
                id: 'freeRangePicker',
                name: 'freeRangePicker',
                tool: true,
                position: 1,
                priority: 1
            }
        }),
        reducers: {
            geoclimahome: geoclimahome,
            layers: layers
        }
    }
);

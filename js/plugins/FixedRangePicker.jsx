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
import { DateTimePicker, DropdownList } from 'react-widgets';
import { compose } from 'redux';
import { changeYear, changePeriod, toggleRangePickerPlugin, openAlert, closeAlert } from '../actions/fixedrangepicker';
import { isVariabiliMeteoLayer, isSPIorSPEILayer } from '../utils/CheckLayerVariabiliMeteoUtils';
import DateAPI from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import fixedrangepicker from '../reducers/fixedrangepicker';
import layers from '../../MapStore2/web/client/reducers/layers';


class FixedRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
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
        fixedRangePickerActive: PropTypes.bool, // serve per la visibilita del componente
        onToggleFixedRangePicker: PropTypes.func,
        alertMessage: PropTypes.string,
        onOpenAlert: PropTypes.func,
        onCloseAlert: PropTypes.func,
        isInteractionDisabled: PropTypes.bool
    };
    static defaultProps = {
        fromData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
        toData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        onChangeYear: () => { },
        onChangeMonth: () => { },
        onChangePeriod: () => { },
        onUpdateSettings: () => { },
        periodTypes: [
            { key: "1", label: "1 Mese" },
            { key: "3", label: "3 Mesi" },
            { key: "4", label: "4 Mesi" },
            { key: "6", label: "6 Mesi" },
            { key: "12", label: "12 Mesi" },
            { key: "10", label: "dal 1° Ottobre" }
        ],
        periodType: "1",
        map: "geoclima",
        id: "mapstore-fixederange",
        className: "mapstore-fixederange",
        style: {
            top: 0,
            left: "305px",
            position: 'absolute',
            height: '100%'
        },
        fixedRangePickerActive: false,
        alertMessage: null,
        isInteractionDisabled: false
    };

    render() {
        if (!this.props.fixedRangePickerActive) {
            return null;
        }
        return (
            <div className={this.props.className} style={this.props.style}>
                {this.props.alertMessage && (
                    <Alert variant="danger" className="alert-date">
                        <div className="alert-date-close">
                            <Button onClick={this.props.onCloseAlert} variant="outline-danger" size="sm">
                                <Glyphicon glyph="remove" />
                            </Button>
                        </div>
                        <Message msgId={this.props.alertMessage} />
                    </Alert>
                )}
                <FormGroup style={{ marginBottom: "0px" }} bsSize="sm">
                    <div
                        id="ms-fixedrangepicker-action"
                        className="ms-fixedrangepicker-action">
                        <Label className="labels-fixedrangepicker"><Message msgId="gcapp.fixedRangePicker.titlePeriod" /></Label>
                        <div style={{ padding: "6px", textAlign: 'center' }} >Dal: <span id="from-data-statistics" >{moment(this.props.fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics" >{moment(this.props.toData).format('DD/MM/YYYY')}</span></div>
                        <Label className="labels-fixedrangepicker"><Message msgId="gcapp.fixedRangePicker.selectDateHidrologicYear" /></Label>
                        <DateTimePicker
                            culture="it"
                            time={false}
                            min={new Date("1991-01-01")}
                            max={moment().subtract(1, 'day')._d}
                            format={"DD MMMM, YYYY"}
                            editFormat={"YYYY-MM-DD"}
                            value={new Date(this.props.toData)}
                            onChange={this.props.onChangeYear}
                            disabled={this.props.isInteractionDisabled} />
                        <Label className="labels-fixedrangepicker"><Message msgId="gcapp.fixedRangePicker.selectCumulativePeriod" /></Label>
                        <DropdownList
                            id="period1"
                            key={this.props.periodType || "1"}
                            data={this.props.periodTypes}
                            valueField="key"
                            textField="label"
                            value={this.props.periodType || "1"}
                            onChange={this.props.onChangePeriod}
                            disabled={this.props.isInteractionDisabled} />
                        <div id="button-rangepicker-container">
                            <Button onClick={this.handleApplyPeriod} disabled={this.props.isInteractionDisabled}>
                                <Glyphicon glyph="calendar" /><Message msgId="gcapp.fixedRangePicker.applyPeriodButton" />
                            </Button>
                            <Button onClick={this.props.onToggleFixedRangePicker} disabled={this.props.isInteractionDisabled}>
                                <Message msgId="gcapp.fixedRangePicker.fixedRangeButton" />
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
        if (startDate.isBefore(moment('1991-01-01'))) {
            this.props.onOpenAlert("gcapp.errorMessages.dateTooEarly");
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
        fromData: state?.fixedrangepicker?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.fixedrangepicker?.toData || new Date(moment().subtract(1, 'day')._d),
        periodType: state?.fixedrangepicker?.periodType || "1",
        periodTypes: state?.fixedrangepicker?.periodTypes || [
            { key: "1", label: "1 Mese" },
            { key: "3", label: "3 Mesi" },
            { key: "4", label: "4 Mesi" },
            { key: "6", label: "6 Mesi" },
            { key: "12", label: "12 Mesi" },
            { key: "10", label: "dal 1° Ottobre" }
        ],
        settings: state?.layers?.settings || { expanded: false, options: { opacity: 1 } },
        layers: state?.layers || {},
        fixedRangePickerActive: (state?.fixedrangepicker?.showFixedRangePicker) ? true : false,
        alertMessage: state?.fixedrangepicker?.alertMessage || null,
        isInteractionDisabled: state?.fixedrangepicker?.isInteractionDisabled || false
    };
};

const FixedRangePickerPlugin = connect(mapStateToProps, {
    onChangeYear: compose(changeYear, (event) => event),
    onChangePeriod: compose(changePeriod, (event) => event.key),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleFixedRangePicker: toggleRangePickerPlugin,
    onOpenAlert: openAlert,
    onCloseAlert: closeAlert
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
        }
    }
);

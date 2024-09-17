/*
/**
 * Copyright 2016, GeoSolutions Sas.
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
import { DateTimePicker  } from 'react-widgets';
import { compose } from 'redux';
import DateAPI from '../utils/ManageDateUtils';
import { isVariabiliMeteoLayer, isSPIorSPEILayer } from '../utils/CheckLayerVariabiliMeteoUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import italianCalendar from '../utils/italianCalendar';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import layers from '../../MapStore2/web/client/reducers/layers';
import geoclimahome from '@js/reducers/geoclimahome';
import { toggleDecadeRangePicker } from '../actions/aithome';
import { changeFromData, changeToData } from '@js/actions/geoclimahome';


class DateRangePicker extends React.Component {
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
        dateRangePickerIsVisible: PropTypes.bool, // serve per la visibilita del componente
        onToggleDateRangePicker: PropTypes.func
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
        dateRangePickerIsVisible: false
    };

    render() {
        if (!this.props.dateRangePickerIsVisible) {
            return null;
        }
        return (
            <div className={this.props.className} style={this.props.style}>
                <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                    <div
                        id="ms-daterangepicker-action"
                        className="ms-daterangepicker-action">
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="aitapp.titlePeriod"/></Label>
                        <div style={{padding: "6px", textAlign: 'center'}} >Dal: <span id="from-data-statistics" >{moment(this.props.fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics" >{moment(this.props.toData).format('DD/MM/YYYY')}</span></div>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="aitapp.selectFromDate"/></Label>
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
                            value={new Date(this.props.fromData)}
                            onChange={this.props.onChangeFromData}/>
                        <Label style={{borderRadius: "0%", padding: "10px", fontSize: "14px", flex: 1}}><Message msgId="aitapp.selectToDate"/></Label>
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
                            value={new Date(this.props.toData)}
                            onChange={this.props.onChangeToData}/>
                        <div id="button-rangepicker-container">
                            <Button onClick={this.handleApplyPeriod}>
                                <Glyphicon glyph="calendar" /> Applica periodo
                            </Button>
                            <Button variant="primary" onClick={this.props.onToggleDateRangePicker}>
                                Mostra selezione per decadi
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
}

const mapStateToProps = (state) => {
    return {
        fromData: state?.geoclimahome?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.geoclimahome?.toData || new Date(moment().subtract(1, 'day')._d),
        settings: state?.layers?.settings || {expanded: false, options: {opacity: 1}},
        layers: state?.layers || {},
        dateRangePickerIsVisible: (!state?.aithome?.showDecadeRangePicker ) ? true : false
    };
};

const DateRangePickerPlugin = connect(mapStateToProps, {
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleDateRangePicker: toggleDecadeRangePicker
})(DateRangePicker);

export default createPlugin(
    'DateRangePickerPlugin',
    {
        component: assign(DateRangePickerPlugin, {
            GridContainer: {
                id: 'dateRangePicker',
                name: 'dateRangePicker',
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

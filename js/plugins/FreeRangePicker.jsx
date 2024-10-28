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
import DateAPI from '../utils/ManageDateUtils';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import layers from '../../MapStore2/web/client/reducers/layers';
import freerangepicker from '@js/reducers/freerangepicker';
import { toggleRangePickerPlugin } from '../actions/fixedrangepicker';
import { changeFromData, changeToData, openAlert, closeAlert, collapsePlugin } from '@js/actions/freerangepicker';

import FreeRangeManager from '../components/datepickers/FreeRangeManager';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';


class FreeRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        isCollapsedPlugin: PropTypes.bool,
        onCollapsePlugin: PropTypes.func,
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
        onCloseAlert: PropTypes.func,
        isInteractionDisabled: PropTypes.bool,
        shiftRight: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: false,
        fromData: new Date(moment().subtract(1, 'month')._d),
        toData: new Date(moment().subtract(1, 'day')._d),
        onChangeFromData: () => {},
        onChangeToData: () => {},
        onUpdateSettings: () => {},
        onCollapsePlugin: () => { },
        map: "geoclima",
        id: "mapstore-daterange",
        className: "mapstore-daterange",
        style: {
            top: 0,
            position: 'absolute',
            zIndex: 10
        },
        freeRangePickerIsVisible: false,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false
    };

    render() {
        if (!this.props.freeRangePickerIsVisible) {
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
            <div className={this.props.className} style={pluginStyle}>
                <Button  onClick= {this.props.onCollapsePlugin} style={this.props.style}>
                    <Message msgId="gcapp.freeRangePicker.collapsePlugin"/>{' '}
                    <span className="collapse-rangepicker-icon" style={{ transform: rotateIcon }}>&#9650;</span>
                </Button>
                <Collapse in={!this.props.isCollapsedPlugin} style={{ zIndex: 100,  position: "absolute", top: "30px"  }}>
                    <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                        <div className="ms-freerangepicker-action">
                            <RangePickerInfo
                                labelTitleId="gcapp.freeRangePicker.titlePeriod"
                                fromData={this.props.fromData}
                                toData={this.props.toData}
                            />
                            <FreeRangeManager
                                fromData={this.props.fromData}
                                toData={this.props.toData}
                                onChangeFromData={this.props.onChangeFromData}
                                onChangeToData={this.props.onChangeToData}
                                isInteractionDisabled={this.props.isInteractionDisabled}
                                styleLabels="labels-freerangepicker"
                            />
                            <ButtonGroup id="button-rangepicker-container">
                                <Button onClick={this.handleApplyPeriod}  disabled={this.props.isInteractionDisabled}>
                                    <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton"/>
                                </Button>
                                <Button variant="primary" onClick={this.props.onToggleFreeRangePicker} disabled={this.props.isInteractionDisabled}>
                                    <Message msgId="gcapp.freeRangePicker.dateRangeButton"/>
                                </Button>
                            </ButtonGroup>
                            {this.props.alertMessage && (
                                <div className="alert-date" >
                                    <strong><Message msgId="warning"/></strong>
                                    <span ><Message msgId={this.props.alertMessage}/></span>
                                </div>
                            )}
                        </div>
                    </FormGroup>
                </Collapse>
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
        if (this.props.alertMessage !== null) {
            this.props.onCloseAlert();
        }
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
                if (isVariabiliMeteoLayer(layer.name)) {
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
        isCollapsedPlugin: state?.freerangepicker?.isCollapsedPlugin,
        fromData: state?.freerangepicker?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.freerangepicker?.toData || new Date(moment().subtract(1, 'day')._d),
        settings: state?.layers?.settings || {expanded: false, options: {opacity: 1}},
        layers: state?.layers || {},
        freeRangePickerIsVisible: (!state?.fixedrangepicker?.showFixedRangePicker ) ? true : false,
        alertMessage: state?.freerangepicker?.alertMessage || null,
        isInteractionDisabled: state?.freerangepicker?.isInteractionDisabled || false,
        shiftRight: state.controls.drawer ? state.controls.drawer.enabled : false
    };
};

const FreeRangePickerPlugin = connect(mapStateToProps, {
    onCollapsePlugin: collapsePlugin,
    onChangeFromData: compose(changeFromData, (event) => event),
    onChangeToData: compose(changeToData, (event) => event),
    onUpdateSettings: updateSettings,
    onUpdateNode: updateNode,
    onToggleFreeRangePicker: toggleRangePickerPlugin,
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
            freerangepicker: freerangepicker,
            layers: layers
        }
    }
);

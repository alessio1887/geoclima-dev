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
import { changeYear, changePeriod, toggleRangePickerPlugin, openAlert, closeAlert, collapsePlugin } from '../actions/fixedrangepicker';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import DateAPI, { PERIOD_TYPES } from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';
import FixedRangeManager from '../components/datepickers/FixedRangeManager';

import fixedrangepicker from '../reducers/fixedrangepicker';
import layers from '../../MapStore2/web/client/reducers/layers';


class FixedRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        isCollapsedPlugin: PropTypes.bool,
        onCollapsePlugin: PropTypes.func,
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
        isInteractionDisabled: PropTypes.bool,
        shiftRight: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: true,
        fromData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
        toData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
        onChangeYear: () => { },
        onChangeMonth: () => { },
        onChangePeriod: () => { },
        onUpdateSettings: () => { },
        onCollapsePlugin: () => { },
        periodTypes: PERIOD_TYPES,
        periodType: "1",
        map: "geoclima",
        id: "mapstore-fixederange",
        className: "mapstore-fixederange",
        style: {
            top: 0,
            left: "40px",
            position: 'absolute',
            height: '100%'
        },
        fixedRangePickerActive: false,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false
    };

    render() {
        if (!this.props.fixedRangePickerActive) {
            return null;
        }
        const marginLeft = this.props.shiftRight ? '265px' : '5px';
        const combinedStyle = {
            marginLeft,
            ...this.props.style // Assicurati di mantenere gli stili passati
        };
        return (
            <div className={this.props.className} style={combinedStyle}>
                <Button  onClick= {this.props.onCollapsePlugin} className={`collapse-rangepicker ${this.props.isCollapsedPlugin ? 'collapsed' : ''}`}>
                    <Message msgId="gcapp.fixedRangePicker.collapsePlugin"/>{' '}
                    <span className="collapse-rangepicker-icon">&#9650;</span>
                </Button>
                <Collapse in={!this.props.isCollapsedPlugin}  style={{ zIndex: 100,  position: "absolute", top: "30px"  }}>
                    <FormGroup style={{ marginBottom: "0px" }} bsSize="sm">
                        <div className="ms-fixedrangepicker-action">
                            <RangePickerInfo
                                labelTitleId="gcapp.fixedRangePicker.titlePeriod"
                                fromData={this.props.fromData}
                                toData={this.props.toData}
                            />
                            <FixedRangeManager
                                toData={this.props.toData}
                                onChangeToData={this.props.onChangeYear}
                                isInteractionDisabled={this.props.isInteractionDisabled}
                                periodType={this.props.periodType}
                                onChangePeriod={this.props.onChangePeriod}
                                styleLabels="labels-fixedrangepicker"
                            />
                            <ButtonGroup id="button-rangepicker-container">
                                <Button onClick={this.handleApplyPeriod} disabled={this.props.isInteractionDisabled}>
                                    <Glyphicon glyph="calendar" /><Message msgId="gcapp.fixedRangePicker.applyPeriodButton" />
                                </Button>
                                <Button onClick={this.props.onToggleFixedRangePicker} disabled={this.props.isInteractionDisabled}>
                                    <Message msgId="gcapp.fixedRangePicker.dateRangeButton" />
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
        if (startDate.isBefore(moment('1991-01-01'))) {
            this.props.onOpenAlert("gcapp.errorMessages.dateTooEarly");
            return;
        }
        // Se le verifiche passano, procedi con l'aggiornamento dei parametri
        const mapFile = DateAPI.setGCMapFile(fromData, toData);
        if (this.props.alertMessage !== null) {
            this.props.onCloseAlert();
        }
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
        isCollapsedPlugin: state?.fixedrangepicker?.isCollapsedPlugin,
        fromData: state?.fixedrangepicker?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state?.fixedrangepicker?.toData || new Date(moment().subtract(1, 'day')._d),
        periodType: state?.fixedrangepicker?.periodType || "1",
        periodTypes: state?.fixedrangepicker?.periodTypes || PERIOD_TYPES,
        settings: state?.layers?.settings || { expanded: false, options: { opacity: 1 } },
        layers: state?.layers || {},
        fixedRangePickerActive: (state?.fixedrangepicker?.showFixedRangePicker) ? true : false,
        alertMessage: state?.fixedrangepicker?.alertMessage || null,
        isInteractionDisabled: state?.fixedrangepicker?.isInteractionDisabled || false,
        shiftRight: state.controls.drawer ? state.controls.drawer.enabled : false
    };
};

const FixedRangePickerPlugin = connect(mapStateToProps, {
    onCollapsePlugin: collapsePlugin,
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

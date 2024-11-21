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
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';
import FixedRangeManager from '../components/datepickers/FixedRangeManager';

import fixedrangepicker from '../reducers/fixedrangepicker';
import layers from '../../MapStore2/web/client/reducers/layers';

import * as rangePickerEpics from '../epics/dateRangeConfig';

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
        showFixedRangePicker: PropTypes.bool, // serve per la visibilita del componente
        onToggleFixedRangePicker: PropTypes.func,
        alertMessage: PropTypes.string,
        onOpenAlert: PropTypes.func,
        onCloseAlert: PropTypes.func,
        isInteractionDisabled: PropTypes.bool,
        shiftRight: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: true,
        onChangeYear: () => { },
        onChangeMonth: () => { },
        onChangePeriod: () => { },
        onUpdateSettings: () => { },
        onCollapsePlugin: () => { },
        periodType: "1",
        id: "mapstore-fixederange",
        className: "mapstore-fixederange",
        style: {
            top: 0,
            position: 'absolute',
            zIndex: 10
        },
        showFixedRangePicker: false,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false
    };

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
            <div className={this.props.className} style={pluginStyle}>
                <Button  onClick= {this.props.onCollapsePlugin} style={this.props.style}>
                    <Message msgId="gcapp.fixedRangePicker.collapsePlugin"/>{' '}
                    <span className="collapse-rangepicker-icon" style={{ transform: rotateIcon }}>&#9650;</span>
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
                                periodTypes={this.props.periodTypes}
                                onChangePeriod={this.props.onChangePeriod}
                                styleLabels="labels-fixedrangepicker"
                            />
                            <ButtonGroup id="button-rangepicker-container">
                                <Button onClick={this.handleApplyPeriod} disabled={this.props.isInteractionDisabled}>
                                    <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton" />
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
        const validation = DateAPI.validateDateRange(fromData, toData);
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
    }
    updateParams(datesParam, onUpdateNode = true) {
        this.props.layers.flat.map((layer) => {
            if (onUpdateNode && isVariabiliMeteoLayer(layer.name)) {
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
        fromData: state?.fixedrangepicker?.fromData || FROM_DATA,
        toData: state?.fixedrangepicker?.toData || TO_DATA,
        periodType: state?.fixedrangepicker?.periodType || "1",
        periodTypes: state?.localConfig?.periodTypes,
        settings: state?.layers?.settings || { expanded: false, options: { opacity: 1 } },
        layers: state?.layers || {},
        showFixedRangePicker: (state?.fixedrangepicker?.showFixedRangePicker) ? true : false,
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
        },
        epics: rangePickerEpics
    }
);

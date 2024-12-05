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
import { changePeriodToData, changePeriod, toggleRangePickerPlugin, openAlert, closeAlert, collapsePlugin } from '../actions/fixedrangepicker';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import DateAPI, { FROM_DATA, TO_DATA } from '../utils/ManageDateUtils';
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

class FixedRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        isCollapsedPlugin: PropTypes.bool,
        onCollapsePlugin: PropTypes.func,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        onChangePeriodToData: PropTypes.func,
        onChangeMonth: PropTypes.func,
        onChangePeriod: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        onUpdateNode: PropTypes.func,
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
        showRangePicker: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: true,
        onChangePeriodToData: () => { },
        onChangeMonth: () => { },
        onChangePeriod: () => { },
        onUpdateSettings: () => { },
        onCollapsePlugin: () => { },
        periodType: "1",
        periodTypes: [],
        id: "mapstore-fixederange",
        variabiliMeteo: {},
        className: "mapstore-fixederange",
        style: {
            top: 0,
            position: 'absolute',
            zIndex: 10
        },
        showFixedRangePicker: false,
        showRangePicker: true,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false
    };

    state = {
        // Default date values to use in case of invalid or missing date input
        defaultFromData: new Date(FROM_DATA),
        defaultToData: new Date(TO_DATA)
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
                    <Message msgId={this.props.showRangePicker
                        ? "gcapp.fixedRangePicker.collapsePlugin"
                        : "gcapp.dailyDatePicker"}  />{' '}
                    <span className="collapse-rangepicker-icon" style={{ transform: rotateIcon }}>&#9650;</span>
                </Button>
                <Collapse in={!this.props.isCollapsedPlugin} style={{ zIndex: 100,  position: "absolute", top: "30px",
                    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)", backgroundColor: "#FFFFFF"  }}>
                    <FormGroup style={{ marginBottom: "0px" }} bsSize="sm">
                        {
                            this.props.showRangePicker
                                ? this.showFixedRangeManager()
                                : this.showDailyDatePicker()
                        }
                        {this.props.alertMessage && (
                            <div className="alert-date" >
                                <strong><Message msgId="warning"/></strong>
                                <span ><Message msgId={this.props.alertMessage} msgParams={{toData: moment(TO_DATA).format("DD-MM-YYYY")}}/></span>
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
                    <Button onClick={this.props.onToggleFixedRangePicker} disabled={this.props.isInteractionDisabled}>
                        <Message msgId="gcapp.fixedRangePicker.dateRangeButton" />
                    </Button>
                </ButtonGroup>
            </div>
        );
    }
    showDailyDatePicker = () => {
        const isDecrementDisabled = this.props.isInteractionDisabled ||
                                moment(this.props.toData).isSameOrBefore("1991-01-01", 'day');
        const isIncrementDisabled = this.props.isInteractionDisabled ||
                                moment(this.props.toData).isSameOrAfter(TO_DATA, 'day');
        return (
            <DailyManager
                toData={this.props.toData}
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
        fromData: state?.fixedrangepicker?.fromData || FROM_DATA,
        toData: state?.fixedrangepicker?.toData || TO_DATA,
        periodType: state?.fixedrangepicker?.periodType || "1",
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
    onChangePeriodToData: compose(changePeriodToData, (event) => event),
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

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
import DateAPI, { DEFAULT_DATA_FINE, DEFAULT_DATA_INIZIO} from '../utils/ManageDateUtils';
import { isVariabiliMeteoLayer } from '../utils/VariabiliMeteoUtils';
import { connect } from 'react-redux';
import assign from 'object-assign';
import moment from 'moment';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import './rangepicker.css';

import layers from '../../MapStore2/web/client/reducers/layers';
import freerangepicker from '@js/reducers/freerangepicker';
import { toggleRangePickerPlugin } from '../actions/fixedrangepicker';
import { changeFromData, changeToData, openAlert, closeAlert, collapsePlugin,
    markFreeRangeAsLoaded, markFreeRangeAsNotLoaded } from '@js/actions/freerangepicker';
import * as rangePickerEpics from '../epics/dateRangeConfig';

import FreeRangeManager from '../components/datepickers/FreeRangeManager';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

/*
Plugin configuration
"name": "FreeRangePicker",
      "defaultConfig" : {
        "id": "mapstore-freerangepicker-map",
        "variabiliMeteo": {
          "precipitazione": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima","Pioggia_Cumulata_Giornaliera"],
          "temperatura": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Minima", "Temperatura_Minima_Anomalia",
                  "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Media_clima", "Temperatura_Massima_clima", "Temperatura_Minima_clima"],
          "evapotraspirazione": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
          "bilancioIdricoSemplificato": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                  "BilancioIdricoSemplificato_clima"],
          "spi": [ "spi1", "spi3", "spi6", "spi12"],
          "spei":[ "spei1", "spei3", "spei6", "spei12"]
        }
      }
*/
class FreeRangePicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        isCollapsedPlugin: PropTypes.bool,
        onCollapsePlugin: PropTypes.func,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        firstAvailableData: PropTypes.instanceOf(Date),
        lastAvailableData: PropTypes.instanceOf(Date),
        onChangeFromData: PropTypes.func,
        onChangeToData: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        onUpdateNode: PropTypes.func,
        onMarkPluginAsLoaded: PropTypes.func,
        onMarkPluginAsNotLoaded: PropTypes.func,
        settings: PropTypes.object,
        layers: PropTypes.object,
        variabiliMeteo: PropTypes.object,
        showFreeRangePicker: PropTypes.bool, // serve per la visibilita del componente
        onToggleFreeRangePicker: PropTypes.func,
        alertMessage: PropTypes.string,
        onOpenAlert: PropTypes.func,
        onCloseAlert: PropTypes.func,
        isInteractionDisabled: PropTypes.bool,
        shiftRight: PropTypes.bool,
        isPluginLoaded: PropTypes.bool,
        showChangeRangePickerButton: PropTypes.bool
    };
    static defaultProps = {
        isCollapsedPlugin: false,
        onChangeFromData: () => {},
        onChangeToData: () => {},
        onUpdateSettings: () => {},
        onCollapsePlugin: () => { },
        id: "mapstore-daterange",
        className: "mapstore-daterange",
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
        style: {
            top: 0,
            position: 'absolute',
            zIndex: 10
        },
        showFreeRangePicker: false,
        alertMessage: null,
        isInteractionDisabled: true,
        shiftRight: false,
        showChangeRangePickerButton: true,
        isPluginLoaded: false,
        firstAvailableData: DEFAULT_DATA_INIZIO,
        lastAvailableData: DEFAULT_DATA_FINE
    };

    state = {
        // Default date values to use in case of invalid or missing date input
        defaultFromData: this.props.lastAvailableData,
        defaultToData: moment(this.props.lastAvailableData).clone().subtract(1, 'month').startOf('day').toDate()
    }

    componentDidMount() {
        this.props.onMarkPluginAsLoaded();
    }

    // Resets the plugin's state to default values when navigating back to the Home Page
    componentWillUnmount() {
        const TO_DATA = this.props.lastAvailableData;
        const FROM_DATA = moment(TO_DATA).clone().subtract(1, 'month').startOf('day').toDate();
        this.props.onChangeToData(TO_DATA);
        this.props.onChangeFromData(FROM_DATA);
        this.props.onMarkPluginAsNotLoaded();
    }

    render() {
        if (!this.props.showFreeRangePicker) {
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
                <Collapse in={!this.props.isCollapsedPlugin} style={{ zIndex: 100,  position: "absolute", top: "30px",
                    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)", backgroundColor: "#FFFFFF"  }}>
                    <FormGroup style={{marginBottom: "0px"}} bsSize="sm">
                        {this.showRangePicker()}
                    </FormGroup>
                </Collapse>
            </div>
        );
    }
    showRangePicker = () => {
        return (
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
                    { this.props.showChangeRangePickerButton && (
                        <Button variant="primary" onClick={this.props.onToggleFreeRangePicker} disabled={this.props.isInteractionDisabled}>
                            <Message msgId="gcapp.freeRangePicker.dateRangeButton"/>
                        </Button>
                    )}
                </ButtonGroup>
                {this.props.alertMessage && (
                    <div className="alert-date" >
                        <strong><Message msgId="warning"/></strong>
                        <span ><Message msgId={this.props.alertMessage}
                            msgParams={{toData: moment(this.prop.lastAvailableData).format("DD-MM-YYYY")}}/>
                        </span>
                    </div>
                )}
            </div>
        );
    }
    handleApplyPeriod = () => {
        const { fromData, toData } = this.props;
        if (!fromData || !toData || isNaN(fromData) || isNaN(toData) || !(toData instanceof Date) || !(fromData instanceof Date)) {
            // restore defult values
            this.props.onChangeFromData(new Date(this.state.defaultFromData));
            this.props.onChangeToData(new Date(this.state.defaultToData));
            return;
        }
        // Verifiche sulle date
        const validation = DateAPI.validateDateRange(fromData, toData, this.props.firstAvailableData, this.props.lastAvailableData);
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
    updateParams(datesParam, onUpdateNode = true) {
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
        isCollapsedPlugin: state?.freerangepicker?.isCollapsedPlugin,
        fromData: state?.freerangepicker?.fromData,
        toData: state?.freerangepicker?.toData,
        settings: state?.layers?.settings || {expanded: false, options: {opacity: 1}},
        layers: state?.layers || {},
        showFreeRangePicker: (!state?.fixedrangepicker?.showFixedRangePicker ) ? true : false,
        alertMessage: state?.freerangepicker?.alertMessage || null,
        isInteractionDisabled: state?.freerangepicker?.isInteractionDisabled || false,
        shiftRight: state.controls.drawer ? state.controls.drawer.enabled : false,
        showChangeRangePickerButton: state.fixedrangepicker.isPluginLoaded ? true : false,
        isPluginLoaded: state?.freerangepicker?.isPluginLoaded
    };
};

const FreeRangePickerPlugin = connect(mapStateToProps, {
    onMarkPluginAsLoaded: markFreeRangeAsLoaded,
    onMarkPluginAsNotLoaded: markFreeRangeAsNotLoaded,
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
        },
        epics: rangePickerEpics
    }
);

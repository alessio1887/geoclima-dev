/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DATE_FORMAT } from '../utils/ManageDateUtils';
import { setVariabiliMeteo } from '../actions/daterangelabel';
import daterangelabel from '../reducers/daterangelabel';
import assign from 'object-assign';
import updateDateLabelEpic from '../epics/daterangelabel';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);
/*
Plugin configuration:
 "name": "DateRangeLabel",
      "defaultConfig" : {
        "id": "mapstore-daterangelabel-map",
        "variabiliMeteo": {
          "precipitazione": ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima","Pioggia_Cumulata_Giornaliera"],
          "temperatura": ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Minima", "Temperatura_Minima_Anomalia",
                  "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Media_clima", "Temperatura_Massima_clima", "Temperatura_Minima_clima"],
          "evapotraspirazione": ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
          "bilancioIdricoSemplificato": ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                  "BilancioIdricoSemplificato_clima"],
          "spi": [ "spi1", "spi3", "spi6", "spi12"],
          "spei":[ "spei1", "spei3", "spei6", "spei12"]
        },
        "timeUnit": "YYYY-MM-DD"
*/
class DateRangeLabel extends React.Component {
    static propTypes = {
        onSetVariabiliMeteo: PropTypes.func,
        style: PropTypes.object,
        id: PropTypes.string,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date),
        variabiliMeteo: PropTypes.object,
        timeUnit: PropTypes.string
    }
    static defaultProps = {
        id: "mapstore-daterangelabel",
        style: {
            position: "absolute",
            left: "53%",
            transform: "translateX(-50%)"
        },
        timeUnit: DATE_FORMAT,
        variabiliMeteo: {
            precipitazione: ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata", "Pioggia_Cumulata_clima", "Pioggia_Cumulata_Giornaliera"],
            temperatura: ["Temperatura_Media", "Temperatura_Media_Anomalia", "Temperatura_Minima", "Temperatura_Minima_Anomalia",
                "Temperatura_Massima", "Temperatura_Massima_Anomalia", "Temperatura_Media_clima", "Temperatura_Massima_clima", "Temperatura_Minima_clima"],
            evapotraspirazione: ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc", "Evapotraspirazione_clima"],
            bilancioIdricoSemplificato: ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc",
                "BilancioIdricoSemplificato_clima"],
            spi: [ "spi1", "spi3", "spi6", "spi12"],
            spei: [ "spei1", "spei3", "spei6", "spei12"]
        }
    };
    componentDidMount() {
        this.props.onSetVariabiliMeteo(this.props.variabiliMeteo);
    }
    render() {
        return (
            <div className="daterangelabel" style={this.props.style}>
                <div style={{ padding: "6px", textAlign: 'center' }}>
                    <strong>Dal: <span>{moment(this.props.fromData).format(this.props.timeUnit)}</span> -
                    al: <span>{moment(this.props.toData).format(this.props.timeUnit)}</span></strong>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        variabiliMeteo: state.daterangelabel?.variabiliMeteo,
        fromData: state.daterangelabel?.fromData ? new Date(state.daterangelabel.fromData) : new Date(moment().subtract(1, 'month')._d),
        toData: state.daterangelabel?.toData ? new Date(state.daterangelabel.toData) : new Date(moment().subtract(1, 'day')._d)
    };
};

const DateRangeLabelPlugin = connect(
    mapStateToProps, {
        onSetVariabiliMeteo: setVariabiliMeteo
    }
)(DateRangeLabel);

export default createPlugin("DateRangeLabelPlugin", {
    component: assign(DateRangeLabelPlugin, {
        MapFooter: {
            name: 'dateRangeLabel',
            position: 2,
            tool: true,
            priority: 1
        }
    }),
    reducers: { daterangelabel },
    epics: { updateDateLabelEpic }
});

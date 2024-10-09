/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import assign from 'object-assign';
import RangePickerInfo from '../components/datepickers/RangePickerInfo';
import updateDateLabelEpic from '../epics/daterangelabel';
import moment from 'moment';

import daterangelabel from '../reducers/daterangelabel';


class DateRangeLabel extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        id: PropTypes.string,
        fromData: PropTypes.instanceOf(Date),
        toData: PropTypes.instanceOf(Date)
    }
    static defaultProps = {
        id: "mapstore-daterangelabel",
        style: {
            position: "absolute",
            bottom: 20,            // Distanza dal fondo della pagina
            left: "50%",           // Centra l'elemento orizzontalmente
            transform: "translateX(-50%)",  // Sposta l'elemento indietro della metà della sua larghezza per centrarlo esattamente
            zIndex: 2000
        }
    };
    render() {
        return (
            <div style={this.props.style}>
                <RangePickerInfo
                    labelTitleId="gcapp.fixedRangePicker.titlePeriod"
                    fromData={this.props.fromData}
                    toData={this.props.toData}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        fromData: state.daterangelabel?.fromData || new Date(moment().subtract(1, 'month')._d),
        toData: state.daterangelabel?.toData || new Date(moment().subtract(1, 'day')._d)
    };
};

const DateRangeLabelPlugin = connect(
    mapStateToProps
)(DateRangeLabel);

export default createPlugin("DateRangeLabelPlugin", {
    component: assign(DateRangeLabelPlugin, {
        GridContainer: {
            id: 'dateRangeLabelP',
            name: 'dateRangeLabel',
            tool: true,
            position: 1,
            priority: 1
        }
    }),
    reducers: { daterangelabel },
    epics: { updateDateLabelEpic }
});

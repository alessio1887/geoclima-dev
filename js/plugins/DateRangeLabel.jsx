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
import assign from 'object-assign';
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
            left: "53%",
            transform: "translateX(-50%)"
        }
    };
    render() {
        return (
            <div className="daterangelabel" style={this.props.style}>
                <div style={{ padding: "6px", textAlign: 'center' }}>
                    <strong>Dal: <span>{moment(this.props.fromData).format('DD/MM/YYYY')}</span> -
                    al: <span>{moment(this.props.toData).format('DD/MM/YYYY')}</span></strong>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        fromData: state.daterangelabel?.fromData ? new Date(state.daterangelabel.fromData) : new Date(moment().subtract(1, 'month')._d),
        toData: state.daterangelabel?.toData ? new Date(state.daterangelabel.toData) : new Date(moment().subtract(1, 'day')._d)
    };
};

const DateRangeLabelPlugin = connect(
    mapStateToProps
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

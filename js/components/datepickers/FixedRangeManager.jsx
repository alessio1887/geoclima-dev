/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { DateTimePicker, DropdownList } from 'react-widgets';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './rangemanager.css';

const FixedRangeManager = (props) => {
    return (
        <div className="ms-fixedrangemanager-action">
            <Label className={props.styleLabels}><Message msgId="gcapp.fixedRangePicker.selectCumulativePeriod" /></Label>
            <DropdownList
                id="period1"
                key={props.periodType}
                data={props.periodTypes}
                valueField="key"
                textField="label"
                value={props.periodType}
                onChange={props.onChangePeriod}
                disabled={props.isInteractionDisabled} />
            <Label className={props.styleLabels}><Message msgId="gcapp.fixedRangePicker.selectDateHidrologicYear" /></Label>
            <DateTimePicker
                culture="it"
                time={ props.format === DATE_FORMAT ? false : true}
                min={props.minDate}
                max={props.maxDate}
                format={props.format}
                editFormat={props.format}
                value={moment(props.toData, props.format).toDate()}
                onChange={props.onChangeToData}
                disabled={props.isInteractionDisabled} />
        </div>
    );
};

export default FixedRangeManager;

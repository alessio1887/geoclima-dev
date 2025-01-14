/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { DateTimePicker } from 'react-widgets';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './rangemanager.css';

const FreeRangeManager = ({
    fromData,
    toData,
    minDate,
    maxDate,
    onChangeFromData,
    onChangeToData,
    isInteractionDisabled,
    styleLabels,
    format
}) => {
    return (
        <div className="ms-freerangemanager-action">
            <Label className={styleLabels}>
                <Message msgId="gcapp.freeRangePicker.selectFromDate"/>
            </Label>
            <DateTimePicker
                culture="it"
                time={ format === DATE_FORMAT ? false : true }
                min={minDate}
                max={maxDate}
                format={format}
                editFormat={format}
                value={moment(fromData, format).toDate()}
                onChange={onChangeFromData}
                disabled={isInteractionDisabled}
            />
            <Label className={styleLabels}>
                <Message msgId="gcapp.freeRangePicker.selectToDate"/>
            </Label>
            <DateTimePicker
                culture="it"
                time={ format === DATE_FORMAT ? false : true }
                min={minDate}
                max={maxDate}
                format={format}
                editFormat={format}
                value={moment(toData, format).toDate()}
                onChange={onChangeToData}
                disabled={isInteractionDisabled}
            />
        </div>
    );
};

export default FreeRangeManager;

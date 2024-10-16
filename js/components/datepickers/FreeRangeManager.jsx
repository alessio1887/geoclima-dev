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
import moment from 'moment';

import './rangemanager.css';

const FreeRangeManager = ({
    fromData,
    toData,
    onChangeFromData,
    onChangeToData,
    isInteractionDisabled,
    styleLabels
}) => {
    return (
        <div className="ms-freerangemanager-action">
            <Label className={styleLabels}>
                <Message msgId="gcapp.freeRangePicker.selectFromDate"/>
            </Label>
            <DateTimePicker
                culture="it"
                time={false}
                min={new Date("1991-01-01")}
                max={moment().subtract(1, 'day')._d}
                format={"DD MMMM, YYYY"}
                editFormat={"YYYY-MM-DD"}
                value={new Date(fromData)}
                onChange={onChangeFromData}
                disabled={isInteractionDisabled}
            />
            <Label className={styleLabels}>
                <Message msgId="gcapp.freeRangePicker.selectToDate"/>
            </Label>
            <DateTimePicker
                culture="it"
                time={false}
                min={new Date("1991-01-02")}
                max={moment().subtract(1, 'day')._d}
                format={"DD MMMM, YYYY"}
                editFormat={"YYYY-MM-DD"}
                value={new Date(toData)}
                onChange={onChangeToData}
                disabled={isInteractionDisabled}
            />
        </div>
    );
};

export default FreeRangeManager;

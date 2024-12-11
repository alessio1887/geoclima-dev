/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { DateTimePicker } from 'react-widgets';
import { Button, Glyphicon } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import DateAPI from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './dailydatepicker.css';

const DailyManager = ({
    minDate,
    maxDate,
    toData,
    isInteractionDisabled,
    isDecrementDisabled,
    isIncrementDisabled,
    onChangePeriodToData,
    updateParams,
    alertMessage,
    onOpenAlert,
    onCloseAlert
}) => {
    const [defaultToData, setDefaultToData] = useState(new Date(maxDate));

    // Increment the date by 1 day
    const incrementDate = () => {
        const newToData = moment(toData).add(1, 'days').toDate();
        onChangePeriodToData(newToData);
        updateParams({
            fromData: moment(newToData).clone().subtract(1, 'day').toDate(),
            toData: newToData
        });
    };
    // Decrement the date by 1 day
    const decrementDate = () => {
        const newToData = moment(toData).subtract(1, 'days').toDate();
        onChangePeriodToData(newToData);
        updateParams({
            fromData: moment(newToData).clone().subtract(1, 'day').toDate(),
            toData: newToData
        });
    };
    const handleChangeDay = () => {
        if (!toData || isNaN(toData) || !(toData instanceof Date)) {
            // restore defult values
            onChangePeriodToData(new Date(defaultToData));
            return;
        }
        const validation = DateAPI.validateDay(toData, minDate, maxDate);
        if (!validation.isValid) {
            onOpenAlert(validation.errorMessage);
            return;
        }
        if (alertMessage !== null) {
            onCloseAlert();
        }
        const fromData =  moment(toData).clone().subtract(1, 'day').toDate();
        updateParams({
            fromData: fromData,
            toData: toData
        });
        // set default value
        setDefaultToData(toData);
    };

    return (
        <div className="ms-dailydatepicker-container">
            <div className="ms-dailydatepicker-calendar">
                <Button  onClick={decrementDate} disabled={isDecrementDisabled}>
                    <Glyphicon glyph="glyphicon glyphicon-chevron-left" />
                </Button>
                <DateTimePicker
                    culture="it"
                    time={false}
                    min={minDate}
                    max={maxDate}
                    format={"YYYY-MM-DD"}
                    editFormat={"YYYY-MM-DD"}
                    value={moment(toData, "YYYY-MM-DD").toDate()}
                    onChange={onChangePeriodToData}
                    disabled={isInteractionDisabled} />
                <Button onClick={incrementDate} disabled={isIncrementDisabled}>
                    <Glyphicon glyph="glyphicon glyphicon-chevron-right" />
                </Button>
            </div>
            <Button onClick={handleChangeDay} disabled={isInteractionDisabled} id="button-dailydatepicker-button">
                <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton" />
            </Button>
        </div>
    );
};

export default DailyManager;

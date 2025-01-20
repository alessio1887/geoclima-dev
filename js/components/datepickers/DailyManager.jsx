/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { DateTimePicker } from 'react-widgets';
import { ButtonGroup, Button, Glyphicon } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import DateAPI, { DATE_FORMAT } from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './dailydatepicker.css';

const DailyManager = ({
    minDate,
    maxDate,
    toData,
    format,
    isInteractionDisabled,
    onChangePeriodToData,
    updateParams,
    alertMessage,
    onOpenAlert,
    onCloseAlert
}) => {
    const [defaultToData, setDefaultToData] = useState(new Date(maxDate));

    // Definizione delle variabili di disabilitazione
    const isDecrementDayDisabled = isInteractionDisabled || moment(toData).isBefore(moment(minDate).add(1, 'day'));
    const isDecrementHourDisabled = isInteractionDisabled || moment(toData).isSameOrBefore(moment(minDate));

    const isIncrementDayDisabled = isInteractionDisabled || moment(toData).isAfter(moment(maxDate).subtract(1, 'day'));
    const isIncremenHourtDisabled = isInteractionDisabled || moment(toData).isSameOrAfter(moment(maxDate));
    /*
    // Increment the date by 1 day
    const incrementDate = () => {
        const newToData = moment(toData).add(1, 'days').format();
        onChangePeriodToData(newToData);
        updateParams({
            fromData: moment(newToData).clone().subtract(1, 'month').format(format),
            toData: newToData
        });
    };
    // Decrement the date by 1 day
    const decrementDate = () => {
        const newToData = moment(toData).subtract(1, 'days').format();
        onChangePeriodToData(newToData);
        updateParams({
            fromData: moment(newToData).clone().subtract(1, 'month').format(format),
            toData: newToData
        });
    };
    */
    const changeDateTime = (timeUnit, amount) => {
        const newToData = moment(toData).add(amount, timeUnit).format(format);
        onChangePeriodToData(newToData);
        const validation = DateAPI.validateOneDate(toData, minDate, maxDate, format);
        if (!validation.isValid) {
            onOpenAlert(validation.errorMessage);
            return;
        }
        if (alertMessage !== null) {
            onCloseAlert();
        }
        updateParams({
            fromData: moment(newToData).clone().subtract(1, 'month').format(format),
            toData: newToData
        });
    };
    const handleChangeDay = () => {
        if (!toData || isNaN(toData) || !(toData instanceof Date)) {
            // restore defult values
            onChangePeriodToData(new Date(defaultToData));
            return;
        }
        const validation = DateAPI.validateOneDate(toData, minDate, maxDate, format);
        if (!validation.isValid) {
            onOpenAlert(validation.errorMessage);
            return;
        }
        if (alertMessage !== null) {
            onCloseAlert();
        }
        const fromData =  moment(toData).clone().subtract(1, 'month').toDate();
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
                <Button  onClick={() => changeDateTime('days', -1)} disabled={isDecrementDayDisabled}>
                    <Glyphicon glyph="glyphicon glyphicon-chevron-left" />
                </Button>
                <DateTimePicker
                    culture="it"
                    time={ format === DATE_FORMAT ? false : true }
                    min={minDate}
                    max={maxDate}
                    format={format}
                    editFormat={format}
                    value={moment(toData, format).toDate()}
                    onChange={onChangePeriodToData}
                    disabled={isInteractionDisabled} />
                <Button onClick={() => changeDateTime('days', +1)} disabled={isIncrementDayDisabled}>
                    <Glyphicon glyph="glyphicon glyphicon-chevron-right" />
                </Button>
            </div>
            <ButtonGroup id="button-dailydatepicker-button">
                { format !== DATE_FORMAT && (<Button onClick={() => changeDateTime('hours', -1)} disabled={isDecrementHourDisabled}
                ><Glyphicon glyph="glyphicon glyphicon-minus" />
                </Button>) }
                <Button onClick={handleChangeDay} disabled={isInteractionDisabled}>
                    <Glyphicon glyph="calendar" /><Message msgId="gcapp.applyPeriodButton" />
                </Button>
                { format !== DATE_FORMAT && (<Button onClick={() => changeDateTime('hours', +1)} disabled={isIncremenHourtDisabled}
                >
                    <Glyphicon glyph="glyphicon glyphicon-plus" />
                </Button>) }
            </ButtonGroup>
        </div>
    );
};

export default DailyManager;

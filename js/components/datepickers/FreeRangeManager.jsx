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
import Message from '@mapstore/components/I18N/Message';
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
    format,
    lablesType,
    isReadOnly
}) => {
    return (
        <div className="ms-freerangemanager-action">
            <Label className={styleLabels}>
                <Message msgId= {lablesType + ".selectFromDate" }/>
            </Label>
            <DateTimePicker
                culture="it"
                time={format === DATE_FORMAT ? false : true}
                min={minDate}
                max={maxDate}
                format={format}
                editFormat={format}
                value={!isReadOnly ? moment(fromData, format).toDate() : undefined} // Usa value solo se editabile
                defaultValue={isReadOnly ? moment(fromData, format).toDate() : undefined} // Mostra valore iniziale se read-only
                onChange={!isReadOnly ? onChangeFromData : undefined} // Usa onChange solo se editabile
                disabled={isInteractionDisabled}
                readOnly={isReadOnly}
            />
            <Label className={styleLabels}>
                <Message msgId={lablesType + ".selectToDate"} />
            </Label>
            <DateTimePicker
                culture="it"
                time={format === DATE_FORMAT ? false : true}
                min={minDate}
                max={maxDate}
                format={format}
                editFormat={format}
                value={!isReadOnly ? moment(toData, format).toDate() : undefined} // Usa value solo se editabile
                defaultValue={isReadOnly ? moment(toData, format).toDate() : undefined} // Mostra valore iniziale se read-only
                onChange={!isReadOnly ? onChangeToData : undefined} // Usa onChange solo se editabile
                disabled={isInteractionDisabled}
                readOnly={isReadOnly}
            />
        </div>
    );
};

export default FreeRangeManager;

/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './rangepickerinfo.css';

const RangePickerInfo = ({ fromData,
    toData,
    labelTitleId,
    format,
    isInteractionDisabled
}) => (
    <div className="labels-container">
        <Label className="labels-rangepicker">
            <Message msgId={labelTitleId} />
        </Label>
        <strong>
            <div style={{
                padding: "6px",
                textAlign: 'center',
                backgroundColor: isInteractionDisabled ? 'lightgray' : 'white'
            }}>
            Dal: <span id="from-data-statistics">{moment(fromData).format(format)}</span>
                {format !== DATE_FORMAT && <br />}
            - al: <span id="to-data-statistics">{moment(toData).format(format)}</span>
            </div>
        </strong>
    </div>
);

export default RangePickerInfo;

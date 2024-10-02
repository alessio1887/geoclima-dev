import React from 'react';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message'
import moment from 'moment';

import './rangepickerinfo.css';

const RangePickerInfo = ({ fromData, toData, labelTitleId }) => (
    <div className="labels-container">
        <Label className="labels-rangepicker">
            <Message msgId={labelTitleId} />
        </Label>
        <div style={{ padding: "6px", textAlign: 'center' }}>
            Dal: <span id="from-data-statistics">{moment(fromData).format('DD/MM/YYYY')}</span> - al: <span id="to-data-statistics">{moment(toData).format('DD/MM/YYYY')}</span>
        </div>
    </div>
);

export default RangePickerInfo;

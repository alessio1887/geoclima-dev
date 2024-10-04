import React from 'react';
import { DateTimePicker, DropdownList } from 'react-widgets';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import moment from 'moment';
import { PERIOD_TYPES } from '../../utils/ManageDateUtils';

import './fixedrangemanager.css';

const FixedRangeManager = (props) => {
    return (
        <div className="ms-fixedrangemanager-action">
            <Label className={props.styleLabels}><Message msgId="gcapp.fixedRangePicker.selectDateHidrologicYear" /></Label>
            <DateTimePicker
                culture="it"
                time={false}
                min={new Date("1991-01-01")}
                max={moment().subtract(1, 'day')._d}
                format={"DD MMMM, YYYY"}
                editFormat={"YYYY-MM-DD"}
                value={new Date(props.toData)}
                onChange={props.onChangeToData}
                disabled={props.isInteractionDisabled} />
            <Label className={props.styleLabels}><Message msgId="gcapp.fixedRangePicker.selectCumulativePeriod" /></Label>
            <DropdownList
                id="period1"
                key={props.periodType || "1"}
                data={PERIOD_TYPES}
                valueField="key"
                textField="label"
                value={props.periodType || "1"}
                onChange={props.onChangePeriod}
                disabled={props.isInteractionDisabled} />
        </div>
    );
};

export default FixedRangeManager;

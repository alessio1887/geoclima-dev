import React from 'react';
import { DateTimePicker, DropdownList } from 'react-widgets';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import moment from 'moment';

import './fixedrangemanager.css';

const FixedRangeManager = (props) => {
    const periodTypes = [
        { key: "1", label: "1 Mese" },
        { key: "3", label: "3 Mesi" },
        { key: "4", label: "4 Mesi" },
        { key: "6", label: "6 Mesi" },
        { key: "12", label: "12 Mesi" },
        { key: "10", label: "dal 1° Ottobre" }
    ];

    return (
        <div className="ms-fixedrangemanager-action">
            <Label className="labels-fixedrangemanager"><Message msgId="gcapp.fixedRangePicker.selectDateHidrologicYear" /></Label>
            <DateTimePicker
                culture="it"
                time={false}
                min={new Date("1991-01-01")}
                max={moment().subtract(1, 'day')._d}
                format={"DD MMMM, YYYY"}
                editFormat={"YYYY-MM-DD"}
                value={new Date(props.toData)}
                onChange={props.onChangeYear}
                disabled={props.isInteractionDisabled} />
            <Label className="labels-fixedrangemanager"><Message msgId="gcapp.fixedRangePicker.selectCumulativePeriod" /></Label>
            <DropdownList
                id="period1"
                key={props.periodType || "1"}
                data={periodTypes}
                valueField="key"
                textField="label"
                value={props.periodType || "1"}
                onChange={props.onChangePeriod}
                disabled={props.isInteractionDisabled} />
        </div>
    );
};

export default FixedRangeManager;

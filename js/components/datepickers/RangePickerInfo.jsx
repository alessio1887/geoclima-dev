import React from 'react';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import LoadingSpinner from '../misc/LoadingSpinner';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

import './rangepickerinfo.css';

const RangePickerInfo = ({
    fromData,
    toData,
    labelTitleId,
    format,
    isInteractionDisabled
}) => {
    const renderPickerInfo = () => (
        <>
         Dal: <span id="from-data-statistics">{moment(fromData).format(format)}</span>
            {format !== DATE_FORMAT && <br />}
        - al: <span id="to-data-statistics">{moment(toData).format(format)}</span>
        </>
    );

    return (
        <div className="labels-container">
            <Label className="labels-rangepicker">
                <Message msgId={labelTitleId} />
            </Label>
            <strong>
                <div
                    style={{
                        padding: "6px",
                        textAlign: 'center',
                        backgroundColor: isInteractionDisabled ? 'lightgray' : 'white'
                    }}
                >
                    { isInteractionDisabled ? ( <LoadingSpinner /> ) : ( renderPickerInfo() )}
                </div>
            </strong>
        </div>
    );
};

export default RangePickerInfo;

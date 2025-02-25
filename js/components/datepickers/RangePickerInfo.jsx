import React from 'react';
import { Label } from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
import Spinner from 'react-spinkit'; // Assumendo che tu stia usando react-spinkit per lo spinner
momentLocaliser(moment);

import './rangepickerinfo.css';

const RangePickerInfo = ({
    fromData,
    toData,
    labelTitleId,
    format,
    isInteractionDisabled
}) => {
    // Funzione per visualizzare lo spinner
    const renderLoading = () => (
        <div className="loading-overlay" aria-live="assertive">
            <div className="loading-spinner">
                <Message msgId="gcapp.loading" />
                <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" />
            </div>
        </div>
    );

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
                    { true ? ( renderLoading() ) : ( renderPickerInfo() )}
                </div>
            </strong>
        </div>
    );
};

export default RangePickerInfo;

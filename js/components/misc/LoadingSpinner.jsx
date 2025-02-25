import React from 'react';
import Spinner from 'react-spinkit';
import Message from '@mapstore/components/I18N/Message';
import './loadingspinner.css';

const LoadingSpinner = () => (
    <div className="loading-overlay" aria-live="assertive">
        <div className="loading-spinner">
            <Message msgId="gcapp.loading" />
            <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" />
        </div>
    </div>
);

export default LoadingSpinner;

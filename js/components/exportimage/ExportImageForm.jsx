import React from 'react';
import {Button, FormGroup } from 'react-bootstrap';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';

const ExportImageForm = ({ fromData, toData, timeUnit, isInteractionDisabled // , onToggleControl
}) => {
    return (
        <FormGroup>
            <FreeRangeManager
                fromData={fromData}
                toData={toData}
                isInteractionDisabled={isInteractionDisabled}
                styleLabels="labels-infochart"
                format={timeUnit}
                isReadOnly={true}
            />
        </FormGroup>
    );
};

export default ExportImageForm;


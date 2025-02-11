import React from 'react';
import {Button, FormGroup, Label } from 'react-bootstrap';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import SelectVariableTab from '../../components/dropdowns/SelectVariableTab';
import Message from '@mapstore/components/I18N/Message';

const ExportImageForm = ({ fromData, toData, timeUnit, tabList, tabVariables, isInteractionDisabled, handleChangeTab, handleChangeVariable
}) => {

    const getActiveTab = () => {
        return tabVariables.find(tab => tab.active === true);
    };

    return (
        <FormGroup>
            <Label className="labels-infochart"><Message msgId="gcapp.exportImage.selectMeteoVariable"/></Label>
            <SelectVariableTab
                tabList={tabList}
                onChangeSingleVariable={handleChangeVariable}
                activeTab={getActiveTab()}
                onChangeTab={handleChangeTab}
            />
            <FreeRangeManager
                fromData={fromData}
                toData={toData}
                isInteractionDisabled={isInteractionDisabled}
                styleLabels="labels-infochart"
                lablesType="gcapp.exportImage"
                format={timeUnit}
                isReadOnly={true}
            />
        </FormGroup>
    );
};

export default ExportImageForm;


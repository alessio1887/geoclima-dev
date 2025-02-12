import React from 'react';
import {Button, FormGroup, Label } from 'react-bootstrap';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import SelectVariableTab from '../../components/dropdowns/SelectVariableTab';
import Message from '@mapstore/components/I18N/Message';
import './exportimage.css';

const ExportImageForm = ({ fromData, toData, timeUnit, tabList, tabVariables, isInteractionDisabled, handleChangeTab, handleChangeVariable
}) => {

    const getActiveTab = () => {
        return tabVariables.find(tab => tab.active === true);
    };

    const changeSingleVariable = (selectedVariable, tabVariable) => {
        handleChangeVariable(tabVariable, [selectedVariable]);
    };

    return (
        <FormGroup className="exportimage-from">
            <Label className="labels-exportimage"><Message msgId="gcapp.exportImage.selectMeteoVariable"/></Label>
            <SelectVariableTab
                tabList={tabList}
                onChangeSingleVariable={changeSingleVariable}
                activeTab={getActiveTab()}
                onChangeTab={handleChangeTab}
                isInteractionDisabled={isInteractionDisabled}
            />
            <FreeRangeManager
                fromData={fromData}
                toData={toData}
                isInteractionDisabled={isInteractionDisabled}
                styleLabels="labels-exportimage"
                lablesType="gcapp.exportImage"
                format={timeUnit}
                isReadOnly={true}
            />
        </FormGroup>
    );
};

export default ExportImageForm;


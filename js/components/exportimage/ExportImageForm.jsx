import React from 'react';
import { DateTimePicker } from 'react-widgets';
import { Button, ButtonGroup, FormGroup, Label } from 'react-bootstrap';
import FreeRangeManager from '../../components/datepickers/FreeRangeManager';
import SelectVariableTab from '../buttons/SelectVariableTab';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import Message from '@mapstore/components/I18N/Message';
import './exportimage.css';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const ExportImageForm = ({
    fileNameExported,
    fromData,
    toData,
    timeUnit,
    tabList,
    tabVariables,
    isInteractionDisabled,
    handleChangeTab,
    handleChangeVariable,
    apiUrl,
    imageUrl,
    exportImage,
    clearImageUrl,
    alertMessage
}) => {

    const getActiveTab = () => {
        return tabVariables.find(tab => tab.active === true);
    };

    const changeSingleVariable = (selectedVariable, tabVariable) => {
        clearImageUrl();
        handleChangeVariable(tabVariable, [selectedVariable]);
    };

    const handleExportImage = () => {
        const layerName = getActiveTab().variables[0].id;
        if (imageUrl) {
            clearImageUrl();
        }
        const fromDataFormatted = moment(fromData).format(timeUnit);
        const toDataFormatted = moment(toData).format(timeUnit);
        exportImage(layerName, fromDataFormatted, toDataFormatted, apiUrl);
    };

    const noop = () => {};   // Funzione vuota per evitare warning

    const renderRangeManager = () => (
        <FreeRangeManager
            fromData={fromData}
            toData={toData}
            isInteractionDisabled
            styleLabels="labels-exportimage"
            lablesType="gcapp.exportImage"
            format={timeUnit}
            onChangeFromData={noop}
            onChangeToData={noop}
        />
    );

    const renderOneDate = () => (
        <div className="ms-freerangemanager-action">
            <Label className="labels-exportimage">
                <Message msgId= {"gcapp.exportImage.selectOneDate" }/>
            </Label>
            <DateTimePicker
                culture="it"
                time={ timeUnit === DATE_FORMAT ? false : true }
                format={timeUnit}
                value={moment(toData, timeUnit).toDate()}
                onChange={noop}
                disabled
            />
        </div>
    );

    return (
        <FormGroup className="exportimage-from">
            <Label className="labels-exportimage"><Message msgId="gcapp.exportImage.selectMeteoVariable"/></Label>
            <SelectVariableTab
                idContainer="exportimage"
                tabList={tabList}
                onChangeSingleVariable={changeSingleVariable}
                activeTab={getActiveTab()}
                onChangeTab={handleChangeTab}
                isInteractionDisabled={isInteractionDisabled}
            />
            { getActiveTab().showOneDatePicker ? ( renderOneDate() ) : ( renderRangeManager() )}
            <ButtonGroup id="button-exportimage-container">
                <div id="button-exportimage-apicall-clear">
                    <Button onClick={() => handleExportImage()} disabled={isInteractionDisabled}>
                        <Message msgId="gcapp.exportImage.apiCall" />
                    </Button>
                    <Button onClick={() => clearImageUrl()} disabled={isInteractionDisabled}>
                        <Message msgId="gcapp.exportImage.clearImageUrl" />
                    </Button>
                </div>
                {imageUrl && (<Button id="button-exportimage-downloadImage"
                    variant="success"
                    href={imageUrl}
                    download={fileNameExported}
                    disabled={isInteractionDisabled}>
                    <Message msgId="gcapp.exportImage.downloadImage" />
                </Button>
                )}
            </ButtonGroup>
            {alertMessage && (
                <div className="exportimage-alert-date" >
                    <strong><Message msgId="warning"/></strong>
                    <span ><Message msgId={alertMessage}/></span>
                </div>
            )}
        </FormGroup>
    );
};

export default ExportImageForm;


/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import Message from '@mapstore/components/I18N/Message';
import { toggleControl } from '@mapstore/actions/controls';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import ResponsivePanel from '@mapstore/components/misc/panels/ResponsivePanel';
import Dialog from '@mapstore/components/misc/Dialog';

import { exportImageEnabledSelector, fileNameSelector, fromDataSelector, toDataSelector,
    isLayerLoadingSelector, tabVariablesSelector, imageUrlSelector, exportImageApiSelector } from '../selectors/exportImage';
import * as exportImageEpics from '../epics/exportImage';
import exportimage from '../reducers/exportimage';
import { initializeVariableTabs, setVariabiliMeteo, changeTab, changeImageVariable,
    exportImage, clearImageUrl } from '../actions/exportimage';

import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
import ExportImageForm from '../components/exportimage/ExportImageForm';
momentLocaliser(moment);

const PLUGIN_GLYPH_ICON = "export";

/**
 * ExportImage component
 *
 * This component acts as a container for the ExportImage plugin.
 * It wraps the content inside a Dialog component with maskLoading enabled,
 * so that a loading mask (with react-spinkit spinner) is displayed during loading.
 */
const ExportImage = ({
    active,
    defaultUrlExportImage,
    fileNameExported,
    fromData,
    isInteractionDisabled,
    maskLoading,
    onToggleControl,
    tabList,
    timeUnit,
    toData,
    onClearImageUrl,
    onChangeImageVariable,
    onChangeTab,
    onExportImage,
    onInitializeVariableTabs,
    onSetVariabiliMeteo,
    variabiliMeteo,
    tabVariables,
    imageUrl
}) => {
    // useRef stores the previous values of fromData and toData
    const prevFromData = useRef(fromData);
    const prevToData = useRef(toData);

    const initializeTabs = useCallback(() => {
        const tabVariablesInit = tabList.map((tab, index) => ({
            id: tab.id,
            variables: [tab.groupList[0]], // Select the first group as default
            active: index === 0 // Set the first tab as active
        }));
        onInitializeVariableTabs(tabVariablesInit);
    }, [tabList, onInitializeVariableTabs]);

    useEffect(() => {
        // When the component mounts, set variabiliMeteo in the Redux state
        if (variabiliMeteo) {
            onSetVariabiliMeteo(variabiliMeteo);
        }
        initializeTabs();
    }, [variabiliMeteo, onSetVariabiliMeteo, initializeTabs]);

    useEffect(() => {
        // Check if fromData or toData have changed compared to previous values
        if (prevFromData.current !== fromData || prevToData.current !== toData) {
            // If imageUrl is set, clear it by calling onClearImageUrl
            if (imageUrl) {
                onClearImageUrl();
            }
        }
        // Update refs with the new values
        prevFromData.current = fromData;
        prevToData.current = toData;
    }, [fromData, toData, imageUrl, onClearImageUrl]);

    return (
        <ResponsivePanel
            containerId="export-image-container"
            containerClassName="export-image-container"
            size={400}
            open={active}
            position="right"
            bsStyle="primary"
            glyph={PLUGIN_GLYPH_ICON}
            title={<Message msgId="exportImage.title" />}
            onClose={onToggleControl}
        >
            <Dialog
                id="export-image-dialog"
                // maskLoading={isInteractionDisabled}  // This enables the loading mask with react-spinkit animation
                maskLoading={maskLoading}
                draggable={false}  // Puoi modificare se vuoi rendere il dialog trascinabile
                backgroundStyle={{ background: "rgba(0, 0, 0, 0.5)" }}
                containerClassName="export-image-dialog-container"
                onClickOut={onToggleControl}
                style={{
                    top: "-200px",
                    right: "20px"
                }}
            >
                <ExportImageForm
                    fileNameExported={fileNameExported}
                    fromData={fromData}
                    toData={toData}
                    variabiliMeteo={variabiliMeteo}
                    tabList={tabList}
                    tabVariables={tabVariables}
                    timeUnit={timeUnit}
                    isInteractionDisabled={isInteractionDisabled}
                    handleChangeTab={onChangeTab}
                    handleChangeVariable={onChangeImageVariable}
                    apiUrl={defaultUrlExportImage}
                    imageUrl={imageUrl}
                    exportImage={onExportImage}
                    clearImageUrl={onClearImageUrl}
                    role="body"
                />
            </Dialog>
        </ResponsivePanel>
    );
};

const mapStateToProps = createStructuredSelector({
    fileNameExported: fileNameSelector,
    fromData: fromDataSelector,
    maskLoading: exportImageApiSelector,
    toData: toDataSelector,
    active: exportImageEnabledSelector,
    isInteractionDisabled: isLayerLoadingSelector,
    tabVariables: tabVariablesSelector,
    imageUrl: imageUrlSelector
});

const mapDispatchToProps = {
    onChangeImageVariable: changeImageVariable,
    onChangeTab: changeTab,
    onClearImageUrl: clearImageUrl,
    onExportImage: exportImage,
    onInitializeVariableTabs: initializeVariableTabs,
    onSetVariabiliMeteo: setVariabiliMeteo,
    onToggleControl: () => toggleControl('exportImage', 'enabled')
};

export default createPlugin('ExportImage', {
    component: connect(mapStateToProps, mapDispatchToProps)(ExportImage),
    containers: {
        BurgerMenu: {
            name: 'exportImage',
            position: 1,
            text: <Message msgId="exportImage.title" />,
            icon: <Glyphicon glyph={PLUGIN_GLYPH_ICON} />,
            action: () => toggleControl('exportImage', 'enabled'),
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'exportImage',
            position: 1,
            icon: <Glyphicon glyph={PLUGIN_GLYPH_ICON} />,
            text: <Message msgId="exportImage.title" />,
            action: () => toggleControl('exportImage', 'enabled'),
            toggle: true,
            priority: 1,
            doNotHide: true
        }
    },
    reducers: { exportimage },
    epics: exportImageEpics
});

/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import Message from '@mapstore/components/I18N/Message';
import { toggleControl } from '@mapstore/actions/controls';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import ResponsivePanel from '@mapstore/components/misc/panels/ResponsivePanel';
import { exportImageEnabledSelector, fromDataSelector, toDataSelector, isLayerLoadingSelector } from '../utils/geoclimaSelectors';
import * as exportImageEpics from '../epics/exportImage';
import exportimage from '../reducers/exportimage';
import { initializeVariableTabs, setVariabiliMeteo, changeTab, changeImageVariable, exportImage } from '../actions/exportimage';


import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
import ExportImageForm from '../components/exportimage/ExportImageForm';
momentLocaliser(moment);

const PLUGIN_GLYPH_ICON = "export";

/**
 * ExportImage component
 * @memberof plugins
 * @name ExportImage
 */
const ExportImage = ({
    active,
    defaultUrlExportImage,
    fromData,
    isInteractionDisabled,
    onToggleControl,
    tabList,
    timeUnit,
    toData,
    onChangeImageVariable,
    onChangeTab,
    onExportImage,
    onInitializeVariableTabs,
    onSetVariabiliMeteo,
    variabiliMeteo,
    tabVariables
}) => {

    const initializeTabs = useCallback(() => {
        const tabVariablesInit = tabList.map((tab, index) => ({
            id: tab.id,
            variables: [tab.groupList[0]], // Seleziona il primo come default
            active: index === 0 // Imposta il primo tab come attivo
        }));
        onInitializeVariableTabs(tabVariablesInit);
    }, [tabList, onInitializeVariableTabs]); // Aggiungi tabList come dipendenza

    useEffect(() => {
        // Quando il componente si monta, setta variabiliMeteo nello stato Redux
        if (variabiliMeteo) {
            onSetVariabiliMeteo(variabiliMeteo);
        }
        initializeTabs();
    }, [variabiliMeteo, onSetVariabiliMeteo, initializeTabs]); // Aggiungi initializeTabs come dipendenza


    return (
        <ResponsivePanel
            containerId="export-image-container"
            containerClassName="export-image-container"
            // dock={true}
            size={400} // Imposta una larghezza massima (puoi modificarla a piacere)
            open={active}
            position="right"
            bsStyle="primary"
            glyph={PLUGIN_GLYPH_ICON}
            title={<Message msgId="exportImage.title" />}
            onClose={onToggleControl}
        >
            <ExportImageForm
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
                exportImage={onExportImage}
            />
        </ResponsivePanel>
    );
};

const mapStateToProps = createStructuredSelector({
    fromData: fromDataSelector,
    toData: toDataSelector,
    active: exportImageEnabledSelector,
    isInteractionDisabled: isLayerLoadingSelector,
    tabVariables: state => state.exportimage.tabVariables
});

const mapDispatchToProps = {
    onChangeImageVariable: changeImageVariable,
    onChangeTab: changeTab,
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
            position: 7,
            text: <Message msgId="exportImage.title" />,
            icon: <Glyphicon glyph={PLUGIN_GLYPH_ICON} />,
            action: () => toggleControl('exportImage', 'enabled'),
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'exportImage',
            position: 7,
            icon: <Glyphicon glyph={PLUGIN_GLYPH_ICON} />,
            text: <Message msgId="exportImage.title" />,
            action: () => toggleControl('exportImage', 'enabled'),
            toggle: true,
            priority: 1,
            doNotHide: true
        }
    },
    reducers: {  exportimage },
    epics: exportImageEpics
});

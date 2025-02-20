/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { UPDATE_DATES, SET_VARIABILIMETEO, INITIALIZE_TABS, TAB_CHANGED,
    IMAGEVARIABLE_CHANGED, EXPORTIMAGE_SUCCESS, CLEAR_IMAGE_URL } from '../actions/exportimage';
import { DEFAULT_FILENAME } from '../utils/VariabiliMeteoUtils';


const defaultState = {
    fromData: new Date(),
    toData: new Date(),
    fileName: DEFAULT_FILENAME
};

function daterangelabel(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_DATES:
        return {
            ...state,
            fromData: new Date(action.fromData),
            toData: new Date(action.toData)
        };
    case SET_VARIABILIMETEO:
        return {
            ...state,
            variabiliMeteo: action.variabiliMeteo
        };
    case INITIALIZE_TABS:
        return {
            ...state,
            tabVariables: action.tabVariables
        };
    case TAB_CHANGED:
        return {
            ...state,
            tabVariables: state.tabVariables.map(tab => ({
                ...tab,
                active: tab.id === action.idTab // Imposta true solo per il tab con id uguale a idTab
            }))
        };
    case IMAGEVARIABLE_CHANGED:
        return {
            ...state,
            tabVariables: state.tabVariables.map(tab =>
                tab.id === action.idTab
                    ? { ...tab, variables: action.variable } // Aggiorna le variabili del tab corrispondente
                    : tab
            )

        };
    case EXPORTIMAGE_SUCCESS:
        return { ...state, imageUrl: action.urlExportImage, fileName: action.fileName };
    case CLEAR_IMAGE_URL:
        return { ...state, imageUrl: null, fileName: DEFAULT_FILENAME };
    default:
        return state;
    }
}

export default daterangelabel;

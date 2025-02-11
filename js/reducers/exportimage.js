/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { UPDATE_DATES, SET_VARIABILIMETEO, INITIALIZE_TABS, TAB_CHANGED, IMAGEVARIABLE_CHANGED } from '../actions/exportimage';

const defaultState = {
    fromData: new Date(),
    toData: new Date()
};

function daterangelabel(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_DATES:
        return {
            ...state,
            fromData: action.fromData,
            toData: action.toData
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
    default:
        return state;
    }
}

export default daterangelabel;

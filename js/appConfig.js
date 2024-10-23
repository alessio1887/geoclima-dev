/**
 * Copyright 2024, Consorzio LaMMA
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import appConfigMS from '@mapstore/product/appConfig';
import DateAPI from './utils/ManageDateUtils';
import moment from 'moment';
import MapViewerGC from './pages/MapViewerGC';
import ContextGC from './pages/ContextGC';

const fixedrangepicker = {
    isCollapsedPlugin: false,
    fromData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
    toData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
    periodType: "1",
    showFixedRangePicker: true,
    isInteractionDisabled: true
};
const freerangepicker = {
    isCollapsedPlugin: false,
    fromData: new Date(moment().subtract(1, 'month')._d),
    toData: new Date(moment().subtract(1, 'day')._d),
    showFreeRangePicker: false,
    isInteractionDisabled: true
};

export default {
    ...appConfigMS,
    pages: [
        // Added Custom Pages
        ...appConfigMS.pages.map(page => {
            if (page.name === "mapviewer") {
                return {
                    ...page,
                    component: MapViewerGC
                };
            } else if (page.name === "context") {
                return {
                    ...page,
                    component: ContextGC
                };
            }
            return page; // Return the original page if no conditions are met
        })
    ],
    initialState: {
        ...appConfigMS.initialState,
        defaultState: {
            ...appConfigMS.initialState.defaultState,
            fixedrangepicker: fixedrangepicker,
            freerangepicker: freerangepicker
        }
    }
};

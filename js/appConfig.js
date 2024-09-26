/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import appConfigMS from '@mapstore/product/appConfig';
import DateAPI from './utils/ManageDateUtils';
import moment from 'moment';
import MapViewerGC from './pages/MapViewerGC';

const fixedrangepicker = {
    isOpenPlugin: false,
    fromData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
    toData: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
    periodType: "1",
    showFixedRangePicker: true,
    isInteractionDisabled: false
};
const freerangepicker = {
    fromData: new Date(moment().subtract(1, 'month')._d),
    toData: new Date(moment().subtract(1, 'day')._d),
    showFreeRangePicker: false,
    isInteractionDisabled: false
};

export default {
    ...appConfigMS,
    pages: [
        // Added Custom Page
        ...appConfigMS.pages.map(
            page => page.name === "mapviewer" ? {
                ...page,
                component: MapViewerGC
            } : page
        )
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

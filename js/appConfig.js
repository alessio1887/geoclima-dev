/**
 * Copyright 2024, Consorzio LaMMA
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import appConfigMS from '@mapstore/product/appConfig';
import { DEFAULT_DATA_FINE } from './utils/ManageDateUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);
// import MapViewerGC from './pages/MapViewerGC';

const fixedrangepicker = {
    isCollapsedPlugin: false,
    fromData: moment(DEFAULT_DATA_FINE).clone().subtract(1, 'month').startOf('day').toDate(),
    toData: DEFAULT_DATA_FINE,
    periodType: "1",
    showFixedRangePicker: false,
    isInteractionDisabled: true
};
const freerangepicker = {
    isCollapsedPlugin: false,
    fromData: moment(DEFAULT_DATA_FINE).clone().subtract(1, 'month').startOf('day').toDate(),
    toData: DEFAULT_DATA_FINE,
    isInteractionDisabled: true
};

export default {
    ...appConfigMS,
    // Replaced with dynamic configuration logic in mapConfigOnInit.js
    // pages: [
    //     // Added Custom Page
    //     ...appConfigMS.pages.map(
    //         page => page.name === "mapviewer" ? {
    //             ...page,
    //             component: MapViewerGC
    //         } : page
    //     )
    // ],
    initialState: {
        ...appConfigMS.initialState,
        defaultState: {
            ...appConfigMS.initialState.defaultState,
            fixedrangepicker: fixedrangepicker,
            freerangepicker: freerangepicker
        }
    }
};

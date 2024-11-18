/**
 * Copyright 2024, Consorzio LaMMA
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import appConfigMS from '@mapstore/product/appConfig';
import { FROM_DATA, TO_DATA } from './utils/ManageDateUtils';
// import MapViewerGC from './pages/MapViewerGC';

const fixedrangepicker = {
    isCollapsedPlugin: false,
    fromData: FROM_DATA,
    toData: TO_DATA,
    periodType: "1",
    showFixedRangePicker: true,
    isInteractionDisabled: true
};
const freerangepicker = {
    isCollapsedPlugin: false,
    fromData: FROM_DATA,
    toData: TO_DATA,
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

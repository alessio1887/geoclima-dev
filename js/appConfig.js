/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import appConfigMS from '@mapstore/product/appConfig';
import DateAPI from './utils/ManageDateUtils';
import moment from 'moment';

const aitHome = {
    fromData: new Date(DateAPI.calculateDateFromKey("1", moment().subtract(1, 'day')._d).fromData),
    toData: new Date(DateAPI.calculateDateFromKey("1", moment().subtract(1, 'day')._d).toData),
    fromDataReal: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).fromData),
    toDataReal: new Date(DateAPI.calculateDateFromKeyReal("1", moment().subtract(1, 'day')._d).toData),
    periodType: "1"
};
/*
const projectPages = [{
    name: 'mapViewerGC',
    path: '/mapViewerGC',
    component: MapViewerGC
}];
*/
export default {
    ...appConfigMS,
    /*
    pages: [
        ...appConfigMS.pages,
        ...projectPages
    ]
        */
    /*     pages: [
        ...appConfigMS.pages.map(
            page => page.name === "mapviewer" ? {
                ...page,
                component: MapViewer
            } : page
        )
    ],
    */
    initialState: {
        ...appConfigMS.initialState,
        defaultState: {
            ...appConfigMS.initialState.defaultState,
            aithome: aitHome
        }
    }
};

/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../MapStore2/web/client/libs/ajax';
import urlUtil from 'url';
import assign from 'object-assign';
const DEFAULT_URL_AITCHART = 'geoportale.lamma.rete.toscana.it/cgi-bin/ait_app/aitchart.py';
const DEFAULT_URL_AITSTATS = 'geoportale.lamma.rete.toscana.it/cgi-bin/ait_app/aitstats.py';

// const defaultOptions = {
//     format: 'json',
//     bounded: 0,
//     polygon_geojson: 1,
//     priority: 5
// };
/**
 * API for local config
 */
const Api = {
    aitchart: function(data, options) {
        var params = assign({lat: data.latlng.lat, lng: data.latlng.lng, toData: data.toData, fromData: data.fromData, variable: data.variable}, options || {});
        var url = urlUtil.format({
            protocol: window.location.hostname === 'localhost' ? 'https:' : window.location.protocol,
            host: DEFAULT_URL_AITCHART,
            query: params
        });
        return axios.get(url); // TODO the jsonp method returns .promise and .cancel method,the last can be called when user cancel the query
    },
    aitstats: function(coords, options) {
        var params = assign({lat: coords.lat, lng: coords.lng}, options || {});
        var url = urlUtil.format({
            protocol: window.location.hostname === 'localhost' ? 'https:' : window.location.protocol,
            host: DEFAULT_URL_AITSTATS,
            query: params
        });
        return axios.get(url); // TODO the jsonp method returns .promise and .cancel method,the last can be called when user cancel the query
    }
};

export default Api;

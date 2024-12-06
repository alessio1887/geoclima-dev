/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../MapStore2/web/client/libs/ajax';
import assign from 'object-assign';
import urlUtil from 'url';
// const DEFAULT_URL_GEOCLIMA_CHART = 'geoportale.lamma.rete.toscana.it/cgi-bin/geoclima_app/geoclima_chart.py';

// const defaultOptions = {
//     format: 'json',
//     bounded: 0,
//     polygon_geojson: 1,
//     priority: 5
// };
/**
 * API using localConfig.json for AJAX proxy settings
 * The proxy URL and allowed CORS domains are defined in localConfig.json
 */
const Api = {
    geoclimachart: function(data, defaultUrlGeoclimaChart, options) {
        var params = assign({lat: data.latlng.lat, lng: data.latlng.lng, toData: data.toData, fromData: data.fromData, variable: data.variable}, options || {});
        var url = urlUtil.format({
            protocol: window.location.hostname === 'localhost' ? 'https:' : window.location.protocol,
            host: defaultUrlGeoclimaChart,
            query: params
        });
        return axios.get(url); // TODO the jsonp method returns .promise and .cancel method,the last can be called when user cancel the query
    }
};

export default Api;

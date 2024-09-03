/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MapViewerCmp from '../../MapStore2/web/client/product/components/viewer/MapViewerCmp';
import { loadNewMap, loadMapConfig } from '../../MapStore2/web/client/actions/config.js'; // '../actions/config';
import { initMap } from '../../MapStore2/web/client/actions/map.js';
import MapViewerContainer from '../../MapStore2/web/client/containers/MapViewer.jsx';

import url from 'url';

const urlQuery = url.parse(window.location.href, true).query;

// Main page for GeoClima Map. It is used to render the main page.
class MapViewerPageGC extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadNewMap: PropTypes.func,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        wrappedComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        match: {
            params: {}
        },
        wrappedContainer: MapViewerContainer
    };

    render() {
        return (<MapViewerCmp {...this.props} />);
    }
}

export default connect((state) => ({
    mode: urlQuery?.mobile || state?.browser?.mobile ? 'mobile' : 'desktop',
    fromData: state?.aithome?.fromData || new Date('1995-01-01'),
    toData: state?.aithome?.toData || new Date('1995-01-01'),
    fromDataReal: state?.aithome?.fromDataReal || new Date('1995-01-01'),
    toDataReal: state?.aithome?.toDataReal || new Date('1995-01-01')
}),
{   loadNewMap,
    loadMapConfig,
    onInit: initMap
})(MapViewerPageGC);

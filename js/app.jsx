/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { checkForMissingPlugins } from '@mapstore/utils/DebugUtils';
import main from '@mapstore/product/main';
// import custom plugins
import plugins from '@js/plugins';
const ConfigUtils = require('@mapstore/utils/ConfigUtils').default;

/**
 * Add custom (overriding) translations with:
 *
 * ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);
 */
// ConfigUtils.setConfigProp('translationsPath', './MapStore2/web/client/translations');
ConfigUtils.setConfigProp('translationsPath', 'translations');
ConfigUtils.setConfigProp('themePrefix', 'geoclima');

/**
 * Use a custom plugins configuration file with:
 *
 * ConfigUtils.setLocalConfigurationFile('localConfig.json');
 */
// ConfigUtils.setLocalConfigurationFile('MapStore2/web/client/configs/localConfig.json');
ConfigUtils.setLocalConfigurationFile('localConfig.json');

/**
 * Use a custom application configuration file with:
 *
 * const appConfig = require('./appConfig');
 *
 * Or override the application configuration file with (e.g. only one page with a mapviewer):
 *
 * const appConfig = assign({}, require('@mapstore/product/appConfig'), {
 *     pages: [{
 *         name: "mapviewer",
 *         path: "/",
 *         component: require('@mapstore/product/pages/MapViewer')
 *     }]
 * });
 */
// const appConfig = require('@mapstore/product/appConfig').default;
import appConfig from '@js/appConfig';

/**
 * Define a custom list of plugins with:
 *
 * const plugins = require('./plugins');
 */
// const plugins = require('@mapstore/product/plugins').default;


checkForMissingPlugins(plugins.plugins);

main(appConfig, plugins);

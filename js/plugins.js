/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import productPlugins from '@mapstore/product/plugins.js';
import {toModulePlugin} from "@mapstore/utils/ModulePluginsUtils";


export default {
    requires: {
        ...productPlugins.requires
    },
    plugins: {
        ...productPlugins.plugins,
        FreeRangePickerPlugin: toModulePlugin('FreeRangePicker', () => import( '@js/plugins/FreeRangePicker')),
        FixedRangePickerPlugin: toModulePlugin('FixedRangePicker', () => import( '@js/plugins/FixedRangePicker')),
        DateRangeLabelPlugin: toModulePlugin('DateRangeLabel', () => import( '@js/plugins/DateRangeLabel')),
        InfoChartPlugin: toModulePlugin('InfoChartPlugin', () => import( '@js/plugins/InfoChart'))
    }
};

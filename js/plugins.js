/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import FreeRangePickerPlugin from '@js/plugins/FreeRangePicker';
import FixedRangePickerPlugin from '@js/plugins/FixedRangePicker';
import InfoChartPlugin from './plugins/InfoChart';
import DateRangeLabelPlugin from './plugins/DateRangeLabel';
import productPlugins from '@mapstore/product/plugins.js';

export default {
    requires: {
        ...productPlugins.requires
    },
    plugins: {
        ...productPlugins.plugins,
        FreeRangePickerPlugin,
        FixedRangePickerPlugin,
        DateRangeLabelPlugin,
        InfoChartPlugin
    }
};

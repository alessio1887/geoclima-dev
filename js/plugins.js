/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import DateRangePickerPlugin from '@js/plugins/DateRangePicker';
import DecadeRangePickerPlugin from '@js/plugins/DecadeRangePicker';
import productPlugins from '@mapstore/product/plugins.js';

export default {
    requires: {
        ...productPlugins.requires
    },
    plugins: {
        ...productPlugins.plugins,
        DateRangePickerPlugin,
        DecadeRangePickerPlugin
    }
};

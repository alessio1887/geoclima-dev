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

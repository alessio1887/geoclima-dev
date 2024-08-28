import ChangePeriodAitPlugin from '@js/plugins/ChangePeriodAit';
import productPlugins from '@mapstore/product/plugins.js';

export default {
    requires: {
        ...productPlugins.requires
    },
    plugins: {
        ...productPlugins.plugins,
        ChangePeriodAitPlugin
    }
};

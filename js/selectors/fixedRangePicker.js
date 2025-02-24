import { createSelector } from 'reselect';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

export const getFixedRangePickerState = (state) => state?.fixedrangepicker || {};


export const fromDataFormSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.fromData || moment(fixedrangepicker?.lastAvailableDate).clone().subtract(20, 'days').toDate()
);

export const fromDataLayerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.fromDataLayer || null
);

export const toDataFormSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.toData || fixedrangepicker?.lastAvailableDate
);

export const toDataLayerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.toDataLayer || null
);

export const isFixedRangePluginLoadedSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.isPluginLoaded || false
);

export const showFixedRangePickerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.showFixedRangePicker || false
);

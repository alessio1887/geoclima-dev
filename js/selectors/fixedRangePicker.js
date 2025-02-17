import { createSelector } from 'reselect';

export const getFixedRangePickerState = (state) => state?.fixedrangepicker || {};

export const fromDataLayerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.fromDataLayer || null
);

export const toDataLayerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.toDataLayer || null
);

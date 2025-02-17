import { createSelector } from 'reselect';

export const getFreeRangePickerState = (state) => state?.freerangepicker || {};

export const fromDataLayerSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.fromDataLayer || null
);

export const toDataLayerSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.toDataLayer || null
);

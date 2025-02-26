import { createSelector } from 'reselect';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

export const getFreeRangePickerState = (state) => state?.freerangepicker || {};

export const fromDataFormSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.fromData || moment(freerangepicker?.lastAvailableDate).clone().subtract(20, 'days').toDate()
);

export const fromDataLayerSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.fromDataLayer || null
);

export const toDataFormSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.toData || freerangepicker?.lastAvailableDate
);


export const toDataLayerSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.toDataLayer || null
);

export const isPluginLoadedSelector = createSelector(
    [getFreeRangePickerState],
    (freerangepicker) => freerangepicker?.isPluginLoaded || false
);

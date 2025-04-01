/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
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

export const periodTypeSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.periodType || { key: 10, label: "20 giorni", min: 9, max: 20, isDefault: true }
);

export const isPluginLoadedSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.isPluginLoaded || false
);

export const showFixedRangePickerSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.showFixedRangePicker || false
);

export const firstAvailableDateSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.firstAvailableDate
);

export const lastAvailableDateSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.lastAvailableDate
);

export const isCollapsedPluginSelector = createSelector(
    [getFixedRangePickerState],
    (fixedrangepicker) => fixedrangepicker?.isCollapsedPlugin || false
);

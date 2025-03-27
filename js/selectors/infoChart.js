/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { createSelector } from 'reselect';
import { FREE_RANGE } from '@js/utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

export const getInfoChartState = (state) => state?.infochart || {};


export const isPluginLoadedSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.isPluginLoaded || false
);

export const fromDataFormSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.fromData
);

export const toDataFormSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.toData
);

export const periodTypeSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.periodType || { key: 10, label: "20 giorni", min: 9, max: 20, isDefault: true }
);

export const firstAvailableDateSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.firstAvailableDate
);

export const lastAvailableDateSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.lastAvailableDate
);

export const activeRangeManagerSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.activeRangeManager || FREE_RANGE
);

export const alertMessageSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.alertMessage || null
);

export const dataSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.data || ''
);

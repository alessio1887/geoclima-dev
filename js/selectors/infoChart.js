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

export const firstAvailableDateSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.firstAvailableDate
);

export const lastAvailableDateSelector = createSelector(
    [getInfoChartState],
    (infochart) => infochart?.lastAvailableDate
);

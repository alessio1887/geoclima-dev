/*
 * Copyright 2024, Riccardo Mari - CNR-Ibimet - Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Observable } from 'rxjs';
import { setControlProperty } from '../../MapStore2/web/client/actions/controls';
import { TOGGLE_MAPINFO_STATE, toggleMapInfoState } from '../../MapStore2/web/client/actions/mapInfo';
import {
    TOGGLE_INFOCHART,
    FETCH_INFOCHART_DATA,
    fetchedInfoChartData,
    setInfoChartVisibility,
    fetchInfoChartData
} from '../actions/infochart';
import { CLICK_ON_MAP } from '../../MapStore2/web/client/actions/map';
import API from '../api/GeoClimaApi';
import moment from 'moment';

/**
 * Show the infochart
 * @param  {external:Observable} action$ triggers on "FETCH_INFOCHART_DATA"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.infochart
 * @return {external:Observable} the stream of actions to trigger to fetch InfoChartData.
 */

const getVisVariable = (layers) => {
    return layers.filter(x => x.visibility)
        .map(x => x.group)
        .filter(x => x.indexOf('Variabili Meteo') !== -1)
        .map(x => x.split(".")[1]);
};

const setVisVariable = (variable) => {
    if (variable && variable.slice(-1)[0] === 'Pioggia') {
        return 'prec';
    } else if (variable && variable.slice(-1)[0] === 'Temperatura') {
        return 'temp';
    } else if (variable && variable.slice(-1)[0] === 'Evapotraspirazione') {
        return 'evap';
    } else if (variable && variable.slice(-1)[0] === 'Bilancio Idrico Semplificato') {
        return 'bis';
    }
    return 'prec';
};

const returnToHomeCheck = (action$, store) =>
    action$.ofType('@@router/LOCATION_CHANGE').switchMap(() => {
        const { pathname } = store.getState().routing.location;
        if (pathname === '/') {
            return Observable.of(
                setInfoChartVisibility(false)
            );
        }
        return Observable.empty();
    });

const toggleMapInfoEpic = (action$, store) =>
    action$.ofType(TOGGLE_MAPINFO_STATE).switchMap(() => {
        const chartInfoEnabled = store.getState().controls.chartinfo.enabled;
        const mapInfoEnabled = store.getState().mapInfo.enabled;
        if (mapInfoEnabled === chartInfoEnabled) {
            return Observable.of(
                setControlProperty("chartinfo", "enabled", false),
                setInfoChartVisibility(false)
            );
        }
        return Observable.empty();
    });

const toggleInfoChartEpic = (action$, store) =>
    action$.ofType(TOGGLE_INFOCHART).switchMap((action) => {
        const mapInfoEnabled = store.getState().mapInfo.enabled;
        if (mapInfoEnabled) {
            return Observable.of(
                setControlProperty("chartinfo", "enabled", action.enable),
                toggleMapInfoState(false)
            );
        }
        return Observable.of(
            setControlProperty("chartinfo", "enabled", action.enable),
            setInfoChartVisibility(false)
        );
    });

const clickedPointCheckEpic = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .switchMap((action) => {
            const appState = store.getState();
            const visVariable = setVisVariable([...new Set(getVisVariable(appState.layers.flat))]);

            let fromData = {};
            let toData = {};
            let variable = '';
            let periodType = '';

            if (appState.infochart.showInfoChartPanel) {
                ({ toData, fromData, variable, periodType } = appState.infochart.infoChartData);
            } else {
                ({ toData, fromData,  periodType } = appState.fixedrangepicker);
                variable = visVariable;
            }

            const chartInfoEnabled = appState.controls.chartinfo.enabled;
            if (chartInfoEnabled) {
                return Observable.of(
                    setInfoChartVisibility(true),
                    fetchInfoChartData({
                        latlng: action.point.latlng,
                        toData: moment(toData).format('YYYY-MM-DD'),
                        fromData: moment(fromData).format('YYYY-MM-DD'),
                        variable,
                        periodType
                    })
                );
            }
            return Observable.empty();
        });

const loadInfoChartDataEpic = (action$, store) =>
    action$.ofType(FETCH_INFOCHART_DATA)
        .switchMap(() => Observable.fromPromise(
            API.geoclimachart(store.getState().infochart.infoChartData)
                .then(res => res.data)
        ))
        .switchMap(data => Observable.of(fetchedInfoChartData(data, false)));

export {
    toggleMapInfoEpic,
    toggleInfoChartEpic,
    clickedPointCheckEpic,
    loadInfoChartDataEpic,
    returnToHomeCheck
};

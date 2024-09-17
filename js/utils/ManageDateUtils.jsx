/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import moment from 'moment';

const Api = {
    calculateDateFromKeyReal(key, toData) {
        let date = {};

        // The selected DATE from the users
        date.toData = moment(toData).clone().format('YYYY-MM-DD');

        // const year = moment(toData).clone().format('YYYY-MM-DD');
        if (key === "1") {
            date.fromData = moment(toData).clone().subtract(1, 'month').format('YYYY-MM-DD');
        } else if (key === "3") {
            date.fromData = moment(toData).clone().subtract(3, 'month').format('YYYY-MM-DD');
        } else if (key === "4") {
            date.fromData = moment(toData).clone().subtract(4, 'month').format('YYYY-MM-DD');
        } else if (key === "6") {
            date.fromData = moment(toData).clone().subtract(6, 'month').format('YYYY-MM-DD');
        } else if (key === "12") {
            date.fromData = moment(toData).clone().subtract(12, 'month').format('YYYY-MM-DD');
        } else {
            // se la data selezionata è minore del 1 ottobre dello stesso anno
            const currentYear = moment(date.toData).format('YYYY');
            const currentToData = moment().clone().format(currentYear + "-10-01");
            if (date.toData < currentToData) {
                if (moment(toData).clone().format('YYYY') < currentYear) {
                    date.fromData = moment(toData).clone().endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
                } else {
                    date.fromData = moment(toData).clone().subtract(1, 'year').endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
                }
            } else {
                date.fromData = moment(toData).clone().endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
            }
        }
        return date;
    },
    calculateDateFromKey(key, toData) {
        let date = {};

        // The selected DATE from the users
        date.toData = Api.startMonthDecade(moment(toData).clone().format('YYYY-MM-DD'));

        // const year = moment(toData).clone().format('YYYY-MM-DD');
        if (key === "1") {
            date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(1, 'month').format('YYYY-MM-DD'));
        } else if (key === "3") {
            date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(3, 'month').format('YYYY-MM-DD'));
        } else if (key === "4") {
            date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(4, 'month').format('YYYY-MM-DD'));
        } else if (key === "6") {
            date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(6, 'month').format('YYYY-MM-DD'));
        } else if (key === "12") {
            date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(12, 'month').format('YYYY-MM-DD'));
        } else {
            // se la data selezionata è minore del 1 ottobre dello stesso anno
            const currentYear = moment(date.toData).format('YYYY');
            const currentToData = moment().clone().format(currentYear + "-10-01");
            if (date.toData < currentToData) {
                if (moment(toData).clone().format('YYYY') < currentYear) {
                    date.fromData = Api.startMonthDecade(moment(toData).clone().endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD'));
                } else {
                    date.fromData = Api.startMonthDecade(moment(toData).clone().subtract(1, 'year').endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD'));
                }
            } else {
                date.fromData = Api.startMonthDecade(moment(toData).clone().endOf('year').subtract(2, 'month').startOf('month').format('YYYY-MM-DD'));
            }
        }
        return date;
    },
    startMonthDecade(date) {
        const dateArray = date.split("-");
        if (dateArray[2] <= 10) {
            dateArray[2] = '01';
            return dateArray.join("-");
        } else if (dateArray[2] > 10 && dateArray[2] < 21) {
            dateArray[2] = '11';
            return dateArray.join("-");
        }
        dateArray[2] = '21';
        return dateArray.join("-");
    },
    /**
     * Metodo che restituire il nome del mapfile da passare come parametro alla richiesta HTTP.
     * Infatti, in base alla durata della cumulata i valori delle legende nel mapfile cambiano, ad esempio una cumulata
     * di pioggia di un mese ha valori molto diversi di una cumulata di pioggia di un anno.
     * Ogni mapfile ha una riclassificazione diversa della legenda. In allegato i vari mapfile che vengono usati adesso nell'applicazione online.
     */
    setGCMapFile(fromData, toData) {
        let geoclimaMap = "geoclima";

        const fromDataMoment = moment(fromData);
        // const dayOfDecate = fromDataMoment.date();
        const toDataMoment = moment(toData);

        // const dayOfDecate = Api.startMonthDecade(fromData);

        const durationMonths = toDataMoment.diff(fromDataMoment, 'months');

        if (durationMonths > 1 && durationMonths <= 3) {
            geoclimaMap = "geoclima3";
        } else if (durationMonths > 3 && durationMonths <= 4) {
            geoclimaMap = "geoclima4";
        } else if (durationMonths > 4 && durationMonths <= 6) {
            geoclimaMap = "geoclima6";
        } else if (durationMonths > 6) {
            geoclimaMap = "geoclima12";
        }
        return geoclimaMap;
    }
};

export default Api;

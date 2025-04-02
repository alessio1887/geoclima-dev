/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

export const PERIOD_TYPES = [
    { key: 1, label: "5 giorni", min: 1, max: 5, isDefault: true },
    { key: 7, label: "8 giorni", min: 6, max: 8 },
    { key: 10, label: "20 giorni", min: 9, max: 20 },
    { key: 30, label: "60 giorni", min: 21, max: 60 },
    { key: 120, label: "160 giorni", min: 61, max: 160 },
    { key: 180, label: "250 giorni", min: 161, max: 250 },
    { key: 365, label: "366 giorni", min: 251, max: 366 }
];

const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
export const DEFAULT_DATA_INIZIO = new Date("1991-01-01");
export const DEFAULT_DATA_FINE = yesterday;
export const DATE_FORMAT = "YYYY-MM-DD";

const Api = {
    // calculateDateFromKeyReal(key, toData) {
    //     let date = {};

    //     // The selected DATE from the users
    //     date.toData = moment(toData).clone();
    //     // TODO migliora in modo che ci sottragga la key o qualcos'altro
    //     // const year = moment(toData).clone().format('YYYY-MM-DD');
    //     if (key === "1") {
    //         date.fromData = moment(toData).clone().subtract(1, 'month');
    //     } else if (key === "3") {
    //         date.fromData = moment(toData).clone().subtract(3, 'month');
    //     } else if (key === "4") {
    //         date.fromData = moment(toData).clone().subtract(4, 'month');
    //     } else if (key === "6") {
    //         date.fromData = moment(toData).clone().subtract(6, 'month');
    //     } else if (key === "12") {
    //         date.fromData = moment(toData).clone().subtract(12, 'month');
    //     } else {
    //         // se la data selezionata è minore del 1 ottobre dello stesso anno
    //         const currentYear = moment(date.toData).format('YYYY');
    //         const currentToData = moment().clone().format(currentYear + "-10-01");
    //         if (date.toData.isBefore(currentToData)) {
    //             if (moment(toData).year() < currentYear) {
    //                 date.fromData = moment(toData)
    //                     .endOf('year')
    //                     .subtract(2, 'month')
    //                     .startOf('month')
    //                     .hour(moment(toData).hour())
    //                     .minute(moment(toData).minute())
    //                     .second(moment(toData).second());
    //             } else {
    //                 date.fromData = moment(toData)
    //                     .subtract(1, 'year')
    //                     .endOf('year')
    //                     .subtract(2, 'month')
    //                     .startOf('month')
    //                     .hour(moment(toData).hour())
    //                     .minute(moment(toData).minute())
    //                     .second(moment(toData).second());
    //             }
    //         } else {
    //             date.fromData = moment(toData)
    //                 .endOf('year')
    //                 .subtract(2, 'month')
    //                 .startOf('month')
    //                 .hour(moment(toData).hour())
    //                 .minute(moment(toData).minute())
    //                 .second(moment(toData).second());
    //         }
    //     }
    //     return date;
    // },
    getDefaultPeriod(periodTypes) {
        return periodTypes.find(t => t.isDefault) || periodTypes[0];
    },

    /**
     * Generates a map filename by removing any numeric values from the given map layer parameter
     * and appending a specified suffix.
     *
     * @param {string} mapLayerParam - The name of the map layer, which may contain numeric values.
     * @param {string} mapNameSuffix - The suffix to append to the cleaned map layer name, which derives from the applied periodType on map.
     * @returns {string} The cleaned map filename with the appended suffix.
     *
     * This function removes all numbers from the `mapLayerParam` and concatenates the result
     * with `mapNameSuffix` to generate the final map filename.
     */
    getMapfilenameFromSuffix(mapLayerParam, mapNameSuffix) {
        const cleanedMapName = mapLayerParam.replace(/\d+/g, '');
        return cleanedMapName + mapNameSuffix;
    },
    /**
     * Determines the appropriate map suffix based on the given date range.
     *
     * @param {string|Date} fromData - The starting date of the range.
     * @param {string|Date} toData - The ending date of the range.
     * @param {Array} periodTypes - An array of period type objects, each containing:
     *        - {string} key: The identifier for the period, which could be the mapfile suffix.
     *        - {number} min: The minimum number of days for this period.
     *        - {number} max: The maximum number of days for this period.
     * @returns {string} The key of the matching period type.
     *
     * This function calculates the difference in days between the two dates and
     * finds the first period type whose range (min-max) includes the calculated difference.
     */
    getMapSuffixFromDates(fromData, toData, periodTypes) {
        const fromDataMoment = moment(fromData);
        const toDataMoment = moment(toData);
        const periodLength = toDataMoment.diff(fromDataMoment, 'days');
        const periodType = periodTypes.find(t => periodLength >= Number(t.min) && periodLength <= Number(t.max));
        return periodType.key;
    },
    validateDateRange(fromData, toData, firstAvailableDate, lastAvailableDate, timeUnit) {
        let firstDate = moment(firstAvailableDate);
        let lastDate = moment(lastAvailableDate);
        let fromDataMoment = moment(fromData);
        let toDataMoment = moment(toData);
        if (timeUnit === DATE_FORMAT) {
            fromDataMoment = fromDataMoment.startOf('day');
            toDataMoment = toDataMoment.startOf('day');
            firstDate = firstDate.startOf('day');
            lastDate = lastDate.startOf('day');
        }
        if (fromDataMoment.isBefore(firstDate) || toDataMoment.isBefore(firstDate)) {
            return { isValid: false, errorMessage: "dateTooEarly" };
        }
        if (fromDataMoment.isAfter(lastDate) || toDataMoment.isAfter(lastDate)) {
            return { isValid: false, errorMessage: "rangeExceedsBoundary"};
        }
        if (toDataMoment.isBefore(fromDataMoment)) {
            return { isValid: false, errorMessage: "endDateBefore" };
        }
        const oneYearFromStart = fromDataMoment.clone().add(1, 'year');
        if (toDataMoment.isAfter(oneYearFromStart)) {
            return { isValid: false, errorMessage: "rangeTooLarge" };
        }
        // Se tutte le verifiche passano
        return { isValid: true, errorMessage: null };
    },
    validateOneDate(toData, firstAvailableDate, lastAvailableDate, timeUnit) {
        let firstDate = moment(firstAvailableDate);
        let lastDate = moment(lastAvailableDate);
        let normalizedDate = moment(toData);
        // Se il confronto deve essere solo sulla data, rimuoviamo le parti relative al tempo
        if (timeUnit === DATE_FORMAT) {
            normalizedDate = normalizedDate.startOf('day');
            firstDate = firstDate.startOf('day');
            lastDate = lastDate.startOf('day');
        }
        if (normalizedDate.isBefore(firstDate)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.dateTooEarly" };
        }
        if (normalizedDate.isAfter(lastDate)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeExceedsBoundary" };
        }
        // Se tutte le verifiche passano
        return { isValid: true, errorMessage: null };
    }
};

export default Api;

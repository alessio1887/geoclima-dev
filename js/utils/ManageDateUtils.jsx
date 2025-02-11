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
    removeValidSuffixes(name, validSuffixes) {
        return validSuffixes.reduce((cleanedName, suffix) => {
            const suffixPattern = new RegExp(`${suffix}$`); // Match suffix at the end
            return cleanedName.replace(suffixPattern, '');
        }, name);
    },
    /**
     * getMapFileFromSuffix returns the name of the mapfile to be passed as a parameter in the HTTP request.
     * This is because, depending on the duration of the cumulative data, the legend values (and therefore the mapfile) sometimes change.
     * For example, a one-month rainfall cumulative has very different values compared to a one-year rainfall cumulative.
     * Each mapfile has a different reclassification for the legend. The various mapfiles currently used in the online application are attached.
     */
    getMapNameFromSuffix(mapLayerParam, validSuffixes, mapNameSuffix) {
        const cleanedMapName = this.removeValidSuffixes(mapLayerParam, validSuffixes);
        return cleanedMapName + mapNameSuffix;
    },

    getMapSuffixFromDates(fromData, toData, periodTypes) {
        const fromDataMoment = moment(fromData);
        const toDataMoment = moment(toData);
        const periodLength = toDataMoment.diff(fromDataMoment, 'days');
        const periodType = periodTypes.find(t => periodLength >= Number(t.min) && periodLength <= Number(t.max));
        return periodType.key;
    },

    // setGCMapFile(fromData, toData, mapName, periodTypes) {
    //     /*
    //     const thresholdsFixedrange = [
    //         { key: 7, label: "7 giorni ",  max: 8, default: true },
    //         { key: 7, label: "8 giorni ",  max: 8 },
    //         { key: 7, label: "8 giorni ",max: 69 },
    //         { key: 10, label: "20 giorni ", max: 20 },
    //     ];

    //     const thresholdsFreeRange = [
    //         { key: 1,  min: 1, max: 5, default: true  },
    //         { key: 7,  min: 6, max: 8},
    //         { key: 10,  min: 9, max: 20 },
    //     ];

    //     const thresholdsInfochart = [
    //         { key: 1,  min: 1, max: 5, default: true  },
    //         { key: 7,  min: 6, max: 8},
    //         { key: 10,  min: 9, max: 20 },
    //     ];

    //     */

    //     // Extract valid suffixes from thresholds
    //     const validSuffixes = periodTypes.map(t => t.key);

    //     // Remove any existing threshold suffix from the mapName
    //     const cleanedMapName = validSuffixes.reduce((name, suffix) => {
    //         const suffixPattern = new RegExp(suffix + '$'); // Match suffix at the end
    //         return name.replace(suffixPattern, '');
    //     }, mapName);

    //     const fromDataMoment = moment(fromData);
    //     const toDataMoment = moment(toData);
    //     const durationMonths = Math.floor(toDataMoment.diff(fromDataMoment, 'days') / 30);
    //     // Determine the appropriate suffix based on duration
    //     const threshold = periodTypes.find(t => durationMonths > t.min && durationMonths <= t.max);
    //     // Construct the mapfile name by appending the correct suffix
    //     const mapfileName = threshold ? cleanedMapName + threshold.suffix : cleanedMapName;
    //     return mapfileName;
    // },
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
            return { isValid: false, errorMessage: "gcapp.errorMessages.dateTooEarly" };
        }
        if (fromDataMoment.isAfter(lastDate) || toDataMoment.isAfter(lastDate)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeExceedsBoundary"};
        }
        if (toDataMoment.isBefore(fromDataMoment)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.endDateBefore" };
        }
        const oneYearFromStart = fromDataMoment.clone().add(1, 'year');
        if (toDataMoment.isAfter(oneYearFromStart)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeTooLarge" };
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

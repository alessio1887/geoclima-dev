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
    { key: "1", label: "1 Mese" },
    { key: "3", label: "3 Mesi" },
    { key: "4", label: "4 Mesi" },
    { key: "6", label: "6 Mesi" },
    { key: "12", label: "12 Mesi" },
    { key: "10", label: "dal 1° Ottobre" }
];

const yesterday = moment().subtract(1, 'day').toDate();
export const FROM_DATA = new Date(moment(yesterday).clone().subtract(1, 'month'));
export const TO_DATA = new Date(yesterday);

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
    /**
     * Method that returns the name of the mapfile to be passed as a parameter in the HTTP request.
     * This is because, depending on the duration of the cumulative data, the legend values in the mapfile change.
     * For instance, a one-month rainfall cumulative has very different values compared to a one-year rainfall cumulative.
     * Each mapfile has a different reclassification for the legend. Attached are the various mapfiles currently used in the online application.
     */
    setGCMapFile(fromData, toData, mapName) {
        // Thresholds for mapping cumulative durations to mapfile suffixes
        const thresholds = [
            { min: 1, max: 3, suffix: "3" },    // Up to 3 months
            { min: 3, max: 4, suffix: "4" },    // 4 months
            { min: 4, max: 6, suffix: "6" },    // 5-6 months
            { min: 6, max: Infinity, suffix: "12" } // More than 6 months
        ];

        // Extract valid suffixes from thresholds
        const validSuffixes = thresholds.map(t => t.suffix);

        // Remove any existing threshold suffix from the mapName
        const cleanedMapName = validSuffixes.reduce((name, suffix) => {
            const suffixPattern = new RegExp(suffix + '$'); // Match suffix at the end
            return name.replace(suffixPattern, '');
        }, mapName);

        const fromDataMoment = moment(fromData);
        const toDataMoment = moment(toData);
        const durationMonths = Math.floor(toDataMoment.diff(fromDataMoment, 'days') / 30);
        // Determine the appropriate suffix based on duration
        const threshold = thresholds.find(t => durationMonths > t.min && durationMonths <= t.max);
        // Construct the mapfile name by appending the correct suffix
        const mapfileName = threshold ? cleanedMapName + threshold.suffix : cleanedMapName;
        return mapfileName;
    },
    validateDateRange(fromData, toData) {
        const startDate = moment(fromData);
        const endDate = moment(toData);

        if (startDate.isBefore(moment('1991-01-01')) || endDate.isBefore(moment('1991-01-01'))) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.dateTooEarly" };
        }
        if (endDate.isBefore(startDate)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.endDateBefore" };
        }
        const oneYearFromStart = startDate.clone().add(1, 'year');
        if (endDate.isAfter(oneYearFromStart)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeTooLarge" };
        }
        if (startDate.isAfter(TO_DATA) || endDate.isAfter(TO_DATA)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeExceedsBoundary"};
        }
        // Se tutte le verifiche passano
        return { isValid: true, errorMessage: null };
    },
    validateDay(toData) {
        const day = moment(toData);

        if (day.isBefore(moment('1991-01-01'))) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.dateTooEarly" };
        }
        if (day.isAfter(TO_DATA)) {
            return { isValid: false, errorMessage: "gcapp.errorMessages.rangeExceedsBoundary"};
        }
        // Se tutte le verifiche passano
        return { isValid: true, errorMessage: null };
    }
};

export default Api;

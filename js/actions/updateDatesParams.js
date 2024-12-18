import GeoClimaAPI from '../api/GeoClimaApi';

export const UPDATEPARAMS_ERROR_FETCH = 'UPDATEPARAMS_ERROR_FETCH';
export const FETCH_AVAILABLE_DATES = 'FETCH_AVAILABLE_DATES';
export const FETCHED_AVAILABLE_DATES = 'FETCHED_AVAILABLE_DATES';

export function apiError(errorMessage) {
    return {
        type: UPDATEPARAMS_ERROR_FETCH,
        errorMessage
    };
}

export function updateParams(dataInizio, dataFine, source) {
    return {
        type: FETCHED_AVAILABLE_DATES,
        dataInizio,
        dataFine,
        source
    };
}

export function fetchSelectDate(variabileLastAvailableData, urlGetLastAvailableData, source) {
    return (dispatch) => {
        GeoClimaAPI.getAvailableDates(variabileLastAvailableData, urlGetLastAvailableData)
            .then(response => {
                const dataFine = new Date(response.data[0].data_fine);
                const dataInizio = new Date(response.data[0].data_inizio);
                dispatch(updateParams(dataInizio, dataFine, source));
            })
            .catch(error => {
                dispatch(apiError(error));
            });
    };
}

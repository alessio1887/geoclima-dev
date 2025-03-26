/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DATE_FORMAT } from './ManageDateUtils';

// type of range picher
export const FIXED_RANGE = "fixed_range_picker";
export const FREE_RANGE = "free_range_picker";
// type of chart based on tabLyst.type of pluginsConfig
export const SINGLE_VARIABLE_CHART = "single_variable";
export const MULTI_VARIABLE_CHART = "multi_variable";
export const CUMULATA_CHART = "cumulata";
export const MARKER_ID = "InfoChartMarker";
// type of chart based on tabLyst.type of pluginsConfig
export const DROP_DOWN = "single_select";
export const MULTI_SELECT = "multi_select";

export const DEFAULT_FILENAME = 'exported_image.png';

const ST_VALUE = "st_value_";
const colors = ['green', 'black', 'teal', 'gray'];
const MIN_Y_INDEX = -3.0;
const MAX_Y_INDEX = 3.0;

export function isVariabiliMeteoLayer(layerName, variabiliMeteo) {
    let check = false;
    // Check undefined\null
    if (!variabiliMeteo) {
        return check;
    }
    // Iterate through the VARIABILI_METEO object
    for (const nomeVariabile in variabiliMeteo) {
        // VARIABILI_METEO[nomeVariabile] should be an array of meteorological variables
        if (variabiliMeteo[nomeVariabile].includes(layerName)) {
            check = true;
            break;
        }
    }
    return check;
}

export const getVisibleLayers = (layers, idVariabiliLayers) => {
    return layers
        .filter(layer => layer.visibility && isVariabiliMeteoLayer(layer.name, idVariabiliLayers));
};
//  Function to calculate the intersection between two line segments
function getIntersection(x1, y1, x2, y2, climY1, climY2) {
    // Calculate slopes
    const obsSlope = (y2 - y1) / (x2 - x1);
    const climSlope = (climY2 - climY1) / (x2 - x1);

    // Check for parallel lines
    if (obsSlope === climSlope) {
        return null; // No intersection
    }

    // Calculate intersection point
    const intersectionX = (climY1 - y1 + obsSlope * x1 - climSlope * x1) / (obsSlope - climSlope);

    // Calculate corresponding y value using either line's equation
    const yIntersect = y1 + obsSlope * (intersectionX - x1);

    return [intersectionX, yIntersect];
}
/**
 * Colors the areas between the observed data and climatology using two different colors:
 * one color if the observed values are below climatology, and another color if they are above.
 * It also handles intersections between the two curves.
 */
export function fillAreas(dateObjects, observed, climatological, variable, unitPrecipitazione, yaxis = 'y') {
    let fillTraces = [];
    let  upperColor;
    let  belowColor;
    if (unitPrecipitazione === variable.unit ) {
        upperColor = 'rgba(0, 0, 255, 0.5)';
        belowColor = 'rgba(255, 0, 0, 0.5)';
    } else {
        upperColor = 'rgba(255, 0, 0, 0.5)';
        belowColor = 'rgba(0, 0, 255, 0.5)';
    }
    let i;
    for (i = 0; i < dateObjects.length - 1; i++) {
        const x0 = dateObjects[i].getTime();
        const x1 = dateObjects[i + 1].getTime();
        const y0Obs = observed[i];
        const y1Obs = observed[i + 1];
        const y0Clim = climatological[i];
        const y1Clim = climatological[i + 1];

        if (y0Obs === y0Clim && y1Obs !== y1Clim) {
            // Case where the observed temperature equals the climatological temperature
            fillTraces.push({
                x: [x0, x1, x1, x0],
                y: [y0Obs, y1Obs, y1Clim, y0Clim],
                fill: 'toself',
                fillcolor: y1Obs > y1Clim ? upperColor : belowColor,
                line: { color: 'transparent' },
                showlegend: false,
                hoverinfo: 'skip',
                yaxis: yaxis
            });
        } else if ((y0Obs < y0Clim && y1Obs > y1Clim) || (y0Obs > y0Clim && y1Obs < y1Clim)) {
            // Case of intersection when temperatures reverse
            const [xIntersect, yIntersect] = getIntersection(x0, y0Obs, x1, y1Obs, y0Clim, y1Clim);
            if (xIntersect !== null) {
                fillTraces.push({
                    x: [x0, xIntersect, xIntersect, x0],
                    y: [y0Obs, yIntersect, yIntersect, y0Clim],
                    fill: 'toself',
                    fillcolor: y0Obs > y0Clim ? upperColor : belowColor,
                    line: { color: 'transparent' },
                    showlegend: false,
                    hoverinfo: 'skip',
                    yaxis: yaxis
                });

                fillTraces.push({
                    x: [xIntersect, x1, x1, xIntersect],
                    y: [yIntersect, y1Obs, y1Clim, yIntersect],
                    fill: 'toself',
                    fillcolor: y1Obs > y1Clim ? upperColor : belowColor,
                    line: { color: 'transparent' },
                    showlegend: false,
                    hoverinfo: 'skip',
                    yaxis: yaxis
                });
            }
        } else {
            // Normal case without intersection
            fillTraces.push({
                x: [x0, x1, x1, x0],
                y: [Math.max(y0Obs, y0Clim), Math.max(y1Obs, y1Clim), Math.min(y1Obs, y1Clim), Math.min(y0Obs, y0Clim)],
                fill: 'toself',
                fillcolor: y0Obs > y0Clim ? upperColor : belowColor,
                line: { color: 'transparent' },
                showlegend: false,
                hoverinfo: 'skip',
                yaxis: yaxis
            });
        }
    }
    return fillTraces;
}


export function formatDataCum(values, propVariable) {
    let data = [];
    let cum = 0;
    let cumClima = 0;
    values.forEach(function(o) {
        data.push(
            {
                "data": o.data.substring(0, 10),
                [propVariable]: parseFloat(cum.toFixed(1)),
                "st_value_clima": parseFloat(cumClima.toFixed(1))
            }
        );
        cum += o[propVariable];
        cumClima += o.st_value_clima;
    }, this);
    return data;
}

export function formatDataTemp(values, propVariable) {
    return values.map(o => ({
        data: o.data.substring(0, 10),
        [propVariable]: (o[propVariable] !== null && o[propVariable] !== undefined)
            ? parseFloat(o[propVariable].toFixed(1))
            : 0,
        st_value_clima: (o.st_value_clima !== null && o.st_value_clima !== undefined)
            ? parseFloat(o.st_value_clima.toFixed(1))
            : 0
    }));
}

// Function to calculate the dynamic dtick for the y-axis
export function  getDtick(maxValue) {
    if (maxValue <= 10) {
        return 1;
    } else if (maxValue <= 100) {
        return 10;
    } else if (maxValue <= 1000) {
        return 100;
    }
    return Math.pow(10, Math.floor(Math.log10(maxValue)));
}


// for MultiTraces graph
export const createBackgroundBands = (dates) => {
    const bands = [
        { min: MIN_Y_INDEX, max: -2.0, color: 'rgba(99,0,4, 0.5)' },
        { min: -2.0, max: -1.5, color: 'rgba(198,0,16, 0.5)' },
        { min: -1.5, max: -1.0, color: 'rgba(253,127,31, 0.5)' },
        { min: -1.0, max: -0.5, color: 'rgba(253,254,123, 0.5)' },
        { min: -0.5, max: 0.5, color: 'rgba(225,225,225, 0.5)' },
        { min: 0.5, max: 1.0, color: 'rgba(210,255,192, 0.5)' },
        { min: 1.0, max: 1.5, color: 'rgba(153,229,39, 0.5)' },
        { min: 1.5, max: 2.0, color: 'rgba(52,150,20, 0.5)' },
        { min: 2.0, max: MAX_Y_INDEX, color: 'rgba(39,80,6, 0.5)' }
    ];

    return bands.map(({ min, max, color }) => ({
        x: dates.concat(dates.slice().reverse()),
        y: Array(dates.length).fill(min).concat(Array(dates.length).fill(max)),
        fill: 'toself',
        fillcolor: color,
        line: { width: 0 },
        hoverinfo: 'skip',
        showlegend: false,
        mode: 'lines'
    }));
};

// Funzione per creare le tracce delle variabili
export const createMultiTraces = (variables, dates, dataFetched) => {
    return variables.map((variable, index) => {
        const valueKey = ST_VALUE + variable.id;
        const values = dataFetched.map(item =>
            item[valueKey] !== null ? parseFloat(item[valueKey].toFixed(2)) : null
        );
        return {
            x: dates,
            y: values,
            mode: 'lines',
            name: variable.name,
            line: { color: colors[index % colors.length], width: 2, shape: 'linear' },
            marker: { size: 6 },
            type: 'scatter',
            connectgaps: true
        };
    });
};

export const createObservedAndClimatologicalTraces = (variable, dates, dataFetched, unitPrecipitazione) => {
    const chartVariable = variable.id;
    const unit = variable.unit;
    const propVariable = "st_value_" + chartVariable;

    const chartData =  unit === unitPrecipitazione
        ? formatDataCum(dataFetched, propVariable)
        : formatDataTemp(dataFetched, propVariable);

    const climaLabel = "Climatologia " + ( unit || "");
    const currentYearLabel = "Anno in corso " + ( unit || "");

    const observedData = chartData.map(item => item[propVariable]);
    const climatologicalData = chartData.map(item => item.st_value_clima);
    const fillTraces = fillAreas(dates, observedData, climatologicalData, variable, unitPrecipitazione);

    // const colorTraceObserved = unit === unitPrecipitazione ? 'rgba(0, 0, 255, 1)' : 'rgba(255, 0, 0, 1)';
    const trace1 = {
        x: dates,
        y: climatologicalData,
        mode: 'lines',
        name: climaLabel,
        line: { color: 'rgba(0, 0, 255, 1)', width: 1 }
    };

    const trace2 = {
        x: dates,
        y: observedData,
        mode: 'lines',
        name: currentYearLabel,
        line: { color: 'rgba(255, 0, 0, 1)', width: 1 }
    };

    return [trace1, trace2].concat(fillTraces);
};


export const createCumulataBarTraces = (variables, times, dataFetched) => {
    const chartVariable = variables.id;
    const propVariable = ST_VALUE + chartVariable;

    // Estrae le precipitazioni e le converte in numeri
    const precipitations = dataFetched.map(item => parseFloat(parseFloat(item[propVariable]).toFixed(1)));
    const cumulativePrecip = formatDataCum(dataFetched, propVariable).map(item => item[propVariable]);

    // Traccia a barre per la precipitazione istantanea
    const barTrace = {
        x: times,
        y: precipitations,
        type: 'bar',
        name: variables.yaxis,
        marker: { color: '#FFAF1F', opacity: 0.6 }
        // hovertemplate: '%{y:.1f} mm<br>%{x:%d/%m/%Y}'
    };

    // Traccia a linea per la precipitazione cumulata (asse y secondario)
    const lineTrace = {
        x: times,
        y: cumulativePrecip,
        type: 'scatter',
        mode: 'lines',
        name: variables.yaxis2,
        line: { color: 'rgba(0, 0, 255, 1)', width: 1 },
        // hovertemplate: '%{y:.1f} mm<br>%{x:%d/%m/%Y}',
        yaxis: 'y2'
    };

    return [barTrace, lineTrace];
};


export const createCumulataBarLayout = (variables, chartTitle, traces, dates, format, chartRelayout, infoChartSize, isCollapsedFormGroup) => {
    const barTrace = traces[0].y;
    const maxPrecip = Math.max(...barTrace);
    const y1max = Math.max(maxPrecip, 6);
    const maxCum = Math.max(...traces[1].y);
    const y2max = Math.max(maxCum, 6);
    const dtick1 = getDtick(y1max);
    const scaleFactor = y2max / y1max;
    const dtick2 = dtick1 * scaleFactor;

    // Determina il range delle date
    const startDate = chartRelayout?.startDate
        ? new Date(chartRelayout.startDate)
        : new Date(Math.min(...dates));
    const endDate = chartRelayout?.endDate
        ? new Date(chartRelayout.endDate)
        : new Date(Math.max(...dates));

    // Determina il range per l asse y
    // const yaxisRange = [chartRelayout?.variabileStart || Math.min(...traces[0].y), chartRelayout?.variabileEnd || Math.max(...traces[0].y)];

    return {
        width: infoChartSize.widthResizable - 10,
        height: infoChartSize.heightResizable - (isCollapsedFormGroup ? 140 : 400),
        title: {
            text: chartTitle,
            x: 0.05,
            xanchor: 'left'
        },
        barmode: 'overlay',
        xaxis: {
            tickformat: format !== DATE_FORMAT ? '%Y-%m-%d %H:%M:%S' : '%Y-%m-%d',
            tickangle: -20,
            range: [startDate, endDate],
            ticks: 'inside',
            ticklen: 5,
            tickwidth: 1,
            tickcolor: '#000'
        },
        yaxis: {
            title: variables.yaxis,
            range: [0, y1max],
            tick0: 0,
            dtick: dtick1,
            tickfont: { color: '#FFAF1F' },
            titlefont: { color: '#FFAF1F' },
            rangemode: 'tozero'
        },
        yaxis2: {
            title: variables.yaxis2,
            overlaying: 'y',
            side: 'right',
            range: [0, y2max],
            tick0: 0,
            dtick: dtick2,
            tickfont: { color: '#0000FF' },
            titlefont: { color: '#0000FF' },
            automargin: true,
            position: 1,
            rangemode: 'tozero'
        },
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0.5, y: 1.05 },
        dragmode: chartRelayout?.dragmode,
        margin: { t: 80, r: 40, l: 60, b: (format === DATE_FORMAT ? 40 : 60 )}
    };
};


export const createLayout = (chartTitle, yaxisTitle, dates, format, dataTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, chartType) => {
    const isMultiVariable = chartType === MULTI_VARIABLE_CHART;
    const yaxisRange = isMultiVariable
        ? [chartRelayout?.yaxisStart || MIN_Y_INDEX, chartRelayout?.yaxisEnd || MAX_Y_INDEX]
        : [chartRelayout?.yaxisStart || Math.min([dataTraces[0], dataTraces[1]]), chartRelayout?.yaxisEnd || Math.max([dataTraces[0], dataTraces[1]])];

    return {
        width: infoChartSize.widthResizable - 10,
        height: infoChartSize.heightResizable - (isCollapsedFormGroup ? 140 : 400),
        title: {
            text: chartTitle,
            x: 0.05, // Posiziona il titolo a sinistra
            xanchor: 'left' // Ancora il titolo a sinistra
        },
        xaxis: {
            tickformat: format !== DATE_FORMAT ? '%Y-%m-%d %H:%M:%S' : '%Y-%m-%d',
            tickangle: -20,
            range: [chartRelayout?.startDate || Math.min(...dates), chartRelayout?.endDate || Math.max(...dates)],
            ticks: 'inside',
            ticklen: 5,
            tickwidth: 1,
            tickcolor: '#000'
        },
        yaxis: {
            range: yaxisRange,
            ...(isMultiVariable && { // Aggiunge tickvals solo per multi-variable
                tickvals: [MIN_Y_INDEX, -2, -1.5, -0.5, 0.5, 1.0, 1.5, 2.0, MAX_Y_INDEX]
            }),
            ...(!isMultiVariable && { // Aggiunge il title solo se non e multi-variable
                title: yaxisTitle
            }),
            tickformat: '.1f',
            ticks: 'inside',
            ticklen: 5,
            tickwidth: 1,
            tickcolor: '#000'
        },
        margin: { t: 80, r: 40, l: 60, b: (format === DATE_FORMAT ? 40 : 60 )},
        showlegend: true,
        hovermode: 'x unified',
        legend: { orientation: 'h', x: 0.5, y: 1.05 },
        dragmode: chartRelayout?.dragmode
    };
};


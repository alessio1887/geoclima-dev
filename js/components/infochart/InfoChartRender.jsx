/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Plot from '@mapstore/components/charts/PlotlyChart.jsx';
import { DATE_FORMAT } from '../../utils/ManageDateUtils';
import { SINGLE_VARIABLE_CHART, MULTI_VARIABLE_CHART, CUMULATA_CHART, fillAreas, formatDataCum, formatDataTemp, getDtick }  from '../../utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const ST_VALUE = "st_value_";
const colors = ['green', 'black', 'teal', 'gray'];
const MIN_Y_INDEX = -3.0;
const MAX_Y_INDEX = 3.0;

// for MultiTraces graph
const createBackgroundBands = (dates) => {
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
const createMultiTraces = (variables, dates, dataFetched) => {
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

const createObservedAndClimatologicalTraces = (variable, dates, dataFetched, unitPrecipitazione) => {
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


const createCumulataBarTraces = (variables, times, dataFetched) => {
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


const createCumulataBarLayout = (variables, chartTitle, traces, dates, format, chartRelayout, infoChartSize, isCollapsedFormGroup) => {
    const barTrace = traces[0].y;
    const maxPrecip = Math.max(...barTrace);
    const y1max = Math.max(maxPrecip, 6);
    const maxCum = Math.max(traces[1].y);
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


const createLayout = (chartTitle, yaxisTitle, dates, format, dataTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, chartType) => {
    const isMultiVariable = chartType === MULTI_VARIABLE_CHART;
    const yaxisRange = isMultiVariable
        ? [chartRelayout?.variabileStart || MIN_Y_INDEX, chartRelayout?.variabileEnd || MAX_Y_INDEX]
        : [chartRelayout?.variabileStart || Math.min([dataTraces[0], dataTraces[1]]), chartRelayout?.variabileEnd || Math.max([dataTraces[0], dataTraces[1]])];

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

const InfoChartRender = ({ dataFetched, variableChartParams, handleRelayout,
    chartRelayout, infoChartSize, isCollapsedFormGroup, unitPrecipitazione, format }) => {

    let traces;
    let layout;
    const chartTitle = variableChartParams.name || "";
    const dates = dataFetched.map(item => moment(item.data).toDate());

    switch (variableChartParams.chartType) {
    case MULTI_VARIABLE_CHART:
        const multiTraces = createMultiTraces(variableChartParams.tabVariableParams, dates, dataFetched);
        traces = createBackgroundBands(dates).concat(multiTraces);
        layout = createLayout(chartTitle, "", dates, format, multiTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, MULTI_VARIABLE_CHART);
        break;

    case CUMULATA_CHART:
        const precipTraces = createCumulataBarTraces(variableChartParams, dates, dataFetched);
        traces = precipTraces;
        layout = createCumulataBarLayout(variableChartParams, chartTitle, traces, dates, format, chartRelayout, infoChartSize, isCollapsedFormGroup);
        break;

    default: // SINGLE_VARIABLE_CHART o altri casi non definiti
        const observedTraces = createObservedAndClimatologicalTraces(variableChartParams, dates, dataFetched, unitPrecipitazione);
        traces = observedTraces;
        layout = createLayout(chartTitle, variableChartParams.yaxis, dates, format, observedTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, SINGLE_VARIABLE_CHART);
        break;
    }
    return (
        <Plot
            data={traces}
            layout={layout}
            style={{ width: '100%', height: '100%' }}
            onRelayout={handleRelayout}
            config={{
                // Chart toolbar config
                displayModeBar: true,
                modeBarButtonsToRemove: ['resetScale2d'],
                autosizable: true
            }}
        />
    );
};

export default InfoChartRender;

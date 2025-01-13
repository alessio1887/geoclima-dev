/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Plot from '@mapstore/components/charts/PlotlyChart.jsx';
import { fillAreas, formatDataCum, formatDataTemp, MULTI_VARIABLE_CHART }  from '../../utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const ST_VALUE = "st_value_";
const colors = ['green', 'black', 'teal', 'gray'];
const MIN_Y_INDEX = -3.0;
const MAX_Y_INDEX = 3.0;
const chartMargin = { t: 40, r: 60, l: 60, b: 60};

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
    const chartVariable = variable[0].id;
    const unit = variable[0].unit;
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

const createObservedAndClimaLayout = (variable, dates, climaAndObservedData, chartRelayout, infoChartSize, isCollapsedFormGroup) => ({
    width: infoChartSize.widthResizable - 10,
    height: infoChartSize.heightResizable - (isCollapsedFormGroup ? 140 : 420),
    title: variable.name,
    xaxis: {
        tickformat: '%Y-%m-%d',
        tickangle: -25,
        range: [chartRelayout?.startDate || Math.min(...dates), chartRelayout?.endDate || Math.max(...dates)],
        ticks: 'inside',
        ticklen: 5,
        tickwidth: 1,
        tickcolor: '#000'
    },
    yaxis: {
        title: variable.yaxis,
        range: [chartRelayout?.variabileStart || Math.min(...climaAndObservedData),
            chartRelayout?.variabileEnd || Math.max(...climaAndObservedData)],
        tickformat: '.1f',
        ticks: 'inside',
        ticklen: 5,
        tickwidth: 1,
        tickcolor: '#000'
    },
    margin: chartMargin,
    showlegend: true,
    hovermode: 'x unified',
    legend: {
        orientation: 'h',
        x: 0.5,
        y: -0.3
    },
    dragmode: chartRelayout?.dragmode
});

const createMultiLayout = (chartTitle, dates, chartRelayout, infoChartSize, isCollapsedFormGroup) => ({
    width: infoChartSize.widthResizable - 10,
    height: infoChartSize.heightResizable - ( isCollapsedFormGroup ? 140 : 420 ), // Set the height based on the collapse state of the FormGroup
    title: chartTitle,
    xaxis: {
        tickangle: -25,
        tickformat: '%Y-%m-%d',
        // range: [-0.05, dates.length - 0.95], // Aggiunge un piccolo spazio
        range: [chartRelayout?.startDate || Math.min(...dates), chartRelayout?.endDate || Math.max(...dates)],
        ticks: 'inside',
        ticklen: 5, // Lunghezza delle stanghette in pixel
        tickwidth: 1, // Spessore delle stanghette
        tickcolor: '#000' // Colore delle stanghette
    },
    yaxis: {
        range: [ chartRelayout?.variabileStart || MIN_Y_INDEX, chartRelayout?.variabileEnd || MAX_Y_INDEX],
        tickvals: [MIN_Y_INDEX, -2, -1.5, -0.5, 0.5, 1.0, 1.5, 2.0, MAX_Y_INDEX],
        tickformat: '.1f',
        ticks: 'inside', // Mostra le stanghette all'esterno
        ticklen: 5, // Lunghezza delle stanghette in pixel
        tickwidth: 1, // Spessore delle stanghette
        tickcolor: '#000' // Colore delle stanghette
    },
    margin: chartMargin,
    showlegend: true,
    hovermode: 'x unified',
    legend: { orientation: 'h', x: 0.5,
        y: -0.2 },
    autosize: true,
    dragmode: chartRelayout?.dragmode
});

const InfoChartRender = ({ dataFetched, variables, variableParams, handleRelayout,
    chartRelayout, infoChartSize, isCollapsedFormGroup, unitPrecipitazione }) => {

    // Formattare i dati
    const dates = dataFetched.map(item => moment(item.data).clone().startOf('day').toDate());
    const dataTraces = variableParams.type === MULTI_VARIABLE_CHART ? createMultiTraces(variables, dates, dataFetched)
        : createObservedAndClimatologicalTraces(variables, dates, dataFetched, unitPrecipitazione);

    const traces = variableParams.type === MULTI_VARIABLE_CHART ? createBackgroundBands(dates).concat(dataTraces) : dataTraces;

    // Configurazione del layout
    const layout = variableParams.type === MULTI_VARIABLE_CHART ? createMultiLayout(variableParams.chartTitle, dates, chartRelayout, infoChartSize, isCollapsedFormGroup)
        : createObservedAndClimaLayout(variables[0], dates, [dataTraces[0], dataTraces[1]], chartRelayout, infoChartSize, isCollapsedFormGroup, unitPrecipitazione);

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

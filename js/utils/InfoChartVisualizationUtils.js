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

const ST_VALUE = "st_value_";

export function renderMultiVariableChart(dataFetched, variables, multiselectList) {
    const colors = ['green', 'black', 'teal', 'gray'];
    // Formattare i dati
    const dates = dataFetched.map(item => moment(item.data).clone().startOf('day').toDate());
    let traces = [];
    // Iterare sulle variabili e creare il formato dati
    variables.forEach((variable, index) => {
        const valueKey = ST_VALUE + variable;
        // Creare un array di valori per la variabile corrente
        const values = dataFetched.map(item =>
            item[valueKey] !== null ? parseFloat(item[valueKey].toFixed(2)) : null
        );
        const lineColor = colors[index % colors.length];
        // Trova il gruppo in multiselectList che corrisponde all'id della variabile
        let variableName = '';
        for (let tab of multiselectList) {
            const group = tab.groupList.find(item  => item.id === variable);
            if (group) {
                variableName = group.name;
                break;  // Uscire dal ciclo una volta trovato il gruppo
            }
        }
        // Aggiungere la traccia formattata a dataFormatted
        traces.push({
            x: dates,
            y: values,
            mode: 'lines+markers',
            name: variableName,
            line: { color: lineColor, width: 2, shape: 'linear' },
            marker: { size: 6 },
            type: 'scatter'
        });
    });
    // TODO CONTINUA DA QUA !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const backgroundBands = [
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(-3.0).concat(Array(dates.length).fill(-2.0)),
            fill: 'toself',
            fillcolor: 'rgba(99,0,4, 0.5)', // Estremamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(-2.0).concat(Array(dates.length).fill(-1.5)),
            fill: 'toself',
            fillcolor: 'rgba(198,0,16, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(-1.5).concat(Array(dates.length).fill(-1.0)),
            fill: 'toself',
            fillcolor: 'rgba(253,127,31, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(-1.0).concat(Array(dates.length).fill(-0.5)),
            fill: 'toself',
            fillcolor: 'rgba(253,254,123, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(-0.5).concat(Array(dates.length).fill(0.5)),
            fill: 'toself',
            fillcolor: 'rgba(225,225,225, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(0.5).concat(Array(dates.length).fill(1.0)),
            fill: 'toself',
            fillcolor: 'rgba(210,255,192, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(1.0).concat(Array(dates.length).fill(1.5)),
            fill: 'toself',
            fillcolor: 'rgba(153,229,39, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(1.5).concat(Array(dates.length).fill(2.0)),
            fill: 'toself',
            fillcolor: 'rgba(52,150,20, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        },
        {
            x: dates.concat(dates.slice().reverse()),
            y: Array(dates.length).fill(2.0).concat(Array(dates.length).fill(3.0)),
            fill: 'toself',
            fillcolor: 'rgba(39,80,6, 0.5)', // Severamente secco
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false
        }
    ];

    // Configurazione del layout
    const layout = {
        title: 'Indice SPI - Standardized Precipitation Index',
        xaxis: {
            title: 'Periodo',
            tickangle: -45,
            range: [-0.05, dates.length - 0.95], // Aggiunge un piccolo spazio
            ticks: 'inside', // Mostra le stanghette all'esterno
            ticklen: 5, // Lunghezza delle stanghette in pixel
            tickwidth: 1, // Spessore delle stanghette
            tickcolor: '#000' // Colore delle stanghette
        },
        yaxis: {
            title: 'Valore SPI',
            range: [-3.0, 3.0], // Aggiunge un piccolo margine
            tickvals: [-3, -2, -1.5, -0.5, 0.5, 1.0, 1.5, 2.0, 3.0],
            tickformat: '.1f',
            ticks: 'inside', // Mostra le stanghette all'esterno
            ticklen: 5, // Lunghezza delle stanghette in pixel
            tickwidth: 1, // Spessore delle stanghette
            tickcolor: '#000' // Colore delle stanghette
        },
        legend: { x: 1, y: 0.5 },
        autosize: true
    };
    return { dataChart: backgroundBands.concat(traces), layout };
}

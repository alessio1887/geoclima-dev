import React, { useState, useEffect } from 'react';
import Plot from '@mapstore/components/charts/PlotlyChart.jsx';
import {
    SINGLE_VARIABLE_CHART,
    MULTI_VARIABLE_CHART,
    CUMULATA_CHART,
    createMultiTraces,
    createBackgroundBands,
    createCumulataBarTraces,
    createObservedAndClimatologicalTraces,
    createLayout,
    createCumulataBarLayout
} from '../../utils/VariabiliMeteoUtils';
import moment from 'moment';
import momentLocaliser from 'react-widgets/lib/localizers/moment';
momentLocaliser(moment);

const InfoChartRender = ({
    dataFetched,
    variableChartParams,
    handleRelayout,
    chartRelayout,
    infoChartSize,
    isCollapsedFormGroup,
    unitPrecipitazione,
    format
}) => {
    const [traces, setTraces] = useState([]);
    const [layout, setLayout] = useState({});

    useEffect(() => {
        const dates = dataFetched.map(item => moment(item.data).toDate());
        let newTraces = [];
        const chartTitle = variableChartParams.name || "";
        let newLayout = {};

        // Calculate the traces and layout based on the chart type
        switch (variableChartParams.chartType) {
        case MULTI_VARIABLE_CHART:
            newTraces = createMultiTraces(variableChartParams.tabVariableParams, dates, dataFetched);
            newTraces = createBackgroundBands(dates).concat(newTraces);
            newLayout = createLayout(chartTitle, "", dates, format, newTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, MULTI_VARIABLE_CHART);
            break;
        case CUMULATA_CHART:
            newTraces = createCumulataBarTraces(variableChartParams, dates, dataFetched);
            newLayout = createCumulataBarLayout(variableChartParams, chartTitle, newTraces, dates, format, chartRelayout, infoChartSize, isCollapsedFormGroup);
            break;
        default: // SINGLE_VARIABLE_CHART or other cases
            newTraces = createObservedAndClimatologicalTraces(variableChartParams, dates, dataFetched, unitPrecipitazione);
            newLayout = createLayout(chartTitle, variableChartParams.yaxis, dates, format, newTraces, chartRelayout, infoChartSize, isCollapsedFormGroup, SINGLE_VARIABLE_CHART);
            break;
        }
        // Merge the new traces with the previously set ones to preserve the visibility state
        setTraces(prevTraces => {
            if (!prevTraces || !prevTraces.length) {
                return newTraces;
            }
            return newTraces.map(newTrace => {
                const oldTrace = prevTraces.find(trace => trace.name === newTrace.name);
                return oldTrace ? { ...newTrace, visible: oldTrace.visible } : newTrace;
            });
        });
        setLayout(newLayout);
    }, [dataFetched, variableChartParams, unitPrecipitazione, format, chartRelayout, infoChartSize, isCollapsedFormGroup]);

    // Function to toggle the visibility of the clicked trace
    const toggleLegendItem = (event) => {
        setTraces(prevTraces =>
            prevTraces.map((trace, index) =>
                index === event.curveNumber
                    ? { ...trace, visible: trace.visible === 'legendonly' ? true : 'legendonly' }
                    : trace
            )
        );
        return false; // Prevent the default Plotly behavior
    };

    return (
        <Plot
            data={traces}
            layout={layout}
            style={{ width: '100%', height: '100%' }}
            onRelayout={handleRelayout}
            onLegendClick={toggleLegendItem}
            config={{
                displayModeBar: true,
                modeBarButtonsToRemove: ['resetScale2d'],
                autosizable: true
            }}
        />
    );
};

export default InfoChartRender;

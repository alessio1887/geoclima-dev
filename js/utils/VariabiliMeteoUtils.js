/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import ConfigUtils from '@mapstore/utils/ConfigUtils';


export const FIXED_RANGE = "fixed_range_picker";
export const FREE_RANGE = "free_range_picker";

export function isVariabiliMeteoLayer(layerName, variabiliMeteo) {
    // const VARIABILI_METEO = ConfigUtils.getConfigProp('variabiliMeteo');
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
//  Function to calculate the intersection between two line segments
function getIntersection(x1, y1, x2, y2, clim_y1, clim_y2) {
    // Calculate slopes
    const obsSlope = (y2 - y1) / (x2 - x1);
    const climSlope = (clim_y2 - clim_y1) / (x2 - x1);

    // Check for parallel lines
    if (obsSlope === climSlope) {
        return null; // No intersection
    }

    // Calculate intersection point
    const intersectionX = (clim_y1 - y1 + obsSlope * x1 - climSlope * x1) / (obsSlope - climSlope);

    // Calculate corresponding y value using either line's equation
    const yIntersect = y1 + obsSlope * (intersectionX - x1);

    return [intersectionX, yIntersect];
}
/**
 * Colors the areas between the observed data and climatology using two different colors:
 * one color if the observed values are below climatology, and another color if they are above.
 * It also handles intersections between the two curves.
 */
export function fillAreas(dateObjects, observed, climatological, variabile, PREC) {
    let fillTraces = [];
    let  upperColor;
    let  belowColor;
    if (PREC === variabile ) {
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
                hoverinfo: 'skip'
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
                    hoverinfo: 'skip'
                });

                fillTraces.push({
                    x: [xIntersect, x1, x1, xIntersect],
                    y: [yIntersect, y1Obs, y1Clim, yIntersect],
                    fill: 'toself',
                    fillcolor: y1Obs > y1Clim ? upperColor : belowColor,
                    line: { color: 'transparent' },
                    showlegend: false,
                    hoverinfo: 'skip'
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
                hoverinfo: 'skip'
            });
        }
    }
    return fillTraces;
}


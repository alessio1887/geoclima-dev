/**
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PIOGGIA = ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata"];
const TEMPERATURA = ["Temperatura_Media", "Temperatura_Media_Anomalia",
    "Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Massima", "Temperatura_Massima_Anomalia"];
const EVAPOTRASPIRAZIONE = ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc"];
const BILANCIOIDRICOSEMPLIFICATO = ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc"];
const SPI = [ "spi1", "spi3", "spi6", "spi12"];
const SPEI = [ "spei1", "spei3", "spei6", "spei12"];

export const PREC = "prec";
export const TMED = "tmed";
export const TMAX = "tmax";
export const TMIN = "tmin";
export const RET = "ret";
export const BIS = "bis";

export const VARIABLE_LIST = [
    { id: PREC, name: "Precipitazione" },
    { id: TMED, name: "Temperatura Media" },
    { id: TMAX, name: "Temperatura Massima" },
    { id: TMIN, name: "Temperatura Minima" },
    { id: RET, name: "Evapotraspirazione Potenziale" },
    { id: BIS, name: "Bilancio Idrico Semplificato" }
];

export function isVariabiliMeteoLayer(layerName) {
    let check = false;
    if (PIOGGIA.includes(layerName) || TEMPERATURA.includes(layerName) || EVAPOTRASPIRAZIONE.includes(layerName) ||
    SPI.includes(layerName) || SPEI.includes(layerName) || BILANCIOIDRICOSEMPLIFICATO.includes(layerName)) {
        check = true;
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
export function fillAreas(dateObjects, observed, climatological, variabile) {
    let fillTraces = [];
    let  upperColor;
    let  belowColor;
    // if (PIOGGIA.includes(variabile)) {
    //     upperColor = '#8884d8';
    //     belowColor = '#FF0000';
    // } else {
    //     upperColor = '#FF0000';
    //     belowColor = '#8884d8';
    // }
    if (PREC === variabile ) {
        upperColor = 'rgba(0, 0, 255, 0.6)';
        belowColor = 'rgba(255, 0, 0, 0.6)';
    } else {
        upperColor = 'rgba(255, 0, 0, 0.6))';
        belowColor = 'rgba(0, 0, 255, 0.6)';
    }
    let i;
    for (i = 0; i < dateObjects.length - 1; i++) {
        const x0 = dateObjects[i].getTime();
        const x1 = dateObjects[i + 1].getTime();
        const y0Obs = observed[i];
        const y1Obs = observed[i + 1];
        const y0Clim = climatological[i];
        const y1Clim = climatological[i + 1];

        // Check for intersection
        if ((y0Obs < y0Clim && y1Obs > y1Clim) || (y0Obs > y0Clim && y1Obs < y1Clim)) {
            const [xIntersect, yIntersect] = getIntersection(x0, y0Obs, x1, y1Obs, y0Clim, y1Clim);
            if (xIntersect !== null) { // Only proceed if there is a valid intersection
                fillTraces.push({
                    x: [x0, xIntersect, xIntersect, x0],
                    y: [y0Obs, yIntersect, yIntersect, y0Clim],
                    fill: 'toself',
                    fillcolor: y0Obs < y0Clim ? belowColor : upperColor,
                    line: {color: 'transparent'},
                    showlegend: false,
                    hoverinfo: 'skip'
                });

                fillTraces.push({
                    x: [xIntersect, x1, x1, xIntersect],
                    y: [yIntersect, y1Obs, y1Clim, yIntersect],
                    fill: 'toself',
                    fillcolor: y1Obs < y1Clim ? belowColor : upperColor,
                    line: {color: 'transparent'},
                    showlegend: false,
                    hoverinfo: 'skip'
                });
            }
        } else {
            fillTraces.push({
                x: [x0, x1, x1, x0],
                y: [Math.max(y0Obs, y0Clim), Math.max(y1Obs, y1Clim), Math.min(y1Obs, y1Clim), Math.min(y0Obs, y0Clim)],
                fill: 'toself',
                fillcolor: y0Obs < y0Clim ? belowColor : upperColor,
                line: {color: 'transparent'},
                showlegend: false,
                hoverinfo: 'skip'
            });
        }
    }
    return fillTraces;
}


/**
 * Copyright 2024, GeoSolutions Sas.
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

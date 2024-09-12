const PIOGGIA = ["Pioggia_Anomalia_perc", "Pioggia_Anomalia_mm", "Pioggia_Cumulata"];
const TEMPERATURA = ["Temperatura_Media", "Temperatura_Media_Anomalia",
    "Temperatura_Minima", "Temperatura_Minima_Anomalia", "Temperatura_Massima", "Temperatura_Massima_Anomalia"];
const EVAPOTRASPIRAZIONE = ["Evapotraspirazione", "Evapotraspirazione_Anomalia_mm", "Evapotraspirazione_Anomalia_perc"];
const BILANCIOIDRICOSEMPLIFICATO = ["BilancioIdricoSemplificato", "BilancioIdricoSemplificato_Anomalia_mm", "BilancioIdricoSemplificato_Anomalia_perc"];
const SPI = [ "spi1", "spi3", "spi6", "spi12"];
const SPEI = [ "spei1", "spei3", "spei6", "spei12"];

export function isVariabiliMeteoLayer(layerName) {
    let check = false;
    if (PIOGGIA.includes(layerName) || TEMPERATURA.includes(layerName) || EVAPOTRASPIRAZIONE.includes(layerName)
        || BILANCIOIDRICOSEMPLIFICATO.includes(layerName)) {
        check = true;
    }
    return check;
}

export function isSPIorSPEILayer(layerName) {
    let check = false;
    if (SPI.includes(layerName) || SPEI.includes(layerName)) {
        check = true;
    }
    return check;
}


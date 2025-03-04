import { createSelector } from 'reselect';
import { layersSelector } from '@mapstore/selectors/layers';

export const exportImageEnabledSelector = state =>
    state.controls &&
    state.controls.exportImage &&
    state.controls.exportImage.enabled;
export const fromDataSelector = state => state.exportimage?.fromData;
export const toDataSelector = state => state.exportimage?.toData;
export const tabVariablesSelector = state => state.exportimage.tabVariables;
export const imageUrlSelector = state => state.exportimage?.imageUrl;
export const fileNameSelector = state => state.exportimage?.fileName;
export const exportImageApiSelector = state => state.exportimage?.maskLoading || false;
export const alertMessageSelector = state => state.exportimage?.alertMessage;
// export const isPluginOpenSelector = state => state.exportimage?.isPluginOpen;

export const isLayerLoadingSelector = createSelector(
    [layersSelector],
    (allMapLayers) => allMapLayers && allMapLayers.some(layer => layer.loading) // Restituisce true se almeno un layer è in loading
);

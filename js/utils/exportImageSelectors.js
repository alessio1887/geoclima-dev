export const exportImageEnabledSelector = state =>
    state.controls &&
    state.controls.exportImage &&
    state.controls.exportImage.enabled;
export const fromDataSelector = state => state.exportimage?.fromData;
export const toDataSelector = state => state.exportimage?.toData;

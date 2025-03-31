/*
 * Plugin invisibile che registra l'epic updateLayerFromRemoteDateEpic
 * al caricamento dell'applicazione.
 * Utile per eseguire logica automatica (es. aggiornare layer dinamici).
 */
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import * as updateLayerFromRemoteDateEpic from '../epics/updateLayerFromRemoteDateEpic';

// Componente fittizio invisibile
const UpdateLayerPlugin = () => null;

export default createPlugin('UpdateLayer', {
    component: UpdateLayerPlugin,
    epics: updateLayerFromRemoteDateEpic
});

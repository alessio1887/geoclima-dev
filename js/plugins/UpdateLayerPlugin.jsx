/*
 * Plugin invisibile che registra l'epic updateLayerFromRemoteDateEpic
 * al caricamento dell'applicazione.
 * Utile per eseguire logica automatica (es. aggiornare layer dinamici).
 */
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import updateLayerFromRemoteDateEpic from '../epics/updateLayerFromRemoteDateEpic';

// Componente fittizio invisibile
const DummyComponent = () => null;

export default createPlugin('UpdateLayerPlugin', {
    component: DummyComponent,
    epics: {
        updateLayerFromRemoteDateEpic
    }
});

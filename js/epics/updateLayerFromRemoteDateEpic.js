import axios from "axios";
import { Observable } from "rxjs";
import { MAP_CONFIG_LOADED } from "@mapstore/actions/config";
import { updateNode } from "@mapstore/actions/layers";

/**
 * Epic che aggiorna dinamicamente i parametri dei layer WMS che contengono
 * "Comuni_Rfwi_Run0_4classi_" nel name, in base alla data fornita da un servizio remoto.
 */

const prefixes = [
    "Comuni_Rfff_Run0_",
    "Comuni_Rfff_Run1_",
    "Comuni_Rfff_Run2_",
    "Comuni_Rfwi_Run0_",
    "Comuni_Rfwi_Run1_",
    "Comuni_Rfwi_Run2_",
    "Comuni_Rdmc_Run0_",
    "Comuni_Rdmc_Run1_",
    "Comuni_Rdmc_Run2_",
    "Comuni_Rddd_Run0_",
    "Comuni_Rddd_Run1_",
    "Comuni_Rddd_Run2_",
    "fire_presc_threshold_Run0_",
    "fire_presc_threshold_Run1_",
    "fire_presc_threshold_Run2_",
    "Rfwi_comuni_",
    "Rdmc_comuni_",
    "Rddd_comuni_",
    "Rfff_sp_",
    "Rfwi_sp_",
    "Rdmc_sp_",
    "Rddd_sp_"
];

const updateLayerFromRemoteDateEpic = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap(() => {
        const layers = store.getState()?.layers?.flat || [];
        const matchingLayers = layers.filter((layer) =>
            prefixes.some(prefix => layer?.name?.startsWith(prefix))
        );

        if (matchingLayers.length === 0) {
            return Observable.of({ type: "NO_MATCHING_LAYER_FOUND" });
        }

        return Observable.defer(() =>
            axios
                .get("https://geoportale.lamma.rete.toscana.it/rischiojson/rischiojson.php?comune=PRATO")
                .then((response) => {
                    const cleaned = response.data.replace(/^\(\s*/, "").replace(/\)\s*$/, "");
                    const json = JSON.parse(cleaned);
                    const date = json?.results?.[0]?.data || "2025-01-01";
                    const year = date.split("-")[0];

                    const updateActions = matchingLayers.flatMap((layer) => {
                        const nameBase = layer.name.replace(/_\d{4}-\d{2}-\d{2}$/, ""); // rimuove suffisso data
                        const updatedName = `${nameBase}_${date}`;
                        const updatedTitle = `${layer.title?.split("–")[0].trim()} – ${date}`;
                        return [
                            updateNode(layer.id, "layer", {
                                title: updatedTitle,
                                name: updatedName,
                                description: `Pericolosità incendi del ${date}`,
                                params: {
                                    map: `wms_${year}/ris_prev_incendio_wms_${date}.map`
                                }
                            })
                        ];
                    });

                    return updateActions;
                })
                .catch((error) => {
                    console.error("Errore durante il fetch della data:", error);
                    return { type: "UPDATE_LAYER_DATE_FAILED" };
                })
        ).mergeMap((actions) =>
            Observable.of(...(Array.isArray(actions) ? actions : [actions]))
        );
    });


export default updateLayerFromRemoteDateEpic;

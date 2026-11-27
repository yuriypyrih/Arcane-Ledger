import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import { applyDamageToCharacterCompanion } from "../CharactersPage/companions";
import { toEncounterCreatureRecord } from "./encounterCreatureUtils";

/** Applies damage with the same rules as the creature drawer (temporary hit points first, death saves). */
export function applyDamageToEncounterCreature(
  creature: EncounterTemplateCreatureRecord,
  amount: number
): EncounterTemplateCreatureRecord {
  return {
    ...toEncounterCreatureRecord(
      applyDamageToCharacterCompanion(
        { ...creature, source: "Manual", separateInitiative: false },
        amount
      )
    ),
    // The companion shape has no picture; keep the GM's link.
    ...(creature.imageUrl ? { imageUrl: creature.imageUrl } : {})
  };
}

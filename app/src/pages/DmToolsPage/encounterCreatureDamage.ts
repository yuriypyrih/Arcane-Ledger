import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import { applyDamageToCharacterCompanion } from "../CharactersPage/companions";
import { preserveEncounterExtras, toEncounterCreatureRecord } from "./encounterCreatureUtils";

/** Applies damage with the same rules as the creature drawer (temporary hit points first, death saves). */
export function applyDamageToEncounterCreature(
  creature: EncounterTemplateCreatureRecord,
  amount: number
): EncounterTemplateCreatureRecord {
  return preserveEncounterExtras(
    creature,
    toEncounterCreatureRecord(
      applyDamageToCharacterCompanion(
        { ...creature, source: "Manual", separateInitiative: false },
        amount
      )
    )
  );
}

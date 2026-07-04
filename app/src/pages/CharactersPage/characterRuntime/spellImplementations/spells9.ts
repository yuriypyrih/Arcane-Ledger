import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { ALL_DAMAGE_STATUS_VALUE } from "../../damageCoverageStatuses";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import { compileSpellImplementationContributions } from "./contributions";

export const invulnerabilitySpellId = "spell-invulnerability";
export const invulnerabilityStatusValue = "Invulnerability";
export const invulnerabilityAllDamageImmunityStatusSourceId =
  "spell-invulnerability-all-damage-immunity";

function isActiveInvulnerabilityConcentrationStatusEntry(
  entry: CharacterStatusEntry
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === invulnerabilitySpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.disabled !== true
  );
}

function hasActiveInvulnerabilityConcentrationStatus(
  statusEntries: Character["statusEntries"]
): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    isActiveInvulnerabilityConcentrationStatusEntry
  );
}

export function getInvulnerabilitySpellDerivedStatusEntriesForCharacter(
  character: Pick<Character, "statusEntries">
): CharacterStatusEntry[] {
  if (!hasActiveInvulnerabilityConcentrationStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      id: invulnerabilityAllDamageImmunityStatusSourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: ALL_DAMAGE_STATUS_VALUE,
      source: invulnerabilityStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      },
      sourceId: invulnerabilityAllDamageImmunityStatusSourceId,
      sourceSpellId: invulnerabilitySpellId,
      description: "For the duration, you are immune to all damage."
    }
  ];
}

const invulnerabilitySpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: invulnerabilitySpellId,
    label: invulnerabilityStatusValue
  },
  spellId: invulnerabilitySpellId
};

export const spellImplementations9 = compileSpellImplementationContributions([
  invulnerabilitySpellImplementationSpec
]);

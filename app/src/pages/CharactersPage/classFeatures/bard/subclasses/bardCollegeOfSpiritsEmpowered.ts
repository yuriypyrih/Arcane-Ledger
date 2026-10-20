import type { Character } from "../../../../../types";
import type { SpellEntry } from "../../../../../codex/entries";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import {
  getBardSpiritsState,
  hasBardSpirits,
  updateBardSpiritsState
} from "./bardCollegeOfSpiritsState";

export const spiritGuardiansSpellId = "spell-spirit-guardians";
export const spiritualManifestationFreeCastEffectId = "bard-spiritual-manifestation-free-cast";
export const spiritualManifestationCoverEffectId = "bard-spiritual-manifestation-cover";
type ManifestationCounter =
  | "spiritualManifestationUsesExpended"
  | "spiritualManifestationCoverUsesExpended";

export function transformBardSpiritsEmpoweredSpellEntry(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!hasBardSpirits(character, 6)) return spell;
  const supportsPowerFromBeyond =
    spell.isDamagingSpell === true || spell.damage.length > 0 || spell.isHealingSpell === true;
  const isSpiritGuardians = spell.id === spiritGuardiansSpellId;
  if (!supportsPowerFromBeyond && !isSpiritGuardians) return spell;

  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.EMPOWERED_CHANNELING
  );
  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.EMPOWERED_CHANNELING,
    isSpiritGuardians ? description : description.slice(0, 1),
    "Empowered Channeling"
  );
}

export function getSpiritualManifestationRemaining(
  character: SubclassRuntimeCharacter,
  cover = false
): number {
  return hasBardSpirits(character, 6)
    ? 1 -
        (getBardSpiritsState(character)[
          cover ? "spiritualManifestationCoverUsesExpended" : "spiritualManifestationUsesExpended"
        ] ?? 0)
    : 0;
}

export function consumeSpiritualManifestation(character: Character, cover = false): Character {
  if (getSpiritualManifestationRemaining(character, cover) <= 0) return character;
  const key: ManifestationCounter = cover
    ? "spiritualManifestationCoverUsesExpended"
    : "spiritualManifestationUsesExpended";
  return updateBardSpiritsState(character, { [key]: 1 });
}

export function restoreSpiritualManifestation(character: Character, cover = false): Character {
  const key: ManifestationCounter = cover
    ? "spiritualManifestationCoverUsesExpended"
    : "spiritualManifestationUsesExpended";
  return hasBardSpirits(character, 6) && character.classFeatureState?.bard?.[key]
    ? updateBardSpiritsState(character, { [key]: 0 })
    : character;
}

export function canUseSpiritualManifestationFreeCast(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return spell.id === spiritGuardiansSpellId && getSpiritualManifestationRemaining(character) > 0;
}

export function getBardSpiritsSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasBardSpirits(character, 6)) return [];
  return [
    {
      id: spiritualManifestationFreeCastEffectId,
      apply: (current, context) =>
        canUseSpiritualManifestationFreeCast(current, context.spell)
          ? consumeSpiritualManifestation(current)
          : current
    },
    {
      id: spiritualManifestationCoverEffectId,
      apply: (current, context) => {
        if (context.spell.id !== spiritGuardiansSpellId) return current;
        const entries = normalizeCharacterStatusEntries(current.statusEntries);
        if (
          !entries.some(
            (entry) =>
              entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
              entry.value === EFFECT_NAME.CONCENTRATION &&
              entry.sourceSpellId === spiritGuardiansSpellId
          )
        )
          return current;
        const spent = consumeSpiritualManifestation(current, true);
        if (spent === current) return current;
        return {
          ...spent,
          statusEntries: [
            ...entries.filter((entry) => entry.sourceId !== spiritualManifestationCoverEffectId),
            createCharacterStatusEntry({
              group: STATUS_ENTRY_GROUP.EFFECTS,
              value: "Spiritual Manifestation: Half Cover",
              source: "Spirit Guardians",
              sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
              sourceId: spiritualManifestationCoverEffectId,
              notes:
                "You and allies within your Spirit Guardians emanation have Half Cover. Apply the cover bonus to applicable attacks and Dexterity saving throws manually.",
              duration: {
                kind: STATUS_DURATION_KIND.LINKED,
                linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
                linkedValue: EFFECT_NAME.CONCENTRATION
              }
            })
          ]
        };
      }
    }
  ];
}

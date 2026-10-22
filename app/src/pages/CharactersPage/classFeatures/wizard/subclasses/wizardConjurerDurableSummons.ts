import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { CharacterCompanion } from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getClassLevel } from "../../../multiclassState";
import { createTemporaryHitPointsAssignment } from "../../../shared/temporaryHitPoints";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { isConjurationSummoningSpell } from "./wizardConjurerSpells";

function getDurableSummonsFeature(character: SubclassRuntimeCharacter, spell: SpellEntry) {
  return isConjurationSummoningSpell(spell)
    ? getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.DURABLE_SUMMONS)
    : null;
}

export function transformDurableSummonsSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getDurableSummonsFeature(character, spell);
  return feature
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.DURABLE_SUMMONS,
        feature.description
      )
    : spell;
}

export function getDurableSummonsCompanionTransform(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry,
  sourceSpellSlotLevel: number | null
): ((companion: CharacterCompanion) => CharacterCompanion) | undefined {
  if (!sourceSpellSlotLevel || sourceSpellSlotLevel < 1) return undefined;
  const feature = getDurableSummonsFeature(character, spell);
  if (!feature) return undefined;
  // Companion notes are plain text, unlike spell and feature descriptions.
  const description = createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.DURABLE_SUMMONS,
    feature.description
  )
    .map((entry) => (typeof entry === "string" ? entry : entry.items.join("\n")))
    .join("\n\n")
    .replace(/<[^>]+>/g, "");
  const temporaryHitPoints = createTemporaryHitPointsAssignment(
    2 * getClassLevel(character, "Wizard"),
    feature.name
  );
  return (companion) => ({
    ...companion,
    ...temporaryHitPoints,
    description: companion.description.includes(description)
      ? companion.description
      : [companion.description, description].filter(Boolean).join("\n\n")
  });
}

import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character, CharacterRogueFeatureState } from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { createChargesCardUsage } from "../../cardUsage";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const phantomVoiceOfDeathActionKey = "rogue-phantom-voice-of-death";

export function hasPhantomVoiceOfDeath(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.VOICE_OF_DEATH) !== null
  );
}

export function normalizePhantomVoiceOfDeathState(
  record: Partial<CharacterRogueFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterRogueFeatureState, "phantomVoiceOfDeathUsesExpended"> {
  if (!hasPhantomVoiceOfDeath(character)) return {};
  const expended = Number(record.phantomVoiceOfDeathUsesExpended);
  return { phantomVoiceOfDeathUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getPhantomVoiceOfDeathUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasPhantomVoiceOfDeath(character)) return 0;
  return (
    1 -
    (normalizePhantomVoiceOfDeathState(character.classFeatureState?.rogue ?? {}, character)
      .phantomVoiceOfDeathUsesExpended ?? 0)
  );
}

export function consumePhantomVoiceOfDeathUse(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "rogue",
      counter: "phantomVoiceOfDeathUsesExpended",
      total: hasPhantomVoiceOfDeath(character) ? 1 : 0,
      remaining: getPhantomVoiceOfDeathUsesRemaining(character)
    },
    1
  );
}

export function restorePhantomVoiceOfDeathOnRest(character: Character): Character {
  if (
    !hasPhantomVoiceOfDeath(character) ||
    !character.classFeatureState?.rogue?.phantomVoiceOfDeathUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "rogue", {
    ...character.classFeatureState?.rogue,
    phantomVoiceOfDeathUsesExpended: 0
  });
}

export function getPhantomVoiceOfDeathSpellEntry(
  character: Character,
  spell: SpellEntry
): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    { ...spell, components: [], materialSpecified: undefined },
    character,
    CLASS_FEATURE.VOICE_OF_DEATH,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.VOICE_OF_DEATH)
  );
}

export function collectPhantomVoiceOfDeathContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasPhantomVoiceOfDeath(character)) return [];
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.VOICE_OF_DEATH);
  const usesRemaining = getPhantomVoiceOfDeathUsesRemaining(character);
  return [
    {
      source: createSubclassContributionSource({
        id: phantomVoiceOfDeathActionKey,
        label: "Voice of Death",
        entryId: CLASS_FEATURE.VOICE_OF_DEATH
      }),
      actions: [
        {
          key: phantomVoiceOfDeathActionKey,
          name: "Voice of Death",
          sourceFeature: CLASS_FEATURE.VOICE_OF_DEATH,
          cardTheme: ACTION_CARD_THEME.MAGIC,
          summary: "Cast Speak with Dead without a spell slot or components.",
          detail: "Open Speak with Dead and cast it using your Voice of Death charge.",
          breakdown: "Free Speak with Dead",
          economyType: ECONOMY_TYPE.ACTION,
          actionCategory: ACTION_CATEGORY.MAGIC,
          usesRemaining,
          usesTotal: 1,
          cardUsage: createChargesCardUsage(usesRemaining, 1),
          description,
          drawer: { kind: "confirm", description, confirmLabel: "Open Speak with Dead" },
          execute: {
            kind: "spell",
            spellSource: "fixed",
            effectKind: "voice-of-death",
            spellId: "spell-speak-with-dead",
            spellLevel: 3,
            label: "Open Speak with Dead",
            actionContextText: "Using Voice of Death",
            actionAvailabilityText: "Cast without expending a spell slot or components.",
            actionConsumesSpellSlot: false,
            spellcastingAbilityOverride: "DEX"
          },
          disabled: usesRemaining <= 0,
          disabledReason:
            usesRemaining <= 0
              ? "Voice of Death recharges when you finish a Short or Long Rest."
              : undefined
        }
      ]
    }
  ];
}

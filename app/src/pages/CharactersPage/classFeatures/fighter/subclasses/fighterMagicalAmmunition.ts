import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterFighterFeatureState
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import {
  getFighterSecondWindUsesRemaining,
  getFighterSecondWindUsesTotal
} from "../secondWind";

export const magicalAmmunitionActionKey = "fighter-arcane-archer-magical-ammunition";
const magicalAmmunitionName = "Magical Ammunition";

export function hasMagicalAmmunition(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.MAGICAL_AMMUNITION) !== null
  );
}

export function normalizeMagicalAmmunitionState(
  value: Partial<CharacterFighterFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterFighterFeatureState, "magicalAmmunitionUsesExpended"> {
  if (!hasMagicalAmmunition(character)) return {};
  const expended = Number(value.magicalAmmunitionUsesExpended);
  return { magicalAmmunitionUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getMagicalAmmunitionUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasMagicalAmmunition(character)) return 0;
  return (
    1 -
    (normalizeMagicalAmmunitionState(character.classFeatureState?.fighter ?? {}, character)
      .magicalAmmunitionUsesExpended ?? 0)
  );
}

export function activateMagicalAmmunition(character: Character): Character {
  if (!hasMagicalAmmunition(character)) return character;
  const usesRemaining = getMagicalAmmunitionUsesRemaining(character);
  const nextCharacter =
    usesRemaining > 0
      ? spendClassResource(
          character,
          {
            stateKey: "fighter",
            counter: "magicalAmmunitionUsesExpended",
            total: 1,
            remaining: usesRemaining
          },
          1
        )
      : spendClassResource(
          character,
          {
            stateKey: "fighter",
            counter: "secondWindUsesExpended",
            total: getFighterSecondWindUsesTotal(character),
            remaining: getFighterSecondWindUsesRemaining(character)
          },
          1
        );
  if (nextCharacter === character) return character;

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: magicalAmmunitionName,
        source: magicalAmmunitionName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: { kind: STATUS_DURATION_KIND.INFINITE },
        description: getFeatureDescriptionForCharacter(character, CLASS_FEATURE.MAGICAL_AMMUNITION)
          .flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items))
          .join("\n\n"),
        customEffects: []
      })
    ]
  };
}

export function restoreMagicalAmmunition(character: Character): Character {
  if (!hasMagicalAmmunition(character) || getMagicalAmmunitionUsesRemaining(character) > 0) {
    return character;
  }
  return replaceClassFeatureState(character, "fighter", {
    ...character.classFeatureState?.fighter,
    magicalAmmunitionUsesExpended: 0
  });
}

export function collectMagicalAmmunitionContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasMagicalAmmunition(character)) return [];
  const usesRemaining = getMagicalAmmunitionUsesRemaining(character);
  const secondWindRemaining = getFighterSecondWindUsesRemaining(character);
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.MAGICAL_AMMUNITION
  );
  const fallbackCost = createFeatureActionCardCost({ amountText: "1", icon: "wind" });
  const disabledReason =
    usesRemaining <= 0 && secondWindRemaining <= 0
      ? "No Magical Ammunition charge or Second Wind uses remaining."
      : undefined;

  return [
    {
      source: createSubclassContributionSource({
        id: magicalAmmunitionActionKey,
        label: magicalAmmunitionName,
        entryId: CLASS_FEATURE.MAGICAL_AMMUNITION
      }),
      actions: [
        {
          key: magicalAmmunitionActionKey,
          name: magicalAmmunitionName,
          sourceFeature: CLASS_FEATURE.MAGICAL_AMMUNITION,
          summary: "Track your use of Magical Ammunition.",
          detail: "Create an editable Magical Ammunition trait.",
          breakdown: "Track ammunition",
          economyType: ECONOMY_TYPE.ACTION,
          actionCategory: ACTION_CATEGORY.MAGIC,
          usesRemaining,
          usesTotal: 1,
          cardUsage: createChargesOrResourceCardUsage(usesRemaining, 1, fallbackCost),
          headerTags: createChargesAndUsageHeaderTags(
            usesRemaining,
            1,
            fallbackCost,
            secondWindRemaining,
            getFighterSecondWindUsesTotal(character),
            { icon: "wind" },
            undefined,
            { isFallback: true }
          ),
          description,
          drawer: { kind: "confirm", description },
          execute: { kind: "activate" },
          disabled: Boolean(disabledReason),
          disabledReason
        }
      ]
    }
  ];
}

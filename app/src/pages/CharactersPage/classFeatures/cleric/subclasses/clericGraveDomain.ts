import { CLASS_FEATURE, MAGIC_SCHOOL, REACTION } from "../../../../../codex/entries/enums";
import type { SpellEntry } from "../../../../../codex/entries";
import type { Character, CharacterClericFeatureState } from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP
} from "../../../../../types";
import { getClassLevel, getClassSubclassId, hasCharacterClass } from "../../../multiclassState";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import { getBoonOfFortitudeHealingBonusForCharacter } from "../../../feats/runtime";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  transformSpellToBonusAction,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import {
  createChargesOrResourceCardUsage,
  createChargesAndUsageHeaderTags,
  createFeatureActionCardCost
} from "../../cardUsage";
import type { FeatureDamageBonus, FeatureActionCard } from "../../types";
import { clericChannelDivinityActionKey } from "../../channelDivinity";
import {
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining
} from "../clericChannelDivinity";
import {
  getDivineForeknowledgeFallbackSlotLevel,
  getDivineForeknowledgeFallbackSlotSummary
} from "./clericKnowledgeDomain";
import { normalizeSpellSlotsExpended } from "../../../spellSlots";
import { getSheetSpellSlotTotals } from "../../../multiclassSpellcasting";

export const graveDomainSubclassId = "cleric-grave-domain";
export const pathToTheGraveKey = "cleric-path-to-the-grave";
export const endPathToTheGraveKey = "cleric-end-path-to-the-grave";
export const pathToTheGraveStatusId = "feature-cleric-path-to-the-grave";
export const sentinelAtDeathsDoorId = "reaction-cleric-sentinel-at-deaths-door";
export const keeperOfSoulsKey = "cleric-keeper-of-souls";
export const enhancedNecromancyEffectId = "cleric-enhanced-necromancy";
const graveDomainSpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Detect Evil and Good",
    "False Life",
    "Gentle Repose",
    "Ray of Enfeeblement",
    "Spare the Dying"
  ]),
  5: resolveSpellIdsByName(["Revivify", "Vampiric Touch"]),
  7: resolveSpellIdsByName(["Blight", "Death Ward"]),
  9: resolveSpellIdsByName(["Dispel Evil and Good", "Raise Dead"])
};
export function hasGraveDomain(character: SubclassRuntimeCharacter, minimumLevel = 3): boolean {
  return (
    hasCharacterClass(character, "Cleric") &&
    getClassSubclassId(character, "Cleric") === graveDomainSubclassId &&
    getClassLevel(character, "Cleric") >= minimumLevel
  );
}
export function getSentinelUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasGraveDomain(character, 6)
    ? Math.max(1, getAbilityModifierForCharacter(character, "WIS"))
    : 0;
}
export function normalizeGraveDomainState(
  value: Partial<CharacterClericFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterClericFeatureState> {
  if (!hasGraveDomain(character)) return {};
  const counter = (value: unknown, total: number) =>
    Math.min(total, Math.max(0, Math.floor(Number(value) || 0)));
  return {
    pullOfDeathUsedThisTurn: value.pullOfDeathUsedThisTurn === true,
    sentinelAtDeathsDoorUsesExpended: hasGraveDomain(character, 6)
      ? counter(value.sentinelAtDeathsDoorUsesExpended, getSentinelUsesTotal(character))
      : undefined,
    keeperOfSoulsUsesExpended: hasGraveDomain(character, 17)
      ? counter(value.keeperOfSoulsUsesExpended, 1)
      : undefined
  };
}
export function getSentinelUsesRemaining(character: SubclassRuntimeCharacter): number {
  return (
    getSentinelUsesTotal(character) -
    (normalizeGraveDomainState(character.classFeatureState?.cleric ?? {}, character)
      .sentinelAtDeathsDoorUsesExpended ?? 0)
  );
}
export function consumeSentinelUse(character: Character): Character {
  if (getSentinelUsesRemaining(character) <= 0) return character;
  return replaceClassFeatureState(character, "cleric", {
    ...character.classFeatureState?.cleric,
    sentinelAtDeathsDoorUsesExpended:
      (character.classFeatureState?.cleric?.sentinelAtDeathsDoorUsesExpended ?? 0) + 1
  });
}
export function restoreSentinelUses(character: Character): Character {
  return hasGraveDomain(character, 6)
    ? replaceClassFeatureState(character, "cleric", {
        ...character.classFeatureState?.cleric,
        sentinelAtDeathsDoorUsesExpended: 0
      })
    : character;
}
export function getKeeperOfSoulsRemaining(character: SubclassRuntimeCharacter): number {
  return hasGraveDomain(character, 17)
    ? 1 -
        (normalizeGraveDomainState(character.classFeatureState?.cleric ?? {}, character)
          .keeperOfSoulsUsesExpended ?? 0)
    : 0;
}
export function restoreKeeperOfSouls(character: Character): Character {
  return hasGraveDomain(character, 17)
    ? replaceClassFeatureState(character, "cleric", {
        ...character.classFeatureState?.cleric,
        keeperOfSoulsUsesExpended: 0
      })
    : character;
}
export function getPullOfDeathBonus(
  character: SubclassRuntimeCharacter
): FeatureDamageBonus | null {
  if (!hasGraveDomain(character)) return null;
  const die = getClassLevel(character, "Cleric") >= 11 ? 6 : 4;
  return { label: "Pull of Death", formula: `1d${die}`, displayLabel: `1d${die} Necrotic` };
}
export function canUsePullOfDeath(character: SubclassRuntimeCharacter): boolean {
  return hasGraveDomain(character) && !character.classFeatureState?.cleric?.pullOfDeathUsedThisTurn;
}
export function consumePullOfDeath(character: Character): Character {
  return canUsePullOfDeath(character)
    ? replaceClassFeatureState(character, "cleric", {
        ...character.classFeatureState?.cleric,
        pullOfDeathUsedThisTurn: true
      })
    : character;
}
export function supportsEnhancedNecromancy(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): boolean {
  return (
    hasGraveDomain(character, 17) &&
    (Object.values(graveDomainSpellIdsByLevel).flat().includes(spell.id) ||
      (spell.magicSchool === MAGIC_SCHOOL.NECROMANCY && spell.spellLevel <= 5))
  );
}
export function activatePathToTheGrave(character: Character): Character {
  if (!hasGraveDomain(character) || getClericChannelDivinityUsesRemaining(character) <= 0)
    return character;
  const next = expendClericChannelDivinityUse(character);
  return {
    ...next,
    statusEntries: [
      ...normalizeCharacterStatusEntries(next.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Path to the Grave",
        source: "Grave Domain",
        sourceId: pathToTheGraveStatusId,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        }
      })
    ]
  };
}
export function endPathToTheGrave(character: Character): Character {
  if (!hasGraveDomain(character)) return character;
  const entries = normalizeCharacterStatusEntries(character.statusEntries);
  const index = entries.findIndex((entry) => entry.sourceId === pathToTheGraveStatusId);
  return index < 0
    ? character
    : { ...character, statusEntries: entries.filter((_, i) => i !== index) };
}
export function activateKeeperOfSouls(character: Character, target: "self" | "other"): Character {
  if (
    !hasGraveDomain(character, 17) ||
    hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)
  )
    return character;
  let next = character;
  if (getKeeperOfSoulsRemaining(character) <= 0) {
    const slot = getDivineForeknowledgeFallbackSlotLevel(character);
    if (slot === null) return character;
    const slots = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      getSheetSpellSlotTotals(character)
    );
    slots[slot - 1] = (slots[slot - 1] ?? 0) + 1;
    next = { ...next, spellSlotsExpended: slots };
  }
  next = replaceClassFeatureState(next, "cleric", {
    ...next.classFeatureState?.cleric,
    keeperOfSoulsUsesExpended: 1
  });
  if (target === "other") return next;
  return reconcileCharacterStatusConsequences({
    ...next,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(next),
      next.currentHitPoints +
        2 * getClassLevel(next, "Cleric") +
        getBoonOfFortitudeHealingBonusForCharacter(next)
    ),
    deathSaves: { successes: 0, failures: 0 }
  });
}
export function getGraveHealingDescription(character: SubclassRuntimeCharacter) {
  return hasGraveDomain(character)
    ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.CIRCLE_OF_MORTALITY).slice(1)
    : [];
}
export function collectClericGraveDomainContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasGraveDomain(character)) return [];
  const level = getClassLevel(character, "Cleric");
  const source = (entryId: CLASS_FEATURE, label: string) =>
    createSubclassContributionSource({ id: `cleric-grave-${entryId}`, entryId, label });
  const circleDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.CIRCLE_OF_MORTALITY
  );
  const pathDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.PATH_TO_THE_GRAVE
  );
  const actions: FeatureActionCard[] = [];
  if (character.statusEntries?.some((entry) => entry.sourceId === pathToTheGraveStatusId))
    actions.push({
      key: endPathToTheGraveKey,
      name: "Path to the Grave",
      sourceFeature: CLASS_FEATURE.PATH_TO_THE_GRAVE,
      summary: "End a curse on a hit.",
      detail: "End one active curse when you or an ally hits the cursed creature.",
      breakdown: `+${level} Necrotic or Radiant`,
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      description: pathDescription,
      drawer: { kind: "confirm", eyebrow: "Grave Domain" },
      execute: { kind: "activate" }
    });
  const contributions: FeatureContributionSpec[] = [
    {
      source: source(CLASS_FEATURE.GRAVE_DOMAIN_SPELLS, "Grave Domain Spells"),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(level, graveDomainSpellIdsByLevel)
    },
    {
      source: source(CLASS_FEATURE.CIRCLE_OF_MORTALITY, "Circle of Mortality"),
      spellTransforms: [
        {
          id: "cleric-circle-of-mortality",
          transform: (spell) => {
            const modified = transformSpellToBonusAction("spell-spare-the-dying", spell);
            return spell.isDamagingSpell ||
              spell.damage.length > 0 ||
              spell.isHealingSpell ||
              spell.id === "spell-spare-the-dying"
              ? appendFeatureSourcedDescriptionAddition(
                  modified,
                  character,
                  CLASS_FEATURE.CIRCLE_OF_MORTALITY,
                  circleDescription,
                  "Circle of Mortality"
                )
              : modified;
          }
        }
      ],
      weaponActionTransforms: [
        {
          id: "cleric-pull-of-death",
          transform: (_character, action) =>
            appendFeatureSourcedDescriptionAddition(
              action as import("../../../gameplay").WeaponAction,
              character,
              CLASS_FEATURE.CIRCLE_OF_MORTALITY,
              circleDescription.slice(0, 1),
              "Pull of Death"
            )
        }
      ]
    },
    {
      source: source(CLASS_FEATURE.PATH_TO_THE_GRAVE, "Path to the Grave"),
      actions,
      actionOptions: {
        [clericChannelDivinityActionKey]: [
          {
            key: pathToTheGraveKey,
            name: "Path to the Grave",
            summary: "Curse a creature",
            detail: "Curse a creature within 30 feet until your next turn starts.",
            breakdown: `Attack/save disadvantage | +${level} damage on hit`,
            economyType: ECONOMY_TYPE.BONUS_ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            description: pathDescription
          }
        ]
      }
    }
  ];
  if (hasGraveDomain(character, 6))
    contributions.push({
      source: source(CLASS_FEATURE.SENTINEL_AT_DEATHS_DOOR, "Sentinel at Death's Door"),
      reactions: [
        {
          id: sentinelAtDeathsDoorId,
          reaction: REACTION.SENTINEL_AT_DEATHS_DOOR,
          name: "Sentinel at Death's Door",
          sourceType: "feature",
          sourceFeature: CLASS_FEATURE.SENTINEL_AT_DEATHS_DOOR,
          sourceLabel: "Grave Domain",
          description: getFeatureDescriptionForCharacter(
            character,
            CLASS_FEATURE.SENTINEL_AT_DEATHS_DOOR
          )
        }
      ]
    });
  if (hasGraveDomain(character, 17)) {
    const remaining = getKeeperOfSoulsRemaining(character);
    const slots = getDivineForeknowledgeFallbackSlotSummary(character);
    const cost = createFeatureActionCardCost({ amountText: "6+", resourceLabel: "Spell Slot" });
    const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.DIVINE_REAPER);
    const disabledReason = hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)
      ? "You are Incapacitated."
      : remaining <= 0 && slots.remaining <= 0
        ? "No Keeper of Souls use or level 6+ spell slot remaining."
        : undefined;
    contributions.push({
      source: source(CLASS_FEATURE.DIVINE_REAPER, "Divine Reaper"),
      spellTransforms: [
        {
          id: "cleric-enhanced-necromancy-description",
          transform: (spell) =>
            supportsEnhancedNecromancy(character, spell)
              ? appendFeatureSourcedDescriptionAddition(
                  spell,
                  character,
                  CLASS_FEATURE.DIVINE_REAPER,
                  description.slice(0, 1),
                  "Enhanced Necromancy"
                )
              : spell
        }
      ],
      actions: [
        {
          key: keeperOfSoulsKey,
          name: "Keeper of Souls",
          sourceFeature: CLASS_FEATURE.DIVINE_REAPER,
          summary: "Heal when a nearby enemy dies.",
          detail:
            "When an enemy within 60 feet dies, heal yourself or a creature you can see within 60 feet.",
          breakdown: `${2 * level} HP`,
          economyType: ECONOMY_TYPE.FREE,
          actionCategory: ACTION_CATEGORY.FEATURE,
          cardUsage: createChargesOrResourceCardUsage(remaining, 1, cost),
          usesRemaining: remaining,
          usesTotal: 1,
          headerTags: createChargesAndUsageHeaderTags(
            remaining,
            1,
            cost,
            slots.remaining,
            slots.total,
            { label: "Spell Slots" }
          ),
          description: description.slice(1),
          drawer: {
            kind: "custom-form",
            eyebrow: "Grave Domain",
            formKind: "keeper-of-souls"
          },
          execute: { kind: "custom-form", formKind: "keeper-of-souls" },
          disabled: Boolean(disabledReason),
          disabledReason
        }
      ]
    });
  }
  return contributions;
}
export const getClericGraveDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectClericGraveDomainContributions),
    { character: character as Character }
  );

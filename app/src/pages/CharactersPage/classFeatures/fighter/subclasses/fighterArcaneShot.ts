import {
  CLASS_FEATURE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY
} from "../../../../../codex/entries/enums";
import {
  arcaneShotDieProgression,
  arcaneShotOptionLevels,
  arcaneShotOptions,
  arcaneShotUsingAShotDescription
} from "../../../../../codex/subclasses/fighterArcaneArcher";
import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getProficiencyBonus, type WeaponAction } from "../../../gameplay";
import { getClassLevel } from "../../../multiclassState";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export function hasArcaneShot(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.ARCANE_SHOT) !== null;
}

export function getArcaneShotDie(character: SubclassRuntimeCharacter): string | null {
  if (!hasArcaneShot(character)) return null;
  const fighterLevel = getClassLevel(character, "Fighter");
  return arcaneShotDieProgression.filter(({ level }) => level <= fighterLevel).pop()?.die ?? null;
}

export function getArcaneShotOptionCount(character: SubclassRuntimeCharacter): number {
  return hasArcaneShot(character)
    ? arcaneShotOptionLevels.filter((level) => level <= getClassLevel(character, "Fighter")).length
    : 0;
}

export function normalizeArcaneShotState(
  value: Partial<CharacterFighterFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterFighterFeatureState> {
  if (!hasArcaneShot(character)) return {};
  const saved = Array.isArray(value.arcaneShotOptionIds) ? value.arcaneShotOptionIds : [];
  const selected = new Set<string>();
  const arcaneShotOptionIds = Array.from(
    { length: getArcaneShotOptionCount(character) },
    (_, index) => {
      const id = saved[index];
      if (!arcaneShotOptions.some((option) => option.id === id) || selected.has(id)) return "";
      selected.add(id);
      return id;
    }
  );
  const expended = value.arcaneShotUsesExpended;
  return {
    arcaneShotOptionIds,
    arcaneShotUsesExpended:
      typeof expended === "number" && Number.isFinite(expended)
        ? Math.max(0, Math.floor(expended))
        : 0,
    arcaneShotUsedThisTurn: value.arcaneShotUsedThisTurn === true
  };
}

export function getArcaneShotOptionIds(character: SubclassRuntimeCharacter): string[] {
  return (
    normalizeArcaneShotState(character.classFeatureState?.fighter ?? {}, character)
      .arcaneShotOptionIds ?? []
  );
}

export function updateArcaneShotOptions(character: Character, ids: string[]): Character {
  if (!hasArcaneShot(character)) return character;
  const state = character.classFeatureState?.fighter ?? {};
  return replaceClassFeatureState(character, "fighter", {
    ...state,
    ...normalizeArcaneShotState({ ...state, arcaneShotOptionIds: ids }, character)
  });
}

export function getArcaneShotUsage(character: SubclassRuntimeCharacter) {
  const usesTotal = hasArcaneShot(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
  const state = normalizeArcaneShotState(character.classFeatureState?.fighter ?? {}, character);
  const usesRemaining = Math.max(0, usesTotal - (state.arcaneShotUsesExpended ?? 0));
  const disabledReason =
    usesRemaining <= 0
      ? "No Arcane Shot charges remaining."
      : state.arcaneShotUsedThisTurn
        ? "Arcane Shot has already been used this turn."
        : null;
  return { usesTotal, usesRemaining, disabled: disabledReason !== null, disabledReason };
}

export function isArcaneShotWeapon(action: WeaponAction | null): boolean {
  return (
    action?.attackKind === "weapon" &&
    action.combatType === WEAPON_COMBAT_TYPE.RANGED &&
    action.properties?.includes(WEAPON_PROPERTY.AMMUNITION) === true
  );
}

export function getArcaneShotWeaponOptionState(character: Character, action: WeaponAction | null) {
  return hasArcaneShot(character) && isArcaneShotWeapon(action)
    ? getArcaneShotUsage(character)
    : null;
}

export function consumeArcaneShot(character: Character, action: WeaponAction): Character {
  const usage = getArcaneShotWeaponOptionState(character, action);
  if (!usage || usage.disabled) return character;
  const next = spendClassResource(
    character,
    {
      stateKey: "fighter",
      counter: "arcaneShotUsesExpended",
      total: usage.usesTotal,
      remaining: usage.usesRemaining
    },
    1
  );
  return replaceClassFeatureState(next, "fighter", {
    ...next.classFeatureState?.fighter,
    arcaneShotUsedThisTurn: true
  });
}

export function restoreArcaneShot(character: Character): Character {
  if (!hasArcaneShot(character)) return character;
  return replaceClassFeatureState(character, "fighter", {
    ...character.classFeatureState?.fighter,
    arcaneShotUsesExpended: 0,
    arcaneShotUsedThisTurn: false
  });
}

export function advanceArcaneShotForNewRound(character: Character): Character {
  if (!character.classFeatureState?.fighter?.arcaneShotUsedThisTurn) return character;
  return replaceClassFeatureState(character, "fighter", {
    ...character.classFeatureState.fighter,
    arcaneShotUsedThisTurn: false
  });
}

export function collectArcaneShotContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasArcaneShot(character)) return [];
  const learnedIds = getArcaneShotOptionIds(character);
  return [
    {
      source: createSubclassContributionSource({
        id: "fighter-arcane-shot",
        label: "Arcane Shot",
        entryId: CLASS_FEATURE.ARCANE_SHOT
      }),
      weaponActionTransforms: [
        {
          id: "fighter-arcane-shot-weapon",
          transform: (_character, value) => {
            const action = value as WeaponAction;
            if (!isArcaneShotWeapon(action)) return action;
            const withDescription = appendFeatureSourcedDescriptionAddition(
              action,
              character,
              CLASS_FEATURE.ARCANE_SHOT,
              [arcaneShotUsingAShotDescription]
            );
            const withOptions = learnedIds.some(Boolean)
              ? appendFeatureSourcedDescriptionAddition(
                  withDescription,
                  character,
                  CLASS_FEATURE.ARCANE_SHOT_OPTIONS,
                  learnedIds.flatMap((id) => {
                    const option = arcaneShotOptions.find((option) => option.id === id);
                    return option ? [option.description] : [];
                  })
                )
              : withDescription;
            const intelligence = getAbilityModifierForCharacter(character, "INT");
            const proficiency = getProficiencyBonus(character);
            const label = "Arcane Shot DC Formula";
            return {
              ...withOptions,
              facts: [
                ...(withOptions.facts ?? []).filter((fact) => fact.label !== label),
                {
                  label,
                  value: `DC ${8 + intelligence + proficiency}`,
                  breakdown: `[8 Base ${intelligence >= 0 ? "+" : "-"} ${Math.abs(intelligence)} INT + ${proficiency} Prof. Bonus]`,
                  fullWidth: true
                }
              ]
            };
          }
        }
      ]
    }
  ];
}

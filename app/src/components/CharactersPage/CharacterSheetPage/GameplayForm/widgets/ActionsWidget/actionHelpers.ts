import type { Character, AbilityKey } from "../../../../../../types";
import {
  ACTION_TYPE,
  type SpellEntry,
  type WeaponEntry
} from "../../../../../../codex/entries";
import { getWeaponEntries } from "../../../../../../codex/selectors";
import { appendSourcedDescriptionAddition } from "../../../../../../pages/CharactersPage/actionModalDescriptions";
import { ECONOMY_TYPE, type EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import {
  getAbilityModifierBreakdownForCharacter
} from "../../../../../../pages/CharactersPage/abilities";
import {
  getSavingThrowBonusesForCharacter,
  getSpellEntryForCharacter,
  type FeatureActionCard,
  type FeatureActionExecuteConfig
} from "../../../../../../pages/CharactersPage/classFeatures";
import { getSpellEntryById } from "../../../../../../codex/entries";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import { warriorOfTheOpenHandSubclassId } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  monkStepOfTheWindActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining,
  grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { isRoundTrackerResourceAvailable } from "../../../../../../pages/CharactersPage/combat";

export const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  getWeaponEntries().map((entry) => [entry.name, entry])
);

export function getFeatureActionDrawerPrimaryLabel(
  action: Pick<FeatureActionCard, "name">
): string {
  const normalizedName = action.name.trim();

  return normalizedName ? `Use ${normalizedName}` : "Use";
}

export function shouldGrantMonkFleetStepFollowUp(
  character: Pick<Character, "className" | "level" | "subclassId" | "classFeatureState">,
  actionKey: string,
  economyType: EconomyType
): boolean {
  return (
    economyType === ECONOMY_TYPE.BONUS_ACTION &&
    character.className === "Monk" &&
    character.subclassId === warriorOfTheOpenHandSubclassId &&
    character.level >= 11 &&
    actionKey !== monkStepOfTheWindActionKey &&
    actionKey !== "common-action-dash"
  );
}

export function grantMonkFleetStepFollowUpIfEligible(
  character: Character,
  actionKey: string,
  economyType: EconomyType
): Character {
  return shouldGrantMonkFleetStepFollowUp(character, actionKey, economyType)
    ? grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse(character)
    : character;
}

export function shouldConsumeMonkFleetStepFollowUp(
  character: Pick<
    Character,
    "className" | "level" | "subclassId" | "classFeatureState" | "roundTracker"
  >
): boolean {
  return (
    getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining(character) > 0 &&
    !isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction")
  );
}

export function createCommonActionDefinition(action: FeatureActionCard): GameplayActionDefinition {
  return {
    kind: "feature",
    key: action.key,
    name: action.name,
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    economyMultiCount: action.economyMultiCount,
    disabled: action.disabled,
    disabledReason: action.disabledReason,
    action,
    execute: {
      kind: "activate"
    },
    drawer: {
      kind: "confirm",
      eyebrow: "Common Action",
      description: action.description ?? [],
      descriptionAdditions: action.descriptionAdditions ?? [],
      helperText: action.drawer?.helperText,
      helperTextTone: action.drawer?.helperTextTone,
      blockedReason: action.drawer?.blockedReason,
      facts: action.drawer?.facts ?? action.facts ?? [],
      factsSectionTitle: action.drawer?.factsSectionTitle,
      headerTags: action.drawer?.headerTags ?? action.headerTags ?? [],
      confirmLabel: action.drawer?.confirmLabel ?? getFeatureActionDrawerPrimaryLabel(action)
    }
  };
}

export function formatD20RollFormula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20${modifier >= 0 ? "+" : ""}${modifier}`;
}

export function resolveFeatureSavingThrowBonusTotal(
  character: Character,
  ability: AbilityKey
): number {
  return getSavingThrowBonusesForCharacter(character, ability).reduce((total, bonus) => {
    if (bonus.abilityModifierSource) {
      const sourceValue = getAbilityModifierBreakdownForCharacter(
        character,
        bonus.abilityModifierSource
      ).total;
      return (
        total +
        (typeof bonus.minimumValue === "number"
          ? Math.max(bonus.minimumValue, sourceValue)
          : sourceValue)
      );
    }

    return total + (bonus.value ?? 0);
  }, 0);
}

function createContactPatronSpellEntry(spell: SpellEntry): SpellEntry {
  return {
    ...spell,
    description: [
      "<strong>Contact Patron.</strong> You mentally contact your patron directly. This casting doesn't expend a spell slot, and you automatically succeed on the DC 15 Intelligence saving throw.",
      ...spell.description.slice(1)
    ]
  };
}

function createShadowArtsDarknessSpellEntry(spell: SpellEntry): SpellEntry {
  return appendSourcedDescriptionAddition(
    {
      ...spell,
      components: []
    },
    "Shadow Arts",
    [
      "This casting doesn't expend a spell slot or spell components. You can see within the spell's area when you cast it with this feature, and while the spell persists, you can move its area to a space within 60 feet of yourself at the start of each of your turns."
    ]
  );
}

export function getFixedSpellEntryForExecute(
  character: Character,
  execute: Extract<FeatureActionExecuteConfig, { kind: "spell" }>
): SpellEntry | null {
  if (!execute.spellId) {
    return null;
  }

  const spell = getSpellEntryById(execute.spellId);

  if (!spell) {
    return null;
  }

  const transformedSpell = getSpellEntryForCharacter(character, spell);

  if (execute.effectKind === "contact-patron") {
    return createContactPatronSpellEntry(transformedSpell);
  }

  if (execute.effectKind === "shadow-arts-darkness") {
    return createShadowArtsDarknessSpellEntry(transformedSpell);
  }

  if (execute.effectKind === "mantle-of-majesty") {
    return {
      ...transformedSpell,
      castingTime: [ACTION_TYPE.BONUS_ACTION]
    };
  }

  return transformedSpell;
}

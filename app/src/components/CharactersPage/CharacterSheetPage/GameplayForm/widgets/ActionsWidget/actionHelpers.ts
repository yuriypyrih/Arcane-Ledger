import type { Character, AbilityKey } from "../../../../../../types";
import {
  ACTION_TYPE,
  CLASS_FEATURE,
  type SpellEntry,
  type WeaponEntry
} from "../../../../../../codex/entries";
import { getWeaponEntries } from "../../../../../../codex/selectors";
import { appendFeatureSourcedDescriptionAddition } from "../../../../../../pages/CharactersPage/actionModalDescriptions";
import {
  ECONOMY_TYPE,
  type EconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";
import { resolveActionCardTheme } from "../../../../../../pages/CharactersPage/actionCardTheme";
import { getAbilityModifierBreakdownForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import {
  getSavingThrowBonusesForCharacter,
  getSpellEntryForCharacter,
  type FeatureActionCard,
  type FeatureActionExecuteConfig
} from "../../../../../../pages/CharactersPage/classFeatures";
import { getSpellEntryById } from "../../../../../../codex/entries";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import { warriorOfTheOpenHandSubclassId } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { monkStepOfTheWindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining,
  grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../../../../../../pages/CharactersPage/combat";

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
  character: Pick<
    Character,
    "className" | "level" | "subclassId" | "classFeatureState" | "roundTracker"
  >,
  actionKey: string,
  economyType: EconomyType
): boolean {
  return (
    shouldTrackRoundScopedResources(character.roundTracker) &&
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
    shouldTrackRoundScopedResources(character.roundTracker) &&
    getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining(character) > 0 &&
    !isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction")
  );
}

export function createCommonActionDefinition(action: FeatureActionCard): GameplayActionDefinition {
  const preparedAction: FeatureActionCard = {
    ...action,
    cardTheme: resolveActionCardTheme(action)
  };

  return {
    kind: "feature",
    key: preparedAction.key,
    name: preparedAction.name,
    cardTheme: preparedAction.cardTheme,
    economyType: preparedAction.economyType,
    actionCategory: preparedAction.actionCategory,
    economyMultiCount: preparedAction.economyMultiCount,
    disabled: preparedAction.disabled,
    disabledReason: preparedAction.disabledReason,
    action: preparedAction,
    execute: {
      kind: "activate"
    },
    drawer: {
      kind: "confirm",
      eyebrow: "Common Action",
      description: preparedAction.description ?? [],
      descriptionAdditions: preparedAction.descriptionAdditions ?? [],
      helperText: preparedAction.drawer?.helperText,
      helperTextTone: preparedAction.drawer?.helperTextTone,
      blockedReason: preparedAction.drawer?.blockedReason,
      facts: preparedAction.drawer?.facts ?? preparedAction.facts ?? [],
      factsSectionTitle: preparedAction.drawer?.factsSectionTitle,
      headerTags: preparedAction.drawer?.headerTags ?? preparedAction.headerTags ?? [],
      confirmLabel:
        preparedAction.drawer?.confirmLabel ?? getFeatureActionDrawerPrimaryLabel(preparedAction)
    }
  };
}

export function formatD20RollFormula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20${modifier >= 0 ? "+" : ""}${modifier}`;
}

type FeatureSavingThrowBonusContext = Parameters<typeof getSavingThrowBonusesForCharacter>[0] &
  Parameters<typeof getAbilityModifierBreakdownForCharacter>[0];

export function resolveFeatureSavingThrowBonusTotal(
  character: FeatureSavingThrowBonusContext,
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

function createContactPatronSpellEntry(character: Character, spell: SpellEntry): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.CONTACT_PATRON,
    [
      "You mentally contact your patron directly. This casting doesn't expend a spell slot, and you automatically succeed on the DC 15 Intelligence saving throw."
    ],
    "Contact Patron"
  );
}

function createShadowArtsDarknessSpellEntry(character: Character, spell: SpellEntry): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    {
      ...spell,
      components: []
    },
    character,
    CLASS_FEATURE.SHADOW_ARTS,
    [
      "This casting doesn't expend a spell slot or spell components. You can see within the spell's area when you cast it with this feature, and while the spell persists, you can move its area to a space within 60 feet of yourself at the start of each of your turns."
    ],
    "Shadow Arts"
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
    return createContactPatronSpellEntry(character, transformedSpell);
  }

  if (execute.effectKind === "shadow-arts-darkness") {
    return createShadowArtsDarknessSpellEntry(character, transformedSpell);
  }

  if (execute.effectKind === "mantle-of-majesty") {
    return {
      ...transformedSpell,
      castingTime: [ACTION_TYPE.BONUS_ACTION]
    };
  }

  return transformedSpell;
}

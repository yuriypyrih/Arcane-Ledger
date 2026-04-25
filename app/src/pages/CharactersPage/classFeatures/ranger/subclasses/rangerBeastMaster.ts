import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import {
  getBeastMasterCompanion,
  isBeastMasterCharacter,
  reviveBeastMasterCompanion
} from "../../../beastMasterCompanions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const beastMasterSubclassId = "ranger-beast-master";
export const rangerBeastMasterCommandActionKey = "ranger-beast-master-command-primal-companion";
export const rangerBeastMasterReviveActionKey = "ranger-beast-master-revive-primal-companion";

type BeastMasterRuntimeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "companions">>;

const commandDescription = [
  "In combat, your primal beast acts during your turn. It can move and use its Reaction on its own, but it takes the Dodge action unless you command it.",
  "As a Bonus Action, command the beast to take an action in its stat block or some other action. You can also sacrifice one attack from your Attack action to command it to take Beast's Strike.",
  "If you have the Incapacitated condition, the beast acts on its own and is not limited to Dodge."
];

const exceptionalTrainingDescription = [
  "Exceptional Training: when you command the beast with a Bonus Action, it can also use its Bonus Action to Dash, Disengage, Dodge, or Help. Its attacks can deal Force damage instead of their normal damage type."
];

const bestialFuryDescription = [
  "Bestial Fury: when you command Beast's Strike, the beast can use it twice. The first time each turn it hits your Hunter's Mark target, it can add the spell's bonus damage as Force damage."
];

const reviveDescription = [
  "If your primal beast has died within the last hour, you can take a Magic action to touch it and expend a spell slot. The beast returns to life after 1 minute with all its Hit Points restored.",
  "V1 reminder: spend the spell slot manually in Spellcasting after using this action."
];

function getCommandDescription(character: BeastMasterRuntimeCharacter): string[] {
  return [
    ...commandDescription,
    ...((character.level ?? 0) >= 7 ? exceptionalTrainingDescription : []),
    ...((character.level ?? 0) >= 11 ? bestialFuryDescription : [])
  ];
}

function getRangerBeastMasterFeatureActions(
  character: BeastMasterRuntimeCharacter
): FeatureActionCard[] {
  if (!isBeastMasterCharacter(character)) {
    return [];
  }

  const companion = getBeastMasterCompanion(character);
  const hasCompanion = Boolean(companion);
  const isCompanionDead = companion ? companion.currentHitPoints <= 0 : false;

  return [
    {
      key: rangerBeastMasterCommandActionKey,
      name: "Command Primal Companion",
      sourceFeature: CLASS_FEATURE.PRIMAL_COMPANION,
      summary: hasCompanion
        ? "Direct your beast during your turn."
        : "Create a primal companion in Companions.",
      detail:
        "Command your primal companion to act, or use one Attack action attack to trigger Beast's Strike.",
      breakdown: "Command beast",
      description: getCommandDescription(character),
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      consumesEconomyOnActivate: true,
      drawer: {
        kind: "confirm",
        eyebrow: "Beast Master",
        description: getCommandDescription(character),
        helperText: isCompanionDead
          ? "Your primal companion is marked dead. Revive it before commanding it."
          : undefined,
        confirmLabel: "Command Beast"
      },
      execute: {
        kind: "activate",
        label: "Command Beast"
      },
      disabled: !hasCompanion || isCompanionDead,
      disabledReason: !hasCompanion
        ? "Create a Primal Companion in the Companions section first."
        : isCompanionDead
          ? "Your Primal Companion is marked dead."
          : undefined
    },
    ...(isCompanionDead
      ? [
          {
            key: rangerBeastMasterReviveActionKey,
            name: "Revive Primal Companion",
            sourceFeature: CLASS_FEATURE.PRIMAL_COMPANION,
            summary: "Restore your beast after spending a spell slot.",
            detail:
              "Use a Magic action to touch the dead beast, spend a spell slot manually, and restore it after 1 minute.",
            breakdown: "Restore beast",
            description: reviveDescription,
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            drawer: {
              kind: "confirm",
              eyebrow: "Beast Master",
              description: reviveDescription,
              resources: [
                {
                  kind: "text",
                  label: "Spell Slot",
                  value: "Spend manually"
                }
              ],
              confirmLabel: "Mark Revived"
            },
            execute: {
              kind: "activate",
              label: "Mark Revived"
            }
          } satisfies FeatureActionCard
        ]
      : [])
  ];
}

export function activateRangerBeastMasterAction(
  character: Character,
  actionKey: string
): Character {
  if (actionKey === rangerBeastMasterReviveActionKey) {
    return reviveBeastMasterCompanion(character);
  }

  if (actionKey === rangerBeastMasterCommandActionKey && isBeastMasterCharacter(character)) {
    return character;
  }

  return character;
}

export const getRangerBeastMasterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  isBeastMasterCharacter(character)
    ? {
        featureActions: getRangerBeastMasterFeatureActions(character)
      }
    : {};

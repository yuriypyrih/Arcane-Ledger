import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import {
  getBeastMasterCompanion,
  isPrimalBeastCompanion,
  isBeastMasterCharacter,
  reviveBeastMasterCompanion
} from "../../../beastMasterCompanions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const beastMasterSubclassId = "ranger-beast-master";
export const rangerBeastMasterCommandActionKey = "ranger-beast-master-command-primal-companion";
export const rangerBeastMasterReviveActionKey = "ranger-beast-master-revive-primal-companion";

type BeastMasterRuntimeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "companions">>;

const commandDescription = [
  "<strong>The Beast in Combat.</strong> In combat, the beast acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action unless you take a Bonus Action to command it to take an action in its stat block or some other action.",
  "You can also sacrifice one of your attacks when you take the Attack action to command the beast to take the Beast's Strike action.",
  "If you have the <link:Incapacitated>Incapacitated</link> condition, the beast acts on its own and isn't limited to the Dodge action."
];

const exceptionalTrainingDescription = [
  "When you take a Bonus Action to command your Primal Companion beast to take an action, you can also command it to take the Dash, Disengage, Dodge, or Help action using its Bonus Action.",
  "In addition, whenever it hits with an attack roll and deals damage, it can deal your choice of <link:Force>Force</link> damage or its normal damage type."
];

const bestialFuryDescription = [
  "When you command your Primal Companion beast to take the Beast's Strike action, the beast can use it twice.",
  "In addition, the first time each turn it hits a creature under the effect of your <spell:Hunter's Mark>Hunter's Mark</spell> spell, the beast deals extra <link:Force>Force</link> damage equal to the bonus damage of that spell."
];

const shareSpellsDescription = [
  "When you cast a spell targeting yourself, you can also affect your Primal Companion beast with the spell if the beast is within 30 feet of you."
];

const reviveDescription = [
  "<strong>Restoring or Replacing the Beast.</strong> If the beast has died within the last hour, you can take a Magic action to touch it and expend a spell slot. The beast returns to life after 1 minute with all its Hit Points restored."
];

function getCommandDescriptionAdditions(
  character: BeastMasterRuntimeCharacter
): SpellDescriptionEntry[][] {
  return [
    ...((character.level ?? 0) >= 7
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.EXCEPTIONAL_TRAINING,
            exceptionalTrainingDescription,
            "Exceptional Training"
          )
        ]
      : []),
    ...((character.level ?? 0) >= 11
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.BESTIAL_FURY,
            bestialFuryDescription,
            "Bestial Fury"
          )
        ]
      : []),
    ...((character.level ?? 0) >= 15
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.SHARE_SPELLS,
            shareSpellsDescription,
            "Share Spells"
          )
        ]
      : [])
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
  const hasPrimalBeast = Boolean(character.companions?.some(isPrimalBeastCompanion));
  const hasDeadPrimalBeast = Boolean(
    character.companions?.some(
      (currentCompanion) =>
        isPrimalBeastCompanion(currentCompanion) && currentCompanion.currentHitPoints <= 0
    )
  );
  const commandDescriptionAdditions = getCommandDescriptionAdditions(character);

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
      description: commandDescription,
      descriptionAdditions: commandDescriptionAdditions,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      consumesEconomyOnActivate: true,
      drawer: {
        kind: "confirm",
        eyebrow: "Beast Master",
        description: commandDescription,
        descriptionAdditions: commandDescriptionAdditions,
        confirmLabel: "Use Command"
      },
      execute: {
        kind: "activate",
        label: "Use Command"
      },
      disabled: !hasCompanion || isCompanionDead,
      disabledReason: !hasCompanion
        ? "Create a Primal Companion in the Companions section first."
        : isCompanionDead
          ? "Your Primal Companion is marked dead."
          : undefined
    },
    {
      key: rangerBeastMasterReviveActionKey,
      name: "Revive Primal Companion",
      sourceFeature: CLASS_FEATURE.PRIMAL_COMPANION,
      summary: hasDeadPrimalBeast
        ? "Restore your beast after spending a spell slot."
        : "Available when a primal beast is at 0 HP.",
      detail:
        "Use a Magic action to touch the dead beast, expend a spell slot, and restore it after 1 minute.",
      breakdown: "Restore beast",
      description: reviveDescription,
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      drawer: {
        kind: "confirm",
        eyebrow: "Beast Master",
        description: reviveDescription,
        confirmLabel: "Use Revive"
      },
      execute: {
        kind: "activate",
        label: "Use Revive"
      },
      disabled: !hasDeadPrimalBeast,
      disabledReason: !hasPrimalBeast
        ? "Create a Primal Companion in the Companions section first."
        : !hasDeadPrimalBeast
          ? "No Primal Beast is at 0 HP."
          : undefined
    }
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

function createBeastMasterLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource(input)
  };
}

function collectRangerBeastMasterContributions(
  character: BeastMasterRuntimeCharacter
): FeatureContributionSpec[] {
  if (!isBeastMasterCharacter(character)) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "ranger-beast-master-primal-companion",
        label: "Primal Companion",
        entryId: CLASS_FEATURE.PRIMAL_COMPANION
      }),
      actions: getRangerBeastMasterFeatureActions(character)
    }
  ];

  if ((character.level ?? 0) >= 7) {
    contributions.push(
      createBeastMasterLocalHookContribution({
        id: "ranger-beast-master-exceptional-training",
        label: "Exceptional Training",
        entryId: CLASS_FEATURE.EXCEPTIONAL_TRAINING
      })
    );
  }

  if ((character.level ?? 0) >= 11) {
    contributions.push(
      createBeastMasterLocalHookContribution({
        id: "ranger-beast-master-bestial-fury",
        label: "Bestial Fury",
        entryId: CLASS_FEATURE.BESTIAL_FURY
      })
    );
  }

  if ((character.level ?? 0) >= 15) {
    contributions.push(
      createBeastMasterLocalHookContribution({
        id: "ranger-beast-master-share-spells",
        label: "Share Spells",
        entryId: CLASS_FEATURE.SHARE_SPELLS
      })
    );
  }

  return contributions;
}

export const getRangerBeastMasterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectRangerBeastMasterContributions(character)),
    {
      character: character as Character
    }
  );

import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  compileFeatureContributions,
  createClassContributionSource,
  getFeatureDescriptionAdditions,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureDescriptionContribution,
  type FeatureDescriptionContributionTarget,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { ClassFeatureDerivedState, CollectedClassFeatureCharacter } from "../types";
import { getArtificerFlashOfGeniusReactionEntries } from "./flashOfGenius";
import { getArtificerMagicItemTinkerActions } from "./magicItemTinker";
import { getArtificerReplicateMagicItemAction } from "./replicateMagicItem";
import { getSoulOfArtificeCheatDeathDescription } from "./soulOfArtifice";
import { getArtificerTinkersMagicAction } from "./tinkersMagic";

export const artificerSoulOfArtificeLifeAndDeathLedgerDescriptionTargetKey =
  "artificer-soul-of-artifice-life-and-death-ledger";

const mendingSpellId = "spell-mending";
const tinkersMagicSource = "Tinker's Magic";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

function compactDescriptionAdditions(
  additions: Array<FeatureDescriptionContribution | null>
): FeatureDescriptionContribution[] {
  return additions.filter(
    (addition): addition is FeatureDescriptionContribution => addition !== null
  );
}

function createSourcedFeatureDescriptionAddition(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  feature: CLASS_FEATURE,
  entries: SpellDescriptionEntry[],
  sourceLabel?: string
): SpellDescriptionEntry[][] {
  return entries.length > 0
    ? [createFeatureSourcedDescriptionEntries(character, feature, entries, sourceLabel)]
    : [];
}

function createArtificerTinkersMagicContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "artificer-tinkers-magic",
      label: tinkersMagicSource,
      entryId: CLASS_FEATURE.TINKERS_MAGIC
    }),
    actions: compactActions([getArtificerTinkersMagicAction(character)]),
    alwaysPreparedSpellIds: [mendingSpellId],
    alwaysPreparedSpellSources: {
      [mendingSpellId]: [tinkersMagicSource]
    }
  };
}

function createArtificerReplicateMagicItemContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "artificer-replicate-magic-item",
      label: "Replicate Magic Item",
      entryId: CLASS_FEATURE.REPLICATE_MAGIC_ITEM
    }),
    actions: compactActions([getArtificerReplicateMagicItemAction(character)])
  };
}

function createArtificerMagicItemTinkerContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "artificer-magic-item-tinker",
      label: "Magic Item Tinker",
      entryId: CLASS_FEATURE.MAGIC_ITEM_TINKER
    }),
    actions: getArtificerMagicItemTinkerActions(character)
  };
}

function createArtificerFlashOfGeniusContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "artificer-flash-of-genius",
      label: "Flash of Genius",
      entryId: CLASS_FEATURE.FLASH_OF_GENIUS
    }),
    reactions: getArtificerFlashOfGeniusReactionEntries(character)
  };
}

function createArtificerInventoryAttunementContribution(
  character: CollectedClassFeatureCharacter,
  input: {
    id: string;
    label: string;
    entryId: CLASS_FEATURE;
    minimumLevel: number;
    limit: number;
  }
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: input.id,
      label: input.label,
      entryId: input.entryId
    }),
    inventoryAttunementLimits:
      character.level >= input.minimumLevel
        ? [
            {
              id: `${input.id}-inventory-attunement-limit`,
              getLimit: () => input.limit
            }
          ]
        : []
  };
}

function createArtificerSoulOfArtificeContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const cheatDeathDescription = getSoulOfArtificeCheatDeathDescription(character);

  return {
    source: createClassContributionSource({
      id: "artificer-soul-of-artifice",
      label: "Soul of Artifice",
      entryId: CLASS_FEATURE.SOUL_OF_ARTIFICE
    }),
    descriptionAdditions: compactDescriptionAdditions([
      cheatDeathDescription.length > 0
        ? {
            id: "artificer-soul-of-artifice-life-and-death-description",
            target: "custom",
            targetKey: artificerSoulOfArtificeLifeAndDeathLedgerDescriptionTargetKey,
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.SOUL_OF_ARTIFICE,
                cheatDeathDescription
              )
          }
        : null
    ])
  };
}

export function collectArtificerFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  return [
    createArtificerTinkersMagicContribution(character),
    createArtificerReplicateMagicItemContribution(character),
    createArtificerMagicItemTinkerContribution(character),
    createArtificerFlashOfGeniusContribution(character),
    createArtificerInventoryAttunementContribution(character, {
      id: "artificer-magic-item-adept",
      label: "Magic Item Adept",
      entryId: CLASS_FEATURE.MAGIC_ITEM_ADEPT,
      minimumLevel: 10,
      limit: 4
    }),
    createArtificerInventoryAttunementContribution(character, {
      id: "artificer-advanced-artifice",
      label: "Advanced Artifice",
      entryId: CLASS_FEATURE.ADVANCED_ARTIFICE,
      minimumLevel: 14,
      limit: 5
    }),
    createArtificerInventoryAttunementContribution(character, {
      id: "artificer-magic-item-master",
      label: "Magic Item Master",
      entryId: CLASS_FEATURE.MAGIC_ITEM_MASTER,
      minimumLevel: 18,
      limit: 6
    }),
    createArtificerSoulOfArtificeContribution(character)
  ];
}

export function getArtificerClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectArtificerFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}

export function getArtificerFeatureDescriptionAdditions(
  character: CollectedClassFeatureCharacter,
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(
    compileFeatureContributions(collectArtificerFeatureContributions(character)),
    target,
    {
      character: character as Character,
      targetKey
    }
  );
}

import { CLASS_FEATURE } from "../../../../../codex/entries";
import { preserveLifeDescription } from "../../../../../codex/subclasses/cleric";
import type { Character } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal
} from "../clericChannelDivinity";

export const lifeDomainSubclassId = "cleric-life-domain";
export const preserveLifeActionKey = "cleric-preserve-life";

const lifeDomainSpellIdsByLevel = {
  3: ["spell-aid", "spell-bless", "spell-cure-wounds", "spell-lesser-restoration"],
  5: ["spell-mass-healing-word", "spell-revivify"],
  7: ["spell-aura-of-life", "spell-death-ward"],
  9: ["spell-greater-restoration", "spell-mass-cure-wounds"]
} as const;

export function hasClericLifeDomainFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Cleric" &&
    character.subclassId === lifeDomainSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function getClericLifeDomainFeatureActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): FeatureActionCard[] {
  if (!hasClericLifeDomainFeature(character, 3)) {
    return [];
  }

  const totalUses = getClericChannelDivinityUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const usesRemaining = getClericChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  });
  return [
    {
      key: preserveLifeActionKey,
      name: "Preserve Life",
      summary: "Restore divided healing.",
      detail:
        "Restore a pool of healing equal to five times your Cleric level among Bloodied creatures.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining,
      usesTotal: totalUses,
      description: [...preserveLifeDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Life Domain",
        description: [...preserveLifeDescription]
      },
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
    }
  ];
}

export function activateClericPreserveLife(character: Character): Character {
  return hasClericLifeDomainFeature(character, 3)
    ? expendClericChannelDivinityUse(character)
    : character;
}

export function collectClericLifeDomainContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasClericLifeDomainFeature(character, 3)) {
    return [];
  }

  return [
    {
      source: createSubclassContributionSource({
        id: `${lifeDomainSubclassId}-domain-spells`,
        label: "Life Domain Spells",
        entryId: CLASS_FEATURE.LIFE_DOMAIN_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        lifeDomainSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${lifeDomainSubclassId}-disciple-of-life`,
        label: "Disciple of Life",
        entryId: CLASS_FEATURE.DISCIPLE_OF_LIFE
      })
    },
    {
      source: createSubclassContributionSource({
        id: `${lifeDomainSubclassId}-preserve-life`,
        label: "Preserve Life",
        entryId: CLASS_FEATURE.PRESERVE_LIFE
      }),
      actions: getClericLifeDomainFeatureActions(character)
    },
    ...(hasClericLifeDomainFeature(character, 6)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${lifeDomainSubclassId}-blessed-healer`,
              label: "Blessed Healer",
              entryId: CLASS_FEATURE.BLESSED_HEALER
            })
          }
        ]
      : []),
    ...(hasClericLifeDomainFeature(character, 17)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${lifeDomainSubclassId}-supreme-healing`,
              label: "Supreme Healing",
              entryId: CLASS_FEATURE.SUPREME_HEALING
            })
          }
        ]
      : [])
  ];
}

export const getClericLifeDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectClericLifeDomainContributions(character)),
    {
      character: character as Character
    }
  );

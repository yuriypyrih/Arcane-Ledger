import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import {
  blessingOfTheTricksterDescription,
  improvedDuplicityDescription,
  invokeDuplicityDescription,
  trickstersTranspositionDescription
} from "../../../../../codex/subclasses/cleric";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import {
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  clericChannelDivinityActionKey,
  clericChannelDivinityOptionKeys
} from "../../channelDivinity";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard, FeatureIndicator, SkillIndicatorMap } from "../../types";
import {
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal
} from "../clericChannelDivinity";
import {
  blessingOfTheTricksterActionKey,
  blessingOfTheTricksterName,
  blessingOfTheTricksterStatusSourceId,
  invokeDuplicityActionKey,
  invokeDuplicityDurationRounds,
  invokeDuplicityName,
  invokeDuplicityStatusSourceId
} from "./clericTrickeryDomainShared";

export const trickeryDomainSubclassId = "cleric-trickery-domain";
export { blessingOfTheTricksterActionKey, invokeDuplicityActionKey };
const blessingOfTheTricksterAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: blessingOfTheTricksterName
};
const trickstersTranspositionSource = "Trickster's Transposition";
const improvedDuplicitySource = "Improved Duplicity";

const trickeryDomainSpellIdsByLevel = {
  3: [
    "spell-charm-person",
    "spell-disguise-self",
    "spell-invisibility",
    "spell-pass-without-trace"
  ],
  5: ["spell-hypnotic-pattern", "spell-nondetection"],
  7: ["spell-confusion", "spell-dimension-door"],
  9: ["spell-dominate-person", "spell-modify-memory"]
} as const;

function getClericTrickeryDomainStatusEntries(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return Array.isArray(statusEntries) ? [...statusEntries] : [];
}

function createClericTrickeryDomainStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createBlessingOfTheTricksterStatusEntry(): CharacterStatusEntry {
  return {
    id: createClericTrickeryDomainStatusEntryId(),
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: blessingOfTheTricksterName,
    source: blessingOfTheTricksterName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: {
      kind: STATUS_DURATION_KIND.LONG_REST
    },
    sourceId: blessingOfTheTricksterStatusSourceId,
    rangeFeet: null
  };
}

function createInvokeDuplicityStatusEntry(): CharacterStatusEntry {
  return {
    id: createClericTrickeryDomainStatusEntryId(),
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: invokeDuplicityName,
    source: invokeDuplicityName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: invokeDuplicityDurationRounds,
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
    },
    sourceId: invokeDuplicityStatusSourceId,
    rangeFeet: null
  };
}

function clearBlessingOfTheTricksterStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return getClericTrickeryDomainStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== blessingOfTheTricksterStatusSourceId
  );
}

function clearInvokeDuplicityStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return getClericTrickeryDomainStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== invokeDuplicityStatusSourceId
  );
}

function getBlessingOfTheTricksterSkillIndicators(): SkillIndicatorMap {
  return {
    [SKILL.STEALTH]: [blessingOfTheTricksterAdvantageIndicator]
  };
}

export function getClericInvokeDuplicityDescriptionAdditions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return [];
  }

  const invokeDuplicityDescriptionCarrier = {
    description: [...invokeDuplicityDescription],
    descriptionAdditions: [] as SpellDescriptionEntry[][]
  };
  const withTrickstersTransposition = hasClericTrickeryDomainFeature(character, 6)
    ? appendFeatureSourcedDescriptionAddition(
        invokeDuplicityDescriptionCarrier,
        character,
        CLASS_FEATURE.TRICKSTERS_TRANSPOSITION,
        trickstersTranspositionDescription,
        trickstersTranspositionSource
      )
    : invokeDuplicityDescriptionCarrier;
  const withImprovedDuplicity = hasClericTrickeryDomainFeature(character, 17)
    ? appendFeatureSourcedDescriptionAddition(
        withTrickstersTransposition,
        character,
        CLASS_FEATURE.IMPROVED_DUPLICITY,
        improvedDuplicityDescription,
        improvedDuplicitySource
      )
    : withTrickstersTransposition;

  return withImprovedDuplicity.descriptionAdditions ?? [];
}

export function hasClericTrickeryDomainFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Cleric" &&
    character.subclassId === trickeryDomainSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function hasActiveClericBlessingOfTheTrickster(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return false;
  }

  return getClericTrickeryDomainStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === blessingOfTheTricksterStatusSourceId
  );
}

export function activateClericBlessingOfTheTrickster(
  character: Character,
  target: "self" | "other"
): Character {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return character;
  }

  const clearedStatusEntries = clearBlessingOfTheTricksterStatuses(character.statusEntries);

  return {
    ...character,
    statusEntries:
      target === "self"
        ? [...clearedStatusEntries, createBlessingOfTheTricksterStatusEntry()]
        : clearedStatusEntries
  };
}

export function activateClericInvokeDuplicity(character: Character): Character {
  if (
    !hasClericTrickeryDomainFeature(character, 3) ||
    getClericChannelDivinityUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const characterWithChannelDivinitySpent = expendClericChannelDivinityUse(character);

  if (characterWithChannelDivinitySpent === character) {
    return character;
  }

  return {
    ...characterWithChannelDivinitySpent,
    statusEntries: [
      ...clearInvokeDuplicityStatuses(characterWithChannelDivinitySpent.statusEntries),
      createInvokeDuplicityStatusEntry()
    ]
  };
}

function getClericBlessingOfTheTricksterAction(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): FeatureActionCard | null {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return null;
  }

  return {
    key: blessingOfTheTricksterActionKey,
    name: blessingOfTheTricksterName,
    sourceFeature: CLASS_FEATURE.BLESSING_OF_THE_TRICKSTER,
    summary: "Grant Advantage on Stealth checks.",
    detail: "Choose yourself or another willing creature within 30 feet to receive the blessing.",
    breakdown: "Stealth advantage.",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description: [...blessingOfTheTricksterDescription],
    drawer: {
      kind: "custom-form",
      eyebrow: "Trickery Domain",
      description: [...blessingOfTheTricksterDescription]
    },
    execute: {
      kind: "custom-form",
      formKind: "blessing-of-the-trickster"
    }
  };
}

function getClericInvokeDuplicityAction(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "statusEntries" | "subclassId">>
): FeatureActionCard | null {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return null;
  }

  const usesTotal = getClericChannelDivinityUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const usesRemaining = getClericChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  });
  const descriptionAdditions = getClericInvokeDuplicityDescriptionAdditions(character);

  return {
    key: invokeDuplicityActionKey,
    name: invokeDuplicityName,
    sourceFeature: CLASS_FEATURE.INVOKE_DUPLICITY,
    summary: "Create an illusory duplicate of yourself.",
    detail: "Spend 1 Channel Divinity to create an Invoke Duplicity trait for 10 turns.",
    breakdown: "Illusory duplicate.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    hideUsesTrackerOnCard: true,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "pyromancy",
    usesRemaining,
    usesTotal,
    description: [...invokeDuplicityDescription],
    descriptionAdditions,
    drawer: {
      kind: "confirm",
      eyebrow: "Trickery Domain",
      description: [...invokeDuplicityDescription],
      descriptionAdditions
    },
    execute: {
      kind: "activate"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
  };
}

function getClericTrickeryDomainActionsByKey(
  actions: readonly FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

export function collectClericTrickeryDomainContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return [];
  }

  const blessingOfTheTricksterAction = getClericBlessingOfTheTricksterAction(character);
  const invokeDuplicityAction = getClericInvokeDuplicityAction(character);
  const featureActions = [blessingOfTheTricksterAction, invokeDuplicityAction].filter(
    (action): action is FeatureActionCard => action !== null
  );
  const blessingOfTheTricksterActive = hasActiveClericBlessingOfTheTrickster(character);

  return [
    {
      source: createSubclassContributionSource({
        id: `${trickeryDomainSubclassId}-domain-spells`,
        label: "Trickery Domain Spells",
        entryId: CLASS_FEATURE.TRICKERY_DOMAIN_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        trickeryDomainSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${trickeryDomainSubclassId}-blessing-of-the-trickster`,
        label: "Blessing of the Trickster",
        entryId: CLASS_FEATURE.BLESSING_OF_THE_TRICKSTER
      }),
      actions: getClericTrickeryDomainActionsByKey(
        featureActions,
        blessingOfTheTricksterActionKey
      ),
      skillIndicators: blessingOfTheTricksterActive ? getBlessingOfTheTricksterSkillIndicators() : {}
    },
    {
      source: createSubclassContributionSource({
        id: `${trickeryDomainSubclassId}-invoke-duplicity`,
        label: "Invoke Duplicity",
        entryId: CLASS_FEATURE.INVOKE_DUPLICITY
      }),
      actionOptions: {
        [clericChannelDivinityActionKey]: getClericTrickeryDomainActionsByKey(
          featureActions,
          invokeDuplicityActionKey
        ).map((action) => ({
          ...action,
          key: clericChannelDivinityOptionKeys.invokeDuplicity
        }))
      }
    },
    ...(hasClericTrickeryDomainFeature(character, 6)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${trickeryDomainSubclassId}-tricksters-transposition`,
              label: "Trickster's Transposition",
              entryId: CLASS_FEATURE.TRICKSTERS_TRANSPOSITION
            })
          }
        ]
      : []),
    ...(hasClericTrickeryDomainFeature(character, 17)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${trickeryDomainSubclassId}-improved-duplicity`,
              label: "Improved Duplicity",
              entryId: CLASS_FEATURE.IMPROVED_DUPLICITY
            })
          }
        ]
      : [])
  ];
}

export const getClericTrickeryDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectClericTrickeryDomainContributions(character)),
    {
      character: character as Character
    }
  );

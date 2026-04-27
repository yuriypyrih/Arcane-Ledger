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
    resources: [
      {
        kind: "tracker",
        label: "Uses",
        current: usesRemaining,
        total: usesTotal,
        icon: "pyromancy",
        cost: 1
      }
    ],
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

export const getClericTrickeryDomainDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasClericTrickeryDomainFeature(character, 3)) {
    return {};
  }

  const blessingOfTheTricksterAction = getClericBlessingOfTheTricksterAction(character);
  const invokeDuplicityAction = getClericInvokeDuplicityAction(character);
  const blessingOfTheTricksterActive = hasActiveClericBlessingOfTheTrickster(character);

  return {
    featureActions: [blessingOfTheTricksterAction, invokeDuplicityAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    skillIndicators: blessingOfTheTricksterActive ? getBlessingOfTheTricksterSkillIndicators() : {},
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      trickeryDomainSpellIdsByLevel
    )
  };
};

import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type {
  Character,
  RangerHunterDefensiveTacticsChoice,
  RangerHunterPreyChoice
} from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendDescriptionAddition,
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries,
  descriptionValueSomeText
} from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";

export const hunterSubclassId = "ranger-hunter";
export const rangerHunterEscapeTheHordeStatusSourceId =
  "feature-ranger-hunter-escape-the-horde";
export const rangerHunterMultiattackDefenseStatusSourceId =
  "feature-ranger-hunter-multiattack-defense";
export const superiorHuntersDefenseReactionId = "reaction-ranger-superior-hunters-defense";
export const rangerHunterSuperiorHuntersDefenseStatusSourceId =
  "feature-ranger-hunter-superior-hunters-defense";
export const rangerHunterSuperiorHuntersDefenseDamageTypeOptions = [
  DAMAGE_TYPE.PIERCING,
  DAMAGE_TYPE.BLUDGEONING,
  DAMAGE_TYPE.SLASHING,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.THUNDER,
  DAMAGE_TYPE.POISON,
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.NECROTIC,
  DAMAGE_TYPE.RADIANT,
  DAMAGE_TYPE.FORCE,
  DAMAGE_TYPE.PSYCHIC
] as const satisfies readonly DAMAGE_TYPE[];

const favoredEnemyActionKey = "ranger-favored-enemy";
const huntersMarkSpellId = "spell-hunters-mark";
const huntersLoreSource = "Hunter's Lore";
const superiorHuntersPreySource = "Superior Hunter's Prey";
const hunterSubclassEntry = getSubclassEntryById(hunterSubclassId);
const rangerHunterPreyChoices = ["colossus-slayer", "horde-breaker"] as const;
const rangerHunterDefensiveTacticsChoices = ["escape-the-horde", "multiattack-defense"] as const;
const escapeTheHordeName = "Escape the Horde";
const multiattackDefenseName = "Multiattack Defense";
const superiorHuntersDefenseName = "Superior Hunter's Defense";

type RangerHunterCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>;

function getRangerHunterFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = hunterSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

const huntersPreyDescription = getRangerHunterFeatureDescriptionEntries(CLASS_FEATURE.HUNTERS_PREY);
const colossusSlayerDescription = extractFeatureDescriptionSection(
  huntersPreyDescription,
  "<strong>Colossus Slayer.</strong>"
);
const hordeBreakerDescription = extractFeatureDescriptionSection(
  huntersPreyDescription,
  "<strong>Horde Breaker.</strong>"
);
const huntersLoreDescription = getRangerHunterFeatureDescriptionEntries(CLASS_FEATURE.HUNTERS_LORE);
const superiorHuntersPreyDescription = getRangerHunterFeatureDescriptionEntries(
  CLASS_FEATURE.SUPERIOR_HUNTERS_PREY
);
const superiorHuntersDefenseDescription = getRangerHunterFeatureDescriptionEntries(
  CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE
);
const superiorHuntersDefenseReactionEntry: ReactionEntry = {
  id: superiorHuntersDefenseReactionId,
  reaction: REACTION.SUPERIOR_HUNTERS_DEFENSE,
  name: superiorHuntersDefenseName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE,
  sourceLabel: "Hunter",
  description: [...superiorHuntersDefenseDescription]
};

function isRangerHunter(character: RangerHunterCharacter): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === hunterSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRangerHunterHuntersPreyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerHunter(character);
}

function hasRangerHunterHuntersLoreFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerHunter(character);
}

export function hasRangerHunterDefensiveTacticsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === hunterSubclassId &&
    (character.level ?? 0) >= 7
  );
}

function hasRangerHunterSuperiorHuntersPreyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === hunterSubclassId &&
    (character.level ?? 0) >= 11
  );
}

export function hasRangerHunterSuperiorHuntersDefenseFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === hunterSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function normalizeRangerHunterPreyChoice(
  value: unknown
): RangerHunterPreyChoice | undefined {
  return rangerHunterPreyChoices.some((choice) => choice === value)
    ? (value as RangerHunterPreyChoice)
    : undefined;
}

export function normalizeRangerHunterDefensiveTacticsChoice(
  value: unknown
): RangerHunterDefensiveTacticsChoice | undefined {
  return rangerHunterDefensiveTacticsChoices.some((choice) => choice === value)
    ? (value as RangerHunterDefensiveTacticsChoice)
    : undefined;
}

export function normalizeRangerHunterSuperiorHuntersDefenseDamageType(
  value: unknown
): DAMAGE_TYPE | undefined {
  return typeof value === "string" &&
    rangerHunterSuperiorHuntersDefenseDamageTypeOptions.some((option) => option === value)
    ? (value as DAMAGE_TYPE)
    : undefined;
}

export function getRangerHunterPreyChoice(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerHunterPreyChoice | null {
  if (!hasRangerHunterHuntersPreyFeature(character)) {
    return null;
  }

  return normalizeRangerHunterPreyChoice(character.classFeatureState?.ranger?.huntersPreyChoice) ?? null;
}

export function setRangerHunterPreyChoice(
  character: Character,
  choice: RangerHunterPreyChoice | null
): Character {
  if (!hasRangerHunterHuntersPreyFeature(character)) {
    return character;
  }

  const normalizedChoice = choice === null ? undefined : normalizeRangerHunterPreyChoice(choice);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        huntersPreyChoice: normalizedChoice
      }
    }
  };
}

export function getRangerHunterDefensiveTacticsChoice(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerHunterDefensiveTacticsChoice | null {
  if (!hasRangerHunterDefensiveTacticsFeature(character)) {
    return null;
  }

  return (
    normalizeRangerHunterDefensiveTacticsChoice(
      character.classFeatureState?.ranger?.defensiveTacticsChoice
    ) ?? null
  );
}

export function setRangerHunterDefensiveTacticsChoice(
  character: Character,
  choice: RangerHunterDefensiveTacticsChoice | null
): Character {
  if (!hasRangerHunterDefensiveTacticsFeature(character)) {
    return character;
  }

  const normalizedChoice =
    choice === null ? undefined : normalizeRangerHunterDefensiveTacticsChoice(choice);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        defensiveTacticsChoice: normalizedChoice
      }
    }
  };
}

export function getRangerHunterSuperiorHuntersDefenseDamageTypeSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): DAMAGE_TYPE | null {
  if (!hasRangerHunterSuperiorHuntersDefenseFeature(character)) {
    return null;
  }

  return (
    normalizeRangerHunterSuperiorHuntersDefenseDamageType(
      character.classFeatureState?.ranger?.superiorHuntersDefenseDamageType
    ) ?? null
  );
}

export function setRangerHunterSuperiorHuntersDefenseDamageTypeSelection(
  character: Character,
  selection: DAMAGE_TYPE | null
): Character {
  if (!hasRangerHunterSuperiorHuntersDefenseFeature(character)) {
    return character;
  }

  const normalizedSelection =
    selection === null ? undefined : normalizeRangerHunterSuperiorHuntersDefenseDamageType(selection);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        superiorHuntersDefenseDamageType: normalizedSelection
      }
    }
  };
}

export function activateRangerHunterSuperiorHuntersDefense(character: Character): Character {
  if (!hasRangerHunterSuperiorHuntersDefenseFeature(character)) {
    return character;
  }

  const selectedDamageType = getRangerHunterSuperiorHuntersDefenseDamageTypeSelection(character);

  if (selectedDamageType === null) {
    return character;
  }

  return {
    ...character,
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => entry.sourceId !== rangerHunterSuperiorHuntersDefenseStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: selectedDamageType,
        source: superiorHuntersDefenseName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: rangerHunterSuperiorHuntersDefenseStatusSourceId
      })
    ]
  };
}

function getSelectedHuntersPreyDescription(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): string[] {
  const choice = getRangerHunterPreyChoice(character);

  if (choice === "colossus-slayer") {
    return colossusSlayerDescription;
  }

  if (choice === "horde-breaker") {
    return hordeBreakerDescription;
  }

  return [];
}

function appendHuntersPreyDescription(
  character: RangerHunterCharacter,
  action: WeaponAction
): WeaponAction {
  if (action.attackKind !== "weapon") {
    return action;
  }

  const selectedDescription = getSelectedHuntersPreyDescription(character);

  if (selectedDescription.length <= 0) {
    return action;
  }

  return appendDescriptionAddition(action, selectedDescription);
}

function appendHuntersLoreToFeatureAction(action: FeatureActionCard): FeatureActionCard {
  if (
    action.key !== favoredEnemyActionKey ||
    (huntersLoreDescription.length <= 0 && superiorHuntersPreyDescription.length <= 0)
  ) {
    return action;
  }

  let nextAction =
    action.description?.length && action.description.length > 0
      ? action
      : {
          ...action,
          description: createDefaultFeatureActionDescription(action)
        };

  if (huntersLoreDescription.length > 0) {
    nextAction = appendSourcedDescriptionAddition(nextAction, huntersLoreSource, huntersLoreDescription);
  }

  return superiorHuntersPreyDescription.length > 0
    ? appendSourcedDescriptionAddition(
        nextAction,
        superiorHuntersPreySource,
        superiorHuntersPreyDescription
      )
    : nextAction;
}

function appendHunterSpellDescription(spell: SpellEntry): SpellEntry {
  if (
    spell.id !== huntersMarkSpellId ||
    (huntersLoreDescription.length <= 0 && superiorHuntersPreyDescription.length <= 0)
  ) {
    return spell;
  }

  let nextSpell = spell;

  if (huntersLoreDescription.length > 0) {
    const marker = `<strong>${huntersLoreSource}.</strong>`;

    if (
      !descriptionValueSomeText({ description: nextSpell.description }, (entry) =>
        entry.includes(marker)
      )
    ) {
      nextSpell = {
        ...nextSpell,
        description: [
          ...nextSpell.description,
          ...createSourcedDescriptionEntries(huntersLoreSource, huntersLoreDescription)
        ]
      };
    }
  }

  if (superiorHuntersPreyDescription.length <= 0) {
    return nextSpell;
  }

  const superiorMarker = `<strong>${superiorHuntersPreySource}.</strong>`;

  if (
    descriptionValueSomeText({ description: nextSpell.description }, (entry) =>
      entry.includes(superiorMarker)
    )
  ) {
    return nextSpell;
  }

  return {
    ...nextSpell,
    description: [
      ...nextSpell.description,
      ...createSourcedDescriptionEntries(superiorHuntersPreySource, superiorHuntersPreyDescription)
    ]
  };
}

function getRangerHunterDefensiveTacticsDerivedStatusEntries(
  character: RangerHunterCharacter
): DerivedFeatureStatusEntry[] {
  const choice = getRangerHunterDefensiveTacticsChoice(character);

  if (choice === "escape-the-horde") {
    return [
      {
        id: rangerHunterEscapeTheHordeStatusSourceId,
        sourceId: rangerHunterEscapeTheHordeStatusSourceId,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: escapeTheHordeName,
        source: escapeTheHordeName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      }
    ];
  }

  if (choice === "multiattack-defense") {
    return [
      {
        id: rangerHunterMultiattackDefenseStatusSourceId,
        sourceId: rangerHunterMultiattackDefenseStatusSourceId,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: multiattackDefenseName,
        source: multiattackDefenseName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      }
    ];
  }

  return [];
}

function getRangerHunterReactionEntries(character: RangerHunterCharacter): ReactionEntry[] {
  return hasRangerHunterSuperiorHuntersDefenseFeature(character)
    ? [superiorHuntersDefenseReactionEntry]
    : [];
}

export const getRangerHunterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Ranger" && character.subclassId === hunterSubclassId
    ? {
        derivedStatusEntries: getRangerHunterDefensiveTacticsDerivedStatusEntries(character),
        reactionEntries: getRangerHunterReactionEntries(character),
        transformFeatureAction:
          hasRangerHunterHuntersLoreFeature(character) ||
          hasRangerHunterSuperiorHuntersPreyFeature(character)
          ? appendHuntersLoreToFeatureAction
          : undefined,
        transformWeaponAction: hasRangerHunterHuntersPreyFeature(character)
          ? (action) => appendHuntersPreyDescription(character, action)
          : undefined,
        transformSpellEntry:
          hasRangerHunterHuntersLoreFeature(character) ||
          hasRangerHunterSuperiorHuntersPreyFeature(character)
          ? appendHunterSpellDescription
          : undefined
      }
    : {};

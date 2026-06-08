import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry,
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
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureDamageBonus } from "../../types";

export const hunterSubclassId = "ranger-hunter";
export const rangerHunterEscapeTheHordeStatusSourceId = "feature-ranger-hunter-escape-the-horde";
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
const colossusSlayerLabel = "Colossus Slayer";
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

  return (
    normalizeRangerHunterPreyChoice(character.classFeatureState?.ranger?.huntersPreyChoice) ?? null
  );
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
    selection === null
      ? undefined
      : normalizeRangerHunterSuperiorHuntersDefenseDamageType(selection);

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

function isWeaponOrUnarmedAction(action: Pick<WeaponAction, "attackKind">): boolean {
  return action.attackKind === "weapon" || action.attackKind === "unarmed";
}

function getSelectedHordeBreakerActionKey(character: RangerHunterCharacter): string | null {
  if (getRangerHunterPreyChoice(character) !== "horde-breaker") {
    return null;
  }

  const actionKey = character.classFeatureState?.ranger?.hunterHordeBreakerActionKey;

  return typeof actionKey === "string" && actionKey.trim().length > 0 ? actionKey : null;
}

function appendHuntersPreyDescription(
  character: RangerHunterCharacter,
  action: WeaponAction
): WeaponAction {
  if (!isWeaponOrUnarmedAction(action)) {
    return action;
  }

  const selectedDescription = getSelectedHuntersPreyDescription(character);
  const superiorHuntersPreyDescriptionEntries = hasRangerHunterSuperiorHuntersPreyFeature(character)
    ? superiorHuntersPreyDescription
    : [];

  if (selectedDescription.length <= 0 && superiorHuntersPreyDescriptionEntries.length <= 0) {
    return action;
  }

  let nextAction = action;

  if (selectedDescription.length > 0) {
    nextAction = appendDescriptionAddition(nextAction, selectedDescription);
  }

  if (superiorHuntersPreyDescriptionEntries.length > 0) {
    nextAction = appendFeatureSourcedDescriptionAddition(
      nextAction,
      character,
      CLASS_FEATURE.SUPERIOR_HUNTERS_PREY,
      superiorHuntersPreyDescriptionEntries,
      superiorHuntersPreySource
    );
  }

  return nextAction;
}

function applySelectedHordeBreakerWeaponAction(
  character: RangerHunterCharacter,
  action: WeaponAction
): WeaponAction {
  if (
    !isWeaponOrUnarmedAction(action) ||
    character.classFeatureState?.ranger?.hunterHordeBreakerUsedThisTurn === true ||
    getSelectedHordeBreakerActionKey(character) !== action.key
  ) {
    return action;
  }

  return applyRangerHunterHordeBreakerWeaponAction(action);
}

function appendHuntersLoreToFeatureAction(
  character: RangerHunterCharacter,
  action: FeatureActionCard
): FeatureActionCard {
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
    nextAction = appendFeatureSourcedDescriptionAddition(
      nextAction,
      character,
      CLASS_FEATURE.HUNTERS_LORE,
      huntersLoreDescription,
      huntersLoreSource
    );
  }

  return superiorHuntersPreyDescription.length > 0
    ? appendFeatureSourcedDescriptionAddition(
        nextAction,
        character,
        CLASS_FEATURE.SUPERIOR_HUNTERS_PREY,
        superiorHuntersPreyDescription,
        superiorHuntersPreySource
      )
    : nextAction;
}

function appendHunterSpellDescription(
  character: RangerHunterCharacter,
  spell: SpellEntry
): SpellEntry {
  if (
    spell.id !== huntersMarkSpellId ||
    (huntersLoreDescription.length <= 0 && superiorHuntersPreyDescription.length <= 0)
  ) {
    return spell;
  }

  let nextSpell = spell;

  if (hasRangerHunterHuntersLoreFeature(character) && huntersLoreDescription.length > 0) {
    nextSpell = appendFeatureSourcedDescriptionAddition(
      nextSpell,
      character,
      CLASS_FEATURE.HUNTERS_LORE,
      huntersLoreDescription,
      huntersLoreSource
    );
  }

  if (
    !hasRangerHunterSuperiorHuntersPreyFeature(character) ||
    superiorHuntersPreyDescription.length <= 0
  ) {
    return nextSpell;
  }

  return appendFeatureSourcedDescriptionAddition(
    nextSpell,
    character,
    CLASS_FEATURE.SUPERIOR_HUNTERS_PREY,
    superiorHuntersPreyDescription,
    superiorHuntersPreySource
  );
}

export function getRangerHunterHuntersMarkDescriptionAdditions(
  character: RangerHunterCharacter
): SpellDescriptionEntry[][] {
  const additions: SpellDescriptionEntry[][] = [];

  if (hasRangerHunterHuntersLoreFeature(character) && huntersLoreDescription.length > 0) {
    additions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.HUNTERS_LORE,
        huntersLoreDescription,
        huntersLoreSource
      )
    );
  }

  if (
    hasRangerHunterSuperiorHuntersPreyFeature(character) &&
    superiorHuntersPreyDescription.length > 0
  ) {
    additions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.SUPERIOR_HUNTERS_PREY,
        superiorHuntersPreyDescription,
        superiorHuntersPreySource
      )
    );
  }

  return additions;
}

export type RangerHunterColossusSlayerOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason?: string;
};

export type RangerHunterHordeBreakerOptionState = {
  disabled: boolean;
  disabledReason?: string;
};

function createColossusSlayerDamageBonus(): FeatureDamageBonus {
  return {
    label: colossusSlayerLabel,
    formula: "1d8",
    displayLabel: "1d8"
  };
}

export function getRangerHunterColossusSlayerOptionState(
  character: RangerHunterCharacter,
  action: WeaponAction | null
): RangerHunterColossusSlayerOptionState | null {
  if (
    !action ||
    !isWeaponOrUnarmedAction(action) ||
    getRangerHunterPreyChoice(character) !== "colossus-slayer"
  ) {
    return null;
  }

  const usedThisTurn =
    character.classFeatureState?.ranger?.hunterColossusSlayerUsedThisTurn === true;

  return {
    damageBonus: createColossusSlayerDamageBonus(),
    disabled: usedThisTurn,
    disabledReason: usedThisTurn ? "Colossus Slayer has already been used this turn." : undefined
  };
}

export function getRangerHunterHordeBreakerOptionState(
  character: RangerHunterCharacter,
  action: WeaponAction | null
): RangerHunterHordeBreakerOptionState | null {
  if (
    !action ||
    !isWeaponOrUnarmedAction(action) ||
    getRangerHunterPreyChoice(character) !== "horde-breaker"
  ) {
    return null;
  }

  const usedThisTurn = character.classFeatureState?.ranger?.hunterHordeBreakerUsedThisTurn === true;

  return {
    disabled: usedThisTurn,
    disabledReason: usedThisTurn ? "Horde Breaker has already been used this turn." : undefined
  };
}

export function applyRangerHunterHordeBreakerWeaponAction(action: WeaponAction): WeaponAction {
  return {
    ...action,
    economyMultiCount: (action.economyMultiCount ?? 0) + 1
  };
}

export function setRangerHunterHordeBreakerActionKey(
  character: Character,
  actionKey: string | null
): Character {
  if (getRangerHunterPreyChoice(character) !== "horde-breaker") {
    return character;
  }

  const normalizedActionKey =
    typeof actionKey === "string" && actionKey.trim().length > 0 ? actionKey : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        hunterHordeBreakerActionKey: normalizedActionKey
      }
    }
  };
}

export function markRangerHunterColossusSlayerUsed(character: Character): Character {
  if (getRangerHunterPreyChoice(character) !== "colossus-slayer") {
    return character;
  }

  if (character.classFeatureState?.ranger?.hunterColossusSlayerUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        hunterColossusSlayerUsedThisTurn: true
      }
    }
  };
}

export function markRangerHunterHordeBreakerUsed(character: Character): Character {
  if (getRangerHunterPreyChoice(character) !== "horde-breaker") {
    return character;
  }

  if (character.classFeatureState?.ranger?.hunterHordeBreakerUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        hunterHordeBreakerUsedThisTurn: true,
        hunterHordeBreakerActionKey: undefined
      }
    }
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

function collectRangerHunterContributions(
  character: RangerHunterCharacter
): FeatureContributionSpec[] {
  if (!isRangerHunter(character)) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "ranger-hunter-hunters-prey",
        label: "Hunter's Prey",
        entryId: CLASS_FEATURE.HUNTERS_PREY
      }),
      weaponActionTransforms: [
        {
          id: "ranger-hunter-hunters-prey-transform",
          transform: (_character, action) =>
            applySelectedHordeBreakerWeaponAction(
              character,
              appendHuntersPreyDescription(character, action as WeaponAction)
            )
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: "ranger-hunter-hunters-lore",
        label: huntersLoreSource,
        entryId: CLASS_FEATURE.HUNTERS_LORE
      }),
      featureActionTransforms: [
        {
          id: "ranger-hunter-hunters-lore-feature-action-transform",
          transform: (action) => appendHuntersLoreToFeatureAction(character, action)
        }
      ],
      spellTransforms: [
        {
          id: "ranger-hunter-hunters-lore-spell-transform",
          transform: (spell) => appendHunterSpellDescription(character, spell)
        }
      ]
    }
  ];

  if (hasRangerHunterDefensiveTacticsFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "ranger-hunter-defensive-tactics",
        label: "Defensive Tactics",
        entryId: CLASS_FEATURE.DEFENSIVE_TACTICS
      }),
      statuses: getRangerHunterDefensiveTacticsDerivedStatusEntries(character)
    });
  }

  if (hasRangerHunterSuperiorHuntersPreyFeature(character)) {
    contributions.push(
      {
        source: createSubclassContributionSource({
          id: "ranger-hunter-superior-hunters-prey",
          label: superiorHuntersPreySource,
          entryId: CLASS_FEATURE.SUPERIOR_HUNTERS_PREY
        })
      }
    );
  }

  if (hasRangerHunterSuperiorHuntersDefenseFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "ranger-hunter-superior-hunters-defense",
        label: superiorHuntersDefenseName,
        entryId: CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE
      }),
      reactions: getRangerHunterReactionEntries(character)
    });
  }

  return contributions;
}

export const getRangerHunterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectRangerHunterContributions(character)),
    {
      character: character as Character
    }
  );

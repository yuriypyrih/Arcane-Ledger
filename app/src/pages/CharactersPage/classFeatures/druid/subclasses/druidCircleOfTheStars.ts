import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  getSpellEntryByName,
  type ReactionEntry
} from "../../../../../codex/entries";
import type {
  Character,
  CharacterDruidFeatureState,
  DruidCosmicOmenSelection
} from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter
} from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureSpeedBonus
} from "../../types";
import { createHeaderTagsFromResources } from "../../cardUsage";
import type { WeaponAction } from "../../../gameplay";
import {
  createCharacterStatusEntry,
  getExhaustionD20TestPenalty,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import {
  getDruidCircleOfTheStarsCosmicOmenIntroDescriptionEntries,
  getDruidCircleOfTheStarsCosmicOmenUsesDescriptionEntries,
  getDruidCircleOfTheStarsGuidingBoltSpellEntry,
  getDruidCircleOfTheStarsTwinklingConstellationsDescriptionAdditions
} from "./druidCircleOfTheStarsDescriptions";
import { druidStarryFormActionKey } from "../actionKeys";
import {
  deactivateDruidWildShape,
  expendOneDruidWildShapeUse,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal
} from "../base";

export const circleOfTheStarsSubclassId = "druid-circle-of-the-stars";
export const druidStarryFormStatusSourceId = "feature-druid-starry-form";
export const druidStarryFormConstellations = ["archer", "chalice", "dragon"] as const;
export const druidCosmicOmenReactionId = "reaction-druid-cosmic-omen";
export type DruidStarryFormConstellation = (typeof druidStarryFormConstellations)[number];

const guidanceSpellId = getSpellEntryByName("Guidance")?.id ?? null;
const guidingBoltSpellId = getSpellEntryByName("Guiding Bolt")?.id ?? null;
const cosmicOmenName = "Cosmic Omen";
const cosmicOmenSourceLabel = "Circle of the Stars";
const defaultAbilities: Character["abilities"] = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10
};
const druidStarryFormLabels: Record<DruidStarryFormConstellation, string> = {
  archer: "Archer",
  chalice: "Chalice",
  dragon: "Dragon"
};

function resolveSpellIdsByName(names: readonly string[]): string[] {
  return names.flatMap((name) => {
    const spell = getSpellEntryByName(name);
    return spell ? [spell.id] : [];
  });
}

export function hasDruidStarMapFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level">> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheStarsSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level ?? 0))) >= 3
  );
}

export function hasDruidStarryFormFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasDruidStarMapFeature(character);
}

export function hasDruidCosmicOmenFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheStarsSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level ?? 0))) >= 6
  );
}

export function hasDruidTwinklingConstellationsFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheStarsSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level ?? 0))) >= 10
  );
}

export function hasDruidFullOfStarsFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheStarsSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level ?? 0))) >= 14
  );
}

function getCircleOfTheStarsFeatureDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  feature: CLASS_FEATURE
) {
  return (
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      Math.max(1, character.level ?? 1),
      feature
    )?.description ?? []
  );
}

function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function createRollFormula(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function createRollDisplay(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function toDruidStarsResourceCharacter(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "classFeatureState" | "abilities" | "statusEntries" | "subclassId">
    >
) {
  return {
    className: character.className,
    level: Math.max(1, character.level ?? 1),
    classFeatureState: character.classFeatureState ?? {},
    abilities: character.abilities ?? defaultAbilities,
    statusEntries: character.statusEntries ?? [],
    subclassId: character.subclassId
  };
}

export const circleOfTheStarsSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Guidance", "Guiding Bolt"])
} as const;

export function normalizeDruidCircleOfTheStarsFeatureState(
  value: Partial<CharacterDruidFeatureState>,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): Pick<
  CharacterDruidFeatureState,
  "starMapGuidingBoltUsesExpended" | "cosmicOmenSelection" | "cosmicOmenUsesExpended"
> {
  const starMapGuidingBoltUsesTotal = hasDruidStarMapFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "WIS"))
    : 0;
  const cosmicOmenUsesTotal = hasDruidCosmicOmenFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "WIS"))
    : 0;

  return {
    starMapGuidingBoltUsesExpended: hasDruidStarMapFeature(character)
      ? Math.max(
          0,
          Math.min(
            starMapGuidingBoltUsesTotal,
            Number.isFinite(Number(value.starMapGuidingBoltUsesExpended))
              ? Math.floor(Number(value.starMapGuidingBoltUsesExpended))
              : 0
          )
        )
      : undefined,
    cosmicOmenSelection: hasDruidCosmicOmenFeature(character)
      ? value.cosmicOmenSelection === "woe"
        ? "woe"
        : "weal"
      : undefined,
    cosmicOmenUsesExpended: hasDruidCosmicOmenFeature(character)
      ? Math.max(
          0,
          Math.min(
            cosmicOmenUsesTotal,
            Number.isFinite(Number(value.cosmicOmenUsesExpended))
              ? Math.floor(Number(value.cosmicOmenUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

export function getDruidStarryFormConstellationLabel(
  constellation: DruidStarryFormConstellation
): string {
  return druidStarryFormLabels[constellation];
}

function isDruidStarryFormConstellation(value: unknown): value is DruidStarryFormConstellation {
  return (
    typeof value === "string" &&
    (druidStarryFormConstellations as readonly string[]).includes(value)
  );
}

function createDruidStarryFormValue(constellation: DruidStarryFormConstellation): string {
  return `Starry Form (${getDruidStarryFormConstellationLabel(constellation)})`;
}

function parseDruidStarryFormConstellation(value: unknown): DruidStarryFormConstellation | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "starry form") {
    return null;
  }

  if (normalizedValue === "starry form (archer)") {
    return "archer";
  }

  if (normalizedValue === "starry form (chalice)") {
    return "chalice";
  }

  if (normalizedValue === "starry form (dragon)") {
    return "dragon";
  }

  return null;
}

export function pruneDruidStarryFormStatusEntries(
  statusEntries: Character["statusEntries"]
): ReturnType<typeof normalizeCharacterStatusEntries> {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== druidStarryFormStatusSourceId
  );
}

export function getDruidActiveStarryFormConstellation(
  character: Pick<Character, "statusEntries">
): DruidStarryFormConstellation | null {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    (entry) => entry.sourceId === druidStarryFormStatusSourceId
  );

  return activeEntry ? parseDruidStarryFormConstellation(activeEntry.value) : null;
}

function getActiveDruidStarryFormValue(character: Pick<Character, "statusEntries">): string | null {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    (entry) => entry.sourceId === druidStarryFormStatusSourceId
  );

  return typeof activeEntry?.value === "string" ? activeEntry.value : null;
}

export function setDruidActiveStarryFormConstellation(
  character: Character,
  constellation: DruidStarryFormConstellation
): Character {
  if (
    !hasDruidTwinklingConstellationsFeature(character) ||
    !isDruidStarryFormConstellation(constellation)
  ) {
    return character;
  }

  const nextValue = createDruidStarryFormValue(constellation);
  let didUpdateEntry = false;

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).map(
    (entry) => {
      if (entry.sourceId !== druidStarryFormStatusSourceId) {
        return entry;
      }

      didUpdateEntry = true;

      if (entry.value === nextValue) {
        return entry;
      }

      return {
        ...entry,
        value: nextValue
      };
    }
  );

  if (!didUpdateEntry) {
    return character;
  }

  return {
    ...character,
    statusEntries: nextStatusEntries
  };
}

export function getDruidStarMapGuidingBoltUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return hasDruidStarMapFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "WIS"))
    : 0;
}

export function getDruidStarMapGuidingBoltUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  const totalUses = getDruidStarMapGuidingBoltUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const druidState = normalizeDruidCircleOfTheStarsFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  );

  return Math.max(0, totalUses - (druidState.starMapGuidingBoltUsesExpended ?? 0));
}

export function getDruidCosmicOmenUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return hasDruidCosmicOmenFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "WIS"))
    : 0;
}

export function getDruidCosmicOmenUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  const totalUses = getDruidCosmicOmenUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const druidState = normalizeDruidCircleOfTheStarsFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  );

  return Math.max(0, totalUses - (druidState.cosmicOmenUsesExpended ?? 0));
}

export function getDruidCosmicOmenSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): DruidCosmicOmenSelection | null {
  if (!hasDruidCosmicOmenFeature(character)) {
    return null;
  }

  return (
    normalizeDruidCircleOfTheStarsFeatureState(character.classFeatureState?.druid ?? {}, character)
      .cosmicOmenSelection ?? "weal"
  );
}

export function setDruidCosmicOmenSelection(
  character: Character,
  selection: DruidCosmicOmenSelection
): Character {
  if (!hasDruidCosmicOmenFeature(character) || (selection !== "weal" && selection !== "woe")) {
    return character;
  }

  const druidState = character.classFeatureState?.druid ?? {};

  if (druidState.cosmicOmenSelection === selection) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        cosmicOmenSelection: selection
      }
    }
  };
}

export function restoreDruidStarMapGuidingBoltOnLongRest(
  character: Character,
  druidState: CharacterDruidFeatureState = character.classFeatureState?.druid ?? {}
): Character {
  if (
    getDruidStarMapGuidingBoltUsesTotal(character) <= 0 ||
    (druidState.starMapGuidingBoltUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        starMapGuidingBoltUsesExpended: 0
      }
    }
  };
}

export function restoreDruidCosmicOmenOnLongRest(
  character: Character,
  druidState: CharacterDruidFeatureState = character.classFeatureState?.druid ?? {}
): Character {
  if (
    getDruidCosmicOmenUsesTotal(character) <= 0 ||
    (druidState.cosmicOmenUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        cosmicOmenUsesExpended: 0
      }
    }
  };
}

export function consumeDruidStarMapGuidingBoltUse(
  character: Character,
  druidState: CharacterDruidFeatureState = character.classFeatureState?.druid ?? {}
): Character {
  const usesRemaining = getDruidStarMapGuidingBoltUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        starMapGuidingBoltUsesExpended: Math.min(
          getDruidStarMapGuidingBoltUsesTotal(character),
          (druidState.starMapGuidingBoltUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function consumeDruidCosmicOmenUse(
  character: Character,
  druidState: CharacterDruidFeatureState = character.classFeatureState?.druid ?? {}
): Character {
  const usesRemaining = getDruidCosmicOmenUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        cosmicOmenUsesExpended: Math.min(
          getDruidCosmicOmenUsesTotal(character),
          (druidState.cosmicOmenUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function activateDruidStarryForm(
  character: Character,
  constellation: DruidStarryFormConstellation
): Character {
  if (
    !hasDruidStarryFormFeature(character) ||
    !isDruidStarryFormConstellation(constellation) ||
    getDruidWildShapeUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const baseCharacter = deactivateDruidWildShape(character);
  const nextCharacter = expendOneDruidWildShapeUse(baseCharacter);
  const nextStatusEntries = pruneDruidStarryFormStatusEntries(nextCharacter.statusEntries);

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: createDruidStarryFormValue(constellation),
        source: "Circle of the Stars",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: druidStarryFormStatusSourceId
      })
    ]
  };
}

function getCircleOfTheStarsReactionEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
): ReactionEntry[] {
  return hasDruidCosmicOmenFeature(character)
    ? [
        {
          id: druidCosmicOmenReactionId,
          reaction: REACTION.COSMIC_OMEN,
          name: cosmicOmenName,
          sourceType: "feature",
          sourceFeature: CLASS_FEATURE.COSMIC_OMEN,
          sourceLabel: cosmicOmenSourceLabel,
          description: [
            ...getDruidCircleOfTheStarsCosmicOmenIntroDescriptionEntries(character),
            ...getDruidCircleOfTheStarsCosmicOmenUsesDescriptionEntries(character)
          ]
        }
      ]
    : [];
}

export function getCircleOfTheStarsFeatureActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "abilities" | "subclassId">>
): FeatureActionCard[] {
  if (!hasDruidStarMapFeature(character)) {
    return [];
  }

  const resourceCharacter = toDruidStarsResourceCharacter(character);
  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(resourceCharacter);
  const wildShapeUsesTotal = getDruidWildShapeUsesTotal(resourceCharacter);
  const starryFormDescription = getCircleOfTheStarsFeatureDescription(
    character,
    CLASS_FEATURE.STARRY_FORM
  );
  const twinklingConstellationsDescriptionAdditions =
    getDruidCircleOfTheStarsTwinklingConstellationsDescriptionAdditions(character);

  return [
    {
      key: druidStarryFormActionKey,
      name: "Starry Form",
      summary: "Expend 1 Wild Shape use to assume a stellar constellation.",
      detail: "Use 1 Wild Shape use to assume a starry constellation for 10 minutes.",
      breakdown: "Assume starry form",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining: wildShapeUsesRemaining,
      usesTotal: wildShapeUsesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw",
      description: starryFormDescription,
      descriptionAdditions: twinklingConstellationsDescriptionAdditions,
      headerTags: createHeaderTagsFromResources([
        {
          kind: "tracker",
          label: "Wild Shape",
          current: wildShapeUsesRemaining,
          total: wildShapeUsesTotal,
          icon: "paw",
          cost: 1
        }
      ]),
      drawer: {
        kind: "custom-form",
        eyebrow: "Circle of the Stars",
        description: starryFormDescription,
        descriptionAdditions: twinklingConstellationsDescriptionAdditions,
        formKind: "starry-form"
      },
      execute: {
        kind: "custom-form",
        formKind: "starry-form"
      },
      disabled: wildShapeUsesRemaining <= 0,
      disabledReason: wildShapeUsesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    }
  ];
}

export function getCircleOfTheStarsAlwaysPreparedSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string[] {
  if (!hasDruidStarMapFeature(character)) {
    return [];
  }

  return [
    ...(guidanceSpellId ? [guidanceSpellId] : []),
    ...(guidingBoltSpellId ? [guidingBoltSpellId] : [])
  ];
}

export function getCircleOfTheStarsWeaponActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "abilities" | "statusEntries">>
): WeaponAction[] {
  if (
    character.className !== "Druid" ||
    getDruidActiveStarryFormConstellation({
      statusEntries: character.statusEntries ?? []
    }) !== "archer"
  ) {
    return [];
  }

  const wisdomModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, "WIS");
  const wisdomModifier = wisdomModifierBreakdown.total;
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
  const hasTwinklingConstellations = hasDruidTwinklingConstellationsFeature(character);
  const damageFormula = hasTwinklingConstellations ? "2d8" : "1d8";

  return [
    {
      key: "druid-starry-form-luminous-arrow",
      name: "Luminous Arrow",
      attackKind: "weapon",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.ATTACK,
      damageLabel: `${damageFormula} Radiant`,
      damageFormula,
      rollDisplay: createRollDisplay(damageFormula, wisdomModifier),
      rollFormulaDisplay: createRollFormula(damageFormula, wisdomModifier),
      ability: "WIS",
      cardBaseAbility: "WIS",
      abilityModifierBaseValue: wisdomModifierBreakdown.baseValue,
      abilityModifier: wisdomModifier,
      cardBaseAbilityModifier: wisdomModifier,
      abilityModifierBonusEntries: wisdomModifierBreakdown.bonusEntries,
      attackBonusEntries:
        exhaustionPenalty !== 0
          ? [
              {
                label: "Exhaustion",
                value: exhaustionPenalty
              }
            ]
          : [],
      damageAbility: "WIS",
      damageAbilityModifierBaseValue: wisdomModifierBreakdown.baseValue,
      damageAbilityModifier: wisdomModifier,
      damageAbilityModifierBonusEntries: wisdomModifierBreakdown.bonusEntries,
      proficiencyLabel: "Spell attack",
      proficiencyBonus,
      totalModifier: wisdomModifier,
      indicators: [],
      damageBonusEntries: [],
      cardBonusLabels: [],
      rollFormula: createRollFormula(damageFormula, wisdomModifier),
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      hasBatteringRootsBonus: false,
      drawerEyebrow: "Circle of the Stars",
      description: [
        "Hurl a luminous arrow at a creature within 60 feet.",
        `On a hit, the arrow deals ${damageFormula} Radiant damage plus your Wisdom modifier.`
      ],
      descriptionAdditions:
        getDruidCircleOfTheStarsTwinklingConstellationsDescriptionAdditions(character),
      details: [
        { label: "Type", value: "Ranged spell attack" },
        { label: "Range", value: "60 feet" },
        { label: "Damage Type", value: "Radiant" }
      ]
    }
  ];
}

function getCircleOfTheStarsSpeedBonuses(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "abilities" | "statusEntries" | "subclassId">>
): FeatureSpeedBonus[] {
  return character.className === "Druid" &&
    hasDruidTwinklingConstellationsFeature(character) &&
    getDruidActiveStarryFormConstellation({
      statusEntries: character.statusEntries ?? []
    }) === "dragon"
    ? [
        {
          label: "Twinkling Constellations",
          movementType: "fly",
          value: 0,
          setTotal: 20,
          hover: true
        }
      ]
    : [];
}

function getCircleOfTheStarsFullOfStarsDerivedStatusEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId" | "abilities">>
): DerivedFeatureStatusEntry[] {
  if (!hasDruidFullOfStarsFeature(character)) {
    return [];
  }

  const activeStarryFormValue = getActiveDruidStarryFormValue({
    statusEntries: character.statusEntries ?? []
  });

  if (!activeStarryFormValue) {
    return [];
  }

  return [DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING].map(
    (damageType): DerivedFeatureStatusEntry => ({
      id: `feature-druid-full-of-stars-resistance-${damageType.toLowerCase()}`,
      sourceId: "feature-druid-full-of-stars",
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: "Full of Stars",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: activeStarryFormValue
      }
    })
  );
}

export function collectDruidCircleOfTheStarsContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  return [
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheStarsSubclassId}-star-map`,
        label: "Star Map",
        entryId: CLASS_FEATURE.STAR_MAP
      }),
      alwaysPreparedSpellIds: getCircleOfTheStarsAlwaysPreparedSpellIds(character),
      spellTransforms: [
        {
          id: `${circleOfTheStarsSubclassId}-star-map-guiding-bolt-spell-transform`,
          transform: (spell) =>
            getDruidCircleOfTheStarsGuidingBoltSpellEntry(
              {
                className: character.className,
                level: character.level ?? 0,
                subclassId: character.subclassId
              },
              spell
            )
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheStarsSubclassId}-starry-form`,
        label: "Starry Form",
        entryId: CLASS_FEATURE.STARRY_FORM
      }),
      actions: getCircleOfTheStarsFeatureActions(character),
      weaponActions: getCircleOfTheStarsWeaponActions(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheStarsSubclassId}-cosmic-omen`,
        label: "Cosmic Omen",
        entryId: CLASS_FEATURE.COSMIC_OMEN
      }),
      reactions: getCircleOfTheStarsReactionEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheStarsSubclassId}-twinkling-constellations`,
        label: "Twinkling Constellations",
        entryId: CLASS_FEATURE.TWINKLING_CONSTELLATIONS
      }),
      speedBonuses: getCircleOfTheStarsSpeedBonuses(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheStarsSubclassId}-full-of-stars`,
        label: "Full of Stars",
        entryId: CLASS_FEATURE.FULL_OF_STARS
      }),
      statuses: getCircleOfTheStarsFullOfStarsDerivedStatusEntries(character)
    }
  ];
}

export const getDruidCircleOfTheStarsDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectDruidCircleOfTheStarsContributions(character)),
    {
      character: character as Character
    }
  );

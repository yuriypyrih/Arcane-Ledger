import {
  CLASS_FEATURE,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterArtificerFeatureState,
  type CharacterCompanion,
  type MonsterRecord
} from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { CHARACTER_COMPANION_LIMIT, createCharacterCompanionId } from "../../../companions";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellSlots";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureActionCard, FeatureActionOptionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artilleristSubclassId = "artificer-artillerist";
export const artificerEldritchCannonActionKey = "artificer-artillerist-eldritch-cannon";
export const artificerExplosiveCannonDetonateReactionEntryId =
  "reaction-artificer-artillerist-detonate";

const eldritchCannonName = "Eldritch Cannon";
const eldritchCannonCompanionType = "Eldritch Cannon";
const legacyEldritchCannonCompanionType = "Artillerist Eldritch Cannon";
const eldritchCannonDocumentTitle = "Eberron";
const eldritchCannonMonsterIdPrefix = "artificer-eldritch-cannon";
const eldritchCannonUsesTotal = 1;
const eldritchCannonBaseLimit = 1;
const eldritchCannonFortifiedPositionLimit = 2;
const explosiveCannonName = "Explosive Cannon";
const explosiveCannonDetonateName = "Detonate";
const spellSlotCost = createFeatureActionCardCost({ resourceLabel: "Spell Slot" });

export type ArtificerEldritchCannonOptionKey = "flamethrower" | "force-ballista" | "protector";

export type ArtificerEldritchCannonSpellSlotOption = {
  level: number;
  remaining: number;
  total: number;
};

type ArtilleristEldritchCannonCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "classFeatureState"
      | "companions"
      | "customClass"
      | "level"
      | "spellSlotsExpended"
      | "subclassId"
    >
  >;

type EldritchCannonOptionConfig = {
  key: ArtificerEldritchCannonOptionKey;
  name: string;
  summary: string;
  detail: string;
  breakdown: string;
  activationDescription: string;
};

const eldritchCannonOptions = [
  {
    key: "flamethrower",
    name: "Flamethrower",
    summary: "Exhale fire in a 15-foot cone.",
    detail: "Dexterity save for 2d8 fire damage.",
    breakdown: "15-foot fire cone",
    activationDescription:
      "The cannon exhales fire in an adjacent 15-foot cone that you designate. Each creature in that area must make a Dexterity saving throw against your spell save DC, taking 2d8 fire damage on a failed save or half as much damage on a successful one. The fire ignites any flammable objects in the area that aren't being worn or carried."
  },
  {
    key: "force-ballista",
    name: "Force Ballista",
    summary: "Fire a force bolt from the cannon.",
    detail: "Ranged spell attack for 2d8 force damage.",
    breakdown: "120-foot force shot",
    activationDescription:
      "Make a ranged spell attack, originating from the cannon, at one creature or object within 120 feet of it. On a hit, the target takes 2d8 force damage, and if the target is a creature, it is pushed up to 5 feet away from the cannon."
  },
  {
    key: "protector",
    name: "Protector",
    summary: "Emit protective positive energy.",
    detail: "Grant 1d8 + Intelligence modifier temporary hit points.",
    breakdown: "10-foot temporary HP",
    activationDescription:
      "The cannon emits a burst of positive energy that grants itself and each creature of your choice within 10 feet of it a number of temporary hit points equal to 1d8 + your Intelligence modifier (minimum of +1)."
  }
] satisfies EldritchCannonOptionConfig[];

const eldritchCannonOptionKeys = new Set<string>(eldritchCannonOptions.map((option) => option.key));

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function getEldritchCannonOption(
  optionKey: string | null | undefined
): EldritchCannonOptionConfig | null {
  return eldritchCannonOptions.find((option) => option.key === optionKey) ?? null;
}

function getSpellSlotState(character: ArtilleristEldritchCannonCharacter) {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId,
    character.customClass
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );

  return {
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining
  };
}

function getDescriptionParagraphs(description: SpellDescriptionEntry[]): string[] {
  return description.flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items));
}

function getFeatureDescriptionParagraphs(
  character: ArtilleristEldritchCannonCharacter,
  feature: CLASS_FEATURE
): string[] {
  return getDescriptionParagraphs(getFeatureDescriptionForCharacter(character, feature));
}

function stripDescriptionMarkup(description: string): string {
  return description
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<link:[^>]+>(.*?)<\/link>/g, "$1")
    .replace(/<spell:[^>]+>(.*?)<\/spell>/g, "$1");
}

function getExplosiveCannonDescriptionParagraph(
  character: ArtilleristEldritchCannonCharacter,
  heading: string
): string | null {
  return getFeatureDescriptionSection(character, CLASS_FEATURE.EXPLOSIVE_CANNON, heading)[0] ?? null;
}

function isFeatureDescriptionSubheading(paragraph: string): boolean {
  return paragraph.startsWith("<strong>") && paragraph.includes(".</strong>");
}

function getFeatureDescriptionSection(
  character: ArtilleristEldritchCannonCharacter,
  feature: CLASS_FEATURE,
  heading: string
): string[] {
  const paragraphs = getFeatureDescriptionParagraphs(character, feature);
  const startIndex = paragraphs.findIndex((paragraph) =>
    paragraph.startsWith(`<strong>${heading}.</strong>`)
  );

  if (startIndex < 0) {
    return [];
  }

  const nextSectionOffset = paragraphs
    .slice(startIndex + 1)
    .findIndex(isFeatureDescriptionSubheading);
  const endIndex =
    nextSectionOffset < 0 ? paragraphs.length : startIndex + 1 + nextSectionOffset;

  return paragraphs.slice(startIndex, endIndex);
}

function getExplosiveCannonDetonateDescription(
  character: ArtilleristEldritchCannonCharacter
): SpellDescriptionEntry[] {
  return getFeatureDescriptionSection(
    character,
    CLASS_FEATURE.EXPLOSIVE_CANNON,
    explosiveCannonDetonateName
  );
}

function getExplosiveCannonFirepowerStatBlockDescription(
  character: ArtilleristEldritchCannonCharacter
): string | null {
  if (!hasArtificerExplosiveCannonFeature(character)) {
    return null;
  }

  const firepowerDescription = getExplosiveCannonDescriptionParagraph(character, "Firepower");

  if (!firepowerDescription) {
    return null;
  }

  const normalizedFirepowerDescription = stripDescriptionMarkup(firepowerDescription).replace(
    /^Firepower\.\s*/,
    ""
  );

  return `Level 9: ${explosiveCannonName}. Firepower: ${normalizedFirepowerDescription}`;
}

function getEldritchCannonDescriptionText(character: ArtilleristEldritchCannonCharacter): string {
  const activationHeadings = [
    "<strong>Flamethrower.",
    "<strong>Force Ballista.",
    "<strong>Protector."
  ];

  const baseDescription = getFeatureDescriptionParagraphs(character, CLASS_FEATURE.ELDRITCH_CANNON)
    .filter((paragraph) => !activationHeadings.some((heading) => paragraph.startsWith(heading)))
    .join("\n\n");
  const firepowerDescription = getExplosiveCannonFirepowerStatBlockDescription(character);

  return [baseDescription, firepowerDescription]
    .filter((paragraph): paragraph is string => Boolean(paragraph))
    .join("\n\n");
}

function getEldritchCannonActivationDescription(
  character: ArtilleristEldritchCannonCharacter,
  option: EldritchCannonOptionConfig
): string {
  if (!hasArtificerExplosiveCannonFeature(character)) {
    return option.activationDescription;
  }

  switch (option.key) {
    case "flamethrower":
      return "The cannon exhales fire in an adjacent 15-foot cone that you designate. Each creature in that area must make a Dexterity saving throw against your spell save DC, taking 3d8 fire damage on a failed save or half as much damage on a successful one. The fire ignites any flammable objects in the area that aren't being worn or carried.";
    case "force-ballista":
      return "Make a ranged spell attack, originating from the cannon, at one creature or object within 120 feet of it. On a hit, the target takes 3d8 force damage, and if the target is a creature, it is pushed up to 5 feet away from the cannon.";
    case "protector":
      return "The cannon emits a burst of positive energy that grants itself and each creature of your choice within 10 feet of it a number of temporary hit points equal to 2d8 + your Intelligence modifier (minimum of +1).";
  }

  return option.activationDescription;
}

function getArtificerEldritchCannonLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerFortifiedPositionFeature(character)
    ? eldritchCannonFortifiedPositionLimit
    : eldritchCannonBaseLimit;
}

function getActiveArtificerEldritchCannonCount(
  character: Partial<Pick<Character, "companions">>
): number {
  return getArtificerEldritchCannonCompanions(character).length;
}

function getExplosiveCannonEldritchCannonDescriptionAddition(
  character: ArtilleristEldritchCannonCharacter
): SpellDescriptionEntry[] {
  if (!hasArtificerExplosiveCannonFeature(character)) {
    return [];
  }

  const descriptionEntries = [
    ...getFeatureDescriptionSection(character, CLASS_FEATURE.EXPLOSIVE_CANNON, "Detonate"),
    ...getFeatureDescriptionSection(character, CLASS_FEATURE.EXPLOSIVE_CANNON, "Firepower")
  ];

  return createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.EXPLOSIVE_CANNON,
    descriptionEntries
  );
}

function getFortifiedPositionEldritchCannonDescriptionAddition(
  character: ArtilleristEldritchCannonCharacter
): SpellDescriptionEntry[] {
  if (!hasArtificerFortifiedPositionFeature(character)) {
    return [];
  }

  const descriptionEntries = [
    ...getFeatureDescriptionSection(character, CLASS_FEATURE.FORTIFIED_POSITION, "Double Firepower"),
    ...getFeatureDescriptionSection(
      character,
      CLASS_FEATURE.FORTIFIED_POSITION,
      "Shimmering Field Projection"
    )
  ];

  return createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.FORTIFIED_POSITION,
    descriptionEntries
  );
}

function getEldritchCannonActionDescriptionAdditions(
  character: ArtilleristEldritchCannonCharacter
): SpellDescriptionEntry[][] {
  return [
    getExplosiveCannonEldritchCannonDescriptionAddition(character),
    getFortifiedPositionEldritchCannonDescriptionAddition(character)
  ].filter((section) => section.length > 0);
}

function createEldritchCannonTemplate(
  character: ArtilleristEldritchCannonCharacter,
  option: EldritchCannonOptionConfig
): MonsterRecord {
  return {
    id: `${eldritchCannonMonsterIdPrefix}-${option.key}`,
    slug: `${eldritchCannonMonsterIdPrefix}-${option.key}`,
    desc: getEldritchCannonDescriptionText(character),
    name: option.name,
    size: "Small or Tiny",
    type: "Magical Object",
    subtype: "",
    group: eldritchCannonCompanionType,
    alignment: "Unaligned",
    armor_class: 18,
    armor_desc: null,
    hit_points: 10,
    hit_dice: "5 times your Artificer level",
    speed: { walk: 15, climb: 15 },
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: null,
    skills: {},
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "Poison, Psychic",
    condition_immunities: "",
    senses: "",
    languages: "",
    challenge_rating: "None (XP 0)",
    cr: 0,
    actions: [
      {
        name: "Activation",
        desc: getEldritchCannonActivationDescription(character, option)
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Magical Object",
        desc: "If the cannon is forced to make an ability check or a saving throw, treat all its ability scores as 10 (+0). If the Mending spell is cast on it, it regains 2d6 hit points."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: [],
    img_main: null,
    document__slug: "",
    document__title: eldritchCannonDocumentTitle,
    document__license_url: "",
    document__url: "",
    v2_converted_path: ""
  };
}

function createEldritchCannonCompanion(
  character: ArtilleristEldritchCannonCharacter,
  option: EldritchCannonOptionConfig
): CharacterCompanion {
  const maximumHitPoints = Math.max(1, 5 * Math.max(1, Math.floor(character.level ?? 1)));

  return {
    id: createCharacterCompanionId(),
    name: option.name,
    description: "",
    type: eldritchCannonCompanionType,
    maxHitPoints: maximumHitPoints,
    currentHitPoints: maximumHitPoints,
    temporaryHitPoints: 0,
    duration: {
      kind: STATUS_DURATION_KIND.HOURS,
      amount: 1
    },
    inheritedCreatureEntry: createEldritchCannonTemplate(character, option)
  };
}

function consumeEldritchCannonResource(
  character: Character,
  spellSlotLevel: number | null
): Character {
  const usesTotal = getArtificerEldritchCannonUsesTotal(character);
  const usesRemaining = getArtificerEldritchCannonUsesRemaining(character);

  if (usesTotal > 0 && usesRemaining > 0) {
    const currentArtificerState = character.classFeatureState?.artificer ?? {};

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        artificer: {
          ...currentArtificerState,
          artilleristEldritchCannonUsesExpended: Math.min(
            usesTotal,
            normalizeUsesExpended(
              currentArtificerState.artilleristEldritchCannonUsesExpended,
              usesTotal
            ) + 1
          )
        }
      }
    };
  }

  if (spellSlotLevel === null) {
    return character;
  }

  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotTotals, spellSlotsExpended, spellSlotsRemaining } = getSpellSlotState(character);
  const slotIndex = normalizedSpellSlotLevel - 1;

  if ((spellSlotTotals[slotIndex] ?? 0) <= 0 || (spellSlotsRemaining[slotIndex] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[slotIndex] = (nextSpellSlotsExpended[slotIndex] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function isArtificerEldritchCannonOptionKey(
  value: string | null | undefined
): value is ArtificerEldritchCannonOptionKey {
  return typeof value === "string" && eldritchCannonOptionKeys.has(value);
}

export function isArtificerEldritchCannonCompanion(
  companion: Pick<CharacterCompanion, "type" | "inheritedCreatureEntry">
): boolean {
  return (
    companion.type === eldritchCannonCompanionType ||
    companion.type === legacyEldritchCannonCompanionType ||
    companion.inheritedCreatureEntry?.id.startsWith(`${eldritchCannonMonsterIdPrefix}-`) === true
  );
}

export function hasArtificerEldritchCannonFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, artilleristSubclassId, 3);
}

export function hasArtificerExplosiveCannonFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, artilleristSubclassId, 9);
}

export function hasArtificerFortifiedPositionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, artilleristSubclassId, 15);
}

export function hasActiveArtificerEldritchCannon(
  character: Partial<Pick<Character, "companions">>
): boolean {
  return getActiveArtificerEldritchCannonCount(character) > 0;
}

export function getArtificerEldritchCannonCompanions(
  character: Partial<Pick<Character, "companions">>
): CharacterCompanion[] {
  return (character.companions ?? []).filter(isArtificerEldritchCannonCompanion);
}

export function getArtificerExplosiveCannonReactionEntries(
  character: ArtilleristEldritchCannonCharacter
): ReactionEntry[] {
  if (!hasArtificerExplosiveCannonFeature(character)) {
    return [];
  }

  return [
    {
      id: artificerExplosiveCannonDetonateReactionEntryId,
      reaction: REACTION.DETONATE,
      name: explosiveCannonDetonateName,
      sourceType: "feature",
      sourceFeature: CLASS_FEATURE.EXPLOSIVE_CANNON,
      sourceLabel: "Artillerist",
      description: getExplosiveCannonDetonateDescription(character)
    }
  ];
}

export function getArtificerEldritchCannonUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerEldritchCannonFeature(character) ? eldritchCannonUsesTotal : 0;
}

export function getArtificerEldritchCannonUsesRemaining(
  character: ArtilleristEldritchCannonCharacter
): number {
  const usesTotal = getArtificerEldritchCannonUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.artilleristEldritchCannonUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function getArtificerEldritchCannonSpellSlotOptions(
  character: ArtilleristEldritchCannonCharacter
): ArtificerEldritchCannonSpellSlotOption[] {
  const { spellSlotTotals, spellSlotsRemaining } = getSpellSlotState(character);

  return spellSlotTotals.flatMap((total, index) => {
    const remaining = spellSlotsRemaining[index] ?? 0;

    return total > 0 && remaining > 0
      ? [
          {
            level: index + 1,
            remaining,
            total
          }
        ]
      : [];
  });
}

export function getArtificerEldritchCannonFallbackSlotSummary(
  character: ArtilleristEldritchCannonCharacter
) {
  const { spellSlotTotals, spellSlotsRemaining } = getSpellSlotState(character);

  return {
    remaining: spellSlotsRemaining.reduce((sum, remaining) => sum + remaining, 0),
    total: spellSlotTotals.reduce((sum, total) => sum + total, 0)
  };
}

export function normalizeArtificerArtilleristState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): Pick<CharacterArtificerFeatureState, "artilleristEldritchCannonUsesExpended"> {
  if (!hasArtificerEldritchCannonFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};

  return {
    artilleristEldritchCannonUsesExpended: normalizeUsesExpended(
      record.artilleristEldritchCannonUsesExpended,
      eldritchCannonUsesTotal
    )
  };
}

export function getArtificerEldritchCannonAction(
  character: ArtilleristEldritchCannonCharacter
): FeatureActionCard | null {
  if (!hasArtificerEldritchCannonFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerEldritchCannonUsesTotal(character);
  const usesRemaining = getArtificerEldritchCannonUsesRemaining(character);
  const fallbackSlotOptions = getArtificerEldritchCannonSpellSlotOptions(character);
  const fallbackSlotSummary = getArtificerEldritchCannonFallbackSlotSummary(character);
  const cannonLimit = getArtificerEldritchCannonLimit(character);
  const activeCannonCount = getActiveArtificerEldritchCannonCount(character);
  const hasActiveCannon = activeCannonCount > 0;
  const cannonLimitReached = activeCannonCount >= cannonLimit;
  const canCreateAdditionalFortifiedPositionCannon =
    hasArtificerFortifiedPositionFeature(character) &&
    activeCannonCount === eldritchCannonBaseLimit &&
    !cannonLimitReached;
  const companionLimitReached = (character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT;
  const hasResource = usesRemaining > 0 || fallbackSlotOptions.length > 0;
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ELDRITCH_CANNON);
  const descriptionAdditions = getEldritchCannonActionDescriptionAdditions(character);
  const disabledReason = cannonLimitReached
    ? cannonLimit > 1
      ? "You already have two Eldritch Cannons present."
      : "You already have an Eldritch Cannon present."
    : companionLimitReached
      ? "Remove a companion before creating an Eldritch Cannon."
      : !hasResource
        ? "You need an Eldritch Cannon charge or an available spell slot."
        : undefined;

  return {
    key: artificerEldritchCannonActionKey,
    name: eldritchCannonName,
    sourceFeature: CLASS_FEATURE.ELDRITCH_CANNON,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create a chosen magical cannon.",
    detail: cannonLimitReached
      ? "Maximum Eldritch Cannons are present."
      : hasActiveCannon
        ? "Create a second Eldritch Cannon."
        : "Create a Flamethrower, Force Ballista, or Protector cannon.",
    breakdown: "Create magical cannon",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    economyMultiCount: canCreateAdditionalFortifiedPositionCannon ? 1 : undefined,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesOrResourceCardUsage(usesRemaining, usesTotal, spellSlotCost),
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      usesTotal,
      spellSlotCost,
      fallbackSlotSummary.remaining,
      fallbackSlotSummary.total,
      {
        label: "Spell Slots"
      },
      undefined,
      {
        isFallback: true
      }
    ),
    isActive: hasActiveCannon,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    descriptionAdditions,
    drawer: {
      kind: "custom-form",
      eyebrow: "Artillerist",
      description,
      descriptionAdditions,
      formKind: "artificer-eldritch-cannon",
      blockedReason: disabledReason
    },
    execute: {
      kind: "custom-form",
      formKind: "artificer-eldritch-cannon"
    }
  };
}

export function getArtificerEldritchCannonOptions(): FeatureActionOptionCard[] {
  return eldritchCannonOptions.map((option) => ({
    key: option.key,
    name: option.name,
    summary: option.summary,
    detail: option.detail,
    breakdown: option.breakdown,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description: [option.activationDescription]
  }));
}

export function createArtificerEldritchCannonForCharacter(
  character: Character,
  optionKey: ArtificerEldritchCannonOptionKey,
  spellSlotLevel: number | null
): Character {
  if (!hasArtificerEldritchCannonFeature(character)) {
    return character;
  }

  if (
    getActiveArtificerEldritchCannonCount(character) >=
    getArtificerEldritchCannonLimit(character)
  ) {
    return character;
  }

  if ((character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT) {
    return character;
  }

  const option = getEldritchCannonOption(optionKey);

  if (!option) {
    return character;
  }

  const characterWithResourceSpent = consumeEldritchCannonResource(character, spellSlotLevel);

  if (characterWithResourceSpent === character) {
    return character;
  }

  return {
    ...characterWithResourceSpent,
    companions: [
      ...(characterWithResourceSpent.companions ?? []),
      createEldritchCannonCompanion(characterWithResourceSpent, option)
    ]
  };
}

export function detonateArtificerEldritchCannon(
  character: Character,
  companionId?: string | null
): Character {
  if (!hasArtificerExplosiveCannonFeature(character)) {
    return character;
  }

  const eldritchCannonCompanions = getArtificerEldritchCannonCompanions(character);
  const detonatedCannon =
    companionId && companionId.length > 0
      ? (eldritchCannonCompanions.find((companion) => companion.id === companionId) ?? null)
      : (eldritchCannonCompanions[0] ?? null);

  if (!detonatedCannon) {
    return character;
  }

  return {
    ...character,
    companions: (character.companions ?? []).filter(
      (companion) => companion.id !== detonatedCannon.id
    )
  };
}

export function restoreArtificerEldritchCannonOnLongRest(character: Character): Character {
  if (!hasArtificerEldritchCannonFeature(character)) {
    return character;
  }

  if (getArtificerEldritchCannonUsesRemaining(character) >= eldritchCannonUsesTotal) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        artilleristEldritchCannonUsesExpended: 0
      }
    }
  };
}

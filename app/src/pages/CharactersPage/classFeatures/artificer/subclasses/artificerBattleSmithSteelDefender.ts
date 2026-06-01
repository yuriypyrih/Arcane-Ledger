import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterCompanion,
  type MonsterRecord
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { CHARACTER_COMPANION_LIMIT, createCharacterCompanionId } from "../../../companions";
import { getProficiencyBonus } from "../../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellSlots";
import { createTextCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureActionCard } from "../../types";
import {
  getArtificerBattleSmithArcaneJoltSpecialAbility,
  getArtificerBattleSmithImprovedDeflectionDescription
} from "./artificerBattleSmithArcaneJolt";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerSteelDefenderActionKey = "artificer-battle-smith-steel-defender";

const battleSmithSubclassId = "artificer-battle-smith";
const steelDefenderName = "Steel Defender";
const steelDefenderCompanionType = "Construct";
const legacySteelDefenderCompanionType = "Steel Defender";
const steelDefenderMonsterId = "artificer-battle-smith-steel-defender";
const steelDefenderDocumentTitle = "Eberron";

export type ArtificerSteelDefenderSpellSlotOption = {
  level: number;
  remaining: number;
  total: number;
};

type BattleSmithSteelDefenderCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "companions"
      | "customClass"
      | "feats"
      | "inventoryItems"
      | "level"
      | "spellSlotsExpended"
      | "statusEntries"
      | "subclassId"
    >
  >;

function getNormalizedCharacterLevel(character: Partial<Pick<Character, "level">>): number {
  return Math.max(1, Math.floor(character.level ?? 1));
}

function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function getDescriptionParagraphs(description: SpellDescriptionEntry[]): string[] {
  return description.flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items));
}

function stripDescriptionMarkup(description: string): string {
  return description
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<link:[^>]+>(.*?)<\/link>/g, "$1")
    .replace(/<spell:[^>]+>(.*?)<\/spell>/g, "$1");
}

function getSteelDefenderDescriptionText(character: BattleSmithSteelDefenderCharacter): string {
  return getDescriptionParagraphs(
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.STEEL_DEFENDER)
  )
    .map(stripDescriptionMarkup)
    .join("\n\n");
}

function getSteelDefenderDeflectAttackDescription(
  character: BattleSmithSteelDefenderCharacter
): string {
  const baseDescription =
    "The defender imposes disadvantage on the attack roll of one creature it can see that is within 5 feet of it, provided the attack roll is against a creature other than the defender.";
  const improvedDeflectionText = getDescriptionParagraphs(
    getArtificerBattleSmithImprovedDeflectionDescription(character)
  )
    .map(stripDescriptionMarkup)
    .join(" ");

  return [baseDescription, improvedDeflectionText].filter(Boolean).join(" ");
}

function getSpellSlotState(character: BattleSmithSteelDefenderCharacter) {
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

function getSteelDefenderMaximumHitPoints(character: BattleSmithSteelDefenderCharacter): number {
  const level = getNormalizedCharacterLevel(character);
  const intelligenceModifier = getAbilityModifierForCharacter(character, "INT");

  return Math.max(1, 2 + intelligenceModifier + 5 * level);
}

function getSteelDefenderSpellAttackModifier(
  character: BattleSmithSteelDefenderCharacter
): number {
  return (
    getAbilityModifierForCharacter(character, "INT") +
    getProficiencyBonus(getNormalizedCharacterLevel(character))
  );
}

function createSteelDefenderTemplate(character: BattleSmithSteelDefenderCharacter): MonsterRecord {
  const level = getNormalizedCharacterLevel(character);
  const proficiencyBonus = getProficiencyBonus(level);
  const spellAttackModifier = getSteelDefenderSpellAttackModifier(character);
  const passivePerception = 10 + proficiencyBonus * 2;
  const specialAbilities = [
    {
      name: "Vigilant",
      desc: "The defender can't be surprised."
    },
    getArtificerBattleSmithArcaneJoltSpecialAbility(character)
  ].filter((entry): entry is { name: string; desc: string } => entry !== null);

  return {
    id: steelDefenderMonsterId,
    slug: steelDefenderMonsterId,
    desc: getSteelDefenderDescriptionText(character),
    name: steelDefenderName,
    size: "Medium",
    type: "Construct",
    subtype: "",
    group: steelDefenderName,
    alignment: "Unaligned",
    armor_class: 15,
    armor_desc: "natural armor",
    hit_points: getSteelDefenderMaximumHitPoints(character),
    hit_dice: `${level}d8`,
    speed: { walk: 40 },
    strength: 14,
    dexterity: 12,
    constitution: 14,
    intelligence: 4,
    wisdom: 10,
    charisma: 6,
    strength_save: null,
    dexterity_save: 1 + proficiencyBonus,
    constitution_save: 2 + proficiencyBonus,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: proficiencyBonus * 2,
    skills: {
      athletics: 2 + proficiencyBonus,
      perception: proficiencyBonus * 2
    },
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "Poison",
    condition_immunities: "Charmed, Exhaustion, Poisoned",
    senses: `Darkvision 60 ft., passive Perception ${passivePerception}`,
    languages: "Understands the languages you speak",
    challenge_rating: "—",
    cr: 0,
    actions: [
      {
        name: "Force-Empowered Rend",
        desc: `Melee Weapon Attack: ${formatSignedNumber(
          spellAttackModifier
        )} to hit, reach 5 ft., one target you can see. Hit: 1d8 + ${proficiencyBonus} force damage.`
      },
      {
        name: "Repair (3/Day)",
        desc: `The magical mechanisms inside the defender restore 2d8 + ${proficiencyBonus} hit points to itself or to one construct or object within 5 feet of it.`
      }
    ],
    bonus_actions: null,
    reactions: [
      {
        name: "Deflect Attack",
        desc: getSteelDefenderDeflectAttackDescription(character)
      }
    ],
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: specialAbilities,
    spell_list: [],
    page_no: null,
    environments: [],
    img_main: null,
    document__slug: "",
    document__title: steelDefenderDocumentTitle,
    document__license_url: "",
    document__url: "",
    v2_converted_path: ""
  };
}

function createSteelDefenderCompanion(
  character: BattleSmithSteelDefenderCharacter
): CharacterCompanion {
  const maximumHitPoints = getSteelDefenderMaximumHitPoints(character);

  return {
    id: createCharacterCompanionId(),
    name: steelDefenderName,
    description: "",
    type: steelDefenderCompanionType,
    maxHitPoints: maximumHitPoints,
    currentHitPoints: maximumHitPoints,
    temporaryHitPoints: 0,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    inheritedCreatureEntry: createSteelDefenderTemplate(character)
  };
}

function consumeSteelDefenderSpellSlot(character: Character, spellSlotLevel: number | null) {
  if (spellSlotLevel === null) {
    return character;
  }

  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotTotals, spellSlotsExpended, spellSlotsRemaining } =
    getSpellSlotState(character);
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

export function isArtificerSteelDefenderCompanion(
  companion: Pick<CharacterCompanion, "type" | "inheritedCreatureEntry">
): boolean {
  return (
    companion.type === legacySteelDefenderCompanionType ||
    companion.inheritedCreatureEntry?.id === steelDefenderMonsterId
  );
}

export function hasActiveArtificerSteelDefender(
  character: Partial<Pick<Character, "companions">>
): boolean {
  return (character.companions ?? []).some(isArtificerSteelDefenderCompanion);
}

export function hasArtificerSteelDefenderFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, battleSmithSubclassId, 3);
}

export function getArtificerSteelDefenderSpellSlotOptions(
  character: BattleSmithSteelDefenderCharacter
): ArtificerSteelDefenderSpellSlotOption[] {
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

export function getArtificerSteelDefenderAction(
  character: BattleSmithSteelDefenderCharacter
): FeatureActionCard | null {
  if (!hasArtificerSteelDefenderFeature(character)) {
    return null;
  }

  const hasActiveDefender = hasActiveArtificerSteelDefender(character);
  const companionLimitReached =
    !hasActiveDefender && (character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT;
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.STEEL_DEFENDER);
  const disabledReason = companionLimitReached
    ? "Remove a companion before creating a Steel Defender."
    : undefined;

  return {
    key: artificerSteelDefenderActionKey,
    name: steelDefenderName,
    sourceFeature: CLASS_FEATURE.STEEL_DEFENDER,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create your construct companion.",
    detail: hasActiveDefender
      ? "Replace your current Steel Defender."
      : "Create a Steel Defender companion.",
    breakdown: "Create construct companion",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    cardUsage: createTextCardUsage("Optional Spell Slot"),
    isActive: hasActiveDefender,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "custom-form",
      eyebrow: "Battle Smith",
      description,
      formKind: "artificer-steel-defender",
      blockedReason: disabledReason
    },
    execute: {
      kind: "custom-form",
      formKind: "artificer-steel-defender"
    }
  };
}

export function createArtificerSteelDefenderForCharacter(
  character: Character,
  spellSlotLevel: number | null
): Character {
  if (!hasArtificerSteelDefenderFeature(character)) {
    return character;
  }

  const existingDefenders = (character.companions ?? []).filter(isArtificerSteelDefenderCompanion);

  if (
    existingDefenders.length <= 0 &&
    (character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT
  ) {
    return character;
  }

  const characterWithSpellSlotSpent = consumeSteelDefenderSpellSlot(character, spellSlotLevel);

  if (spellSlotLevel !== null && characterWithSpellSlotSpent === character) {
    return character;
  }

  return {
    ...characterWithSpellSlotSpent,
    companions: [
      ...(characterWithSpellSlotSpent.companions ?? []).filter(
        (companion) => !isArtificerSteelDefenderCompanion(companion)
      ),
      createSteelDefenderCompanion(characterWithSpellSlotSpent)
    ]
  };
}

import { CLASS_FEATURE, WEAPON_COMBAT_TYPE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { AbilityModifierBonusEntry } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getProficiencyBonus, type WeaponAction } from "../../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { appendWeaponActionCardBonusLabel } from "../../../weaponActionCardBreakdown";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  paladinChannelDivinityActionKey,
  paladinChannelDivinityOptionKeys
} from "../../channelDivinity";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureDamageBonus } from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import {
  expendPaladinChannelDivinityUse,
  hasActivePaladinAuraOfProtection,
  hasPaladinFeature,
  getPaladinChannelDivinityUsesRemaining,
  paladinsSmiteActionKey
} from "../paladin";

export const oathOfDevotionSubclassId = "paladin-oath-of-devotion";
export const paladinOathOfDevotionSacredWeaponStatusSourceId =
  "feature-paladin-oath-of-devotion-sacred-weapon";
export const paladinOathOfDevotionAuraOfDevotionStatusSourceId =
  "feature-paladin-oath-of-devotion-aura-of-devotion";
export const paladinOathOfDevotionAuraOfDevotionImmunitySourceId =
  "feature-paladin-oath-of-devotion-aura-of-devotion-immunity";
export const holyNimbusActionKey = "paladin-holy-nimbus";
export const paladinOathOfDevotionHolyNimbusStatusSourceId =
  "feature-paladin-oath-of-devotion-holy-nimbus";

const oathOfDevotionSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Protection from Evil and Good", "Shield of Faith"]),
  5: resolveSpellIdsByName(["Aid", "Zone of Truth"]),
  9: resolveSpellIdsByName(["Beacon of Hope", "Dispel Magic"]),
  13: resolveSpellIdsByName(["Freedom of Movement", "Guardian of Faith"]),
  17: resolveSpellIdsByName(["Commune", "Flame Strike"])
} as const;
const sacredWeaponEffectName = "Sacred Weapon";
const sacredWeaponAttackBonusLabel = "Sacred Weapons";
const sacredWeaponActiveDescription = [
  "While this trait lasts, your melee weapon and unarmed strike attack rolls gain a bonus equal to your CHA modifier, minimum bonus of +1.",
  "Each hit can deal its normal main damage type or Radiant damage."
] as const;
const auraOfDevotionName = "Aura of Devotion";
const holyNimbusName = "Holy Nimbus";
const holyNimbusUsesTotal = 1;
const holyNimbusFallbackSpellSlotLevel = 5;
const oathOfDevotionSubclassEntry = getSubclassEntryById(oathOfDevotionSubclassId);

type PaladinOathOfDevotionCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "level"
      | "spellSlotsExpended"
      | "statusEntries"
      | "subclassId"
    >
  >;

type SacredWeaponAction = Pick<WeaponAction, "attackKind" | "combatType">;

export type PaladinOathOfDevotionSacredWeaponOptionState = {
  active: boolean;
  disabled: boolean;
  disabledReason?: string;
};

function getOathOfDevotionFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = oathOfDevotionSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const smiteOfProtectionDescription = getOathOfDevotionFeatureDescriptionEntries(
  CLASS_FEATURE.SMITE_OF_PROTECTION
);
const holyNimbusDescription = getOathOfDevotionFeatureDescriptionEntries(CLASS_FEATURE.HOLY_NIMBUS);

function getWisdomModifier(character: Partial<Pick<Character, "abilities">>): number {
  const wisdomScore = character.abilities?.WIS;

  if (typeof wisdomScore !== "number" || !Number.isFinite(wisdomScore)) {
    return 0;
  }

  return Math.floor((wisdomScore - 10) / 2);
}

function getCharismaModifier(character: Partial<Pick<Character, "abilities">>): number {
  const charismaScore = character.abilities?.CHA;

  if (typeof charismaScore !== "number" || !Number.isFinite(charismaScore)) {
    return 0;
  }

  return Math.floor((charismaScore - 10) / 2);
}

function getChannelDivinityUsesRemaining(character: PaladinOathOfDevotionCharacter): number {
  return getPaladinChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState ?? {}
  });
}

function isPaladinOathOfDevotion(character: PaladinOathOfDevotionCharacter): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfDevotionSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasPaladinOathOfDevotionAuraOfDevotion(
  character: PaladinOathOfDevotionCharacter
): boolean {
  return isPaladinOathOfDevotion(character) && (character.level ?? 0) >= 7;
}

export function hasPaladinOathOfDevotionHolyNimbusFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfDevotionSubclassId &&
    (character.level ?? 0) >= 20
  );
}

function getPaladinAuraRangeFeet(character: PaladinOathOfDevotionCharacter): number {
  return hasPaladinFeature(
    {
      className: character.className,
      level: character.level ?? 0
    },
    CLASS_FEATURE.AURA_EXPANSION
  )
    ? 30
    : 10;
}

export function getPaladinOathOfDevotionHolyNimbusUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfDevotionHolyNimbusFeature(character) ? holyNimbusUsesTotal : 0;
}

export function getPaladinOathOfDevotionHolyNimbusUsesRemaining(
  character: PaladinOathOfDevotionCharacter
): number {
  const totalUses = getPaladinOathOfDevotionHolyNimbusUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.holyNimbusUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getPaladinOathOfDevotionHolyNimbusFallbackSlotSummary(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): { total: number; remaining: number } {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = holyNimbusFallbackSpellSlotLevel - 1;
  const total = spellSlotTotals[slotIndex] ?? 0;

  return {
    total,
    remaining: Math.max(0, total - (spellSlotsExpended[slotIndex] ?? 0))
  };
}

function getPaladinOathOfDevotionHolyNimbusFallbackSlotLevel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  return getPaladinOathOfDevotionHolyNimbusFallbackSlotSummary(character).remaining > 0
    ? holyNimbusFallbackSpellSlotLevel
    : null;
}

export function hasActivePaladinOathOfDevotionHolyNimbus(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfDevotionHolyNimbusFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfDevotionHolyNimbusStatusSourceId
  );
}

export function hasPaladinOathOfDevotionSacredWeapon(
  character: PaladinOathOfDevotionCharacter
): boolean {
  return isPaladinOathOfDevotion(character);
}

export function isPaladinOathOfDevotionSacredWeaponActive(
  character: PaladinOathOfDevotionCharacter
): boolean {
  if (!hasPaladinOathOfDevotionSacredWeapon(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfDevotionSacredWeaponStatusSourceId
  );
}

function isSacredWeaponEligibleAction(action: SacredWeaponAction | null): boolean {
  return (
    action?.attackKind === "unarmed" ||
    (action?.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

export function getPaladinOathOfDevotionSacredWeaponOptionState(
  character: PaladinOathOfDevotionCharacter,
  action: SacredWeaponAction | null
): PaladinOathOfDevotionSacredWeaponOptionState | null {
  if (!hasPaladinOathOfDevotionSacredWeapon(character) || !isSacredWeaponEligibleAction(action)) {
    return null;
  }

  let disabledReason: string | undefined;

  const isActive = isPaladinOathOfDevotionSacredWeaponActive(character);

  if (isActive) {
    disabledReason = "Sacred Weapon is already active.";
  } else if (getChannelDivinityUsesRemaining(character) <= 0) {
    disabledReason = "No Channel Divinity uses remaining.";
  }

  return {
    active: isActive,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function getPaladinOathOfDevotionHolyNimbusRadiantDamageFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "abilities" | "level">>
): string {
  const wisdomModifier = getWisdomModifier(character);
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const totalRadiantDamage = wisdomModifier + proficiencyBonus;

  return `${totalRadiantDamage} Radiant Damage = ${wisdomModifier} WIS + ${proficiencyBonus} Prof Bonus`;
}

export function activatePaladinOathOfDevotionSacredWeapon(character: Character): Character {
  if (
    !hasPaladinOathOfDevotionSacredWeapon(character) ||
    isPaladinOathOfDevotionSacredWeaponActive(character) ||
    getChannelDivinityUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const nextCharacter = expendPaladinChannelDivinityUse(character);

  if (nextCharacter === character) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfDevotionSacredWeaponStatusSourceId
  );

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: sacredWeaponEffectName,
        source: sacredWeaponEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: paladinOathOfDevotionSacredWeaponStatusSourceId
      })
    ]
  };
}

export function applyPaladinOathOfDevotionHolyNimbusStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfDevotionHolyNimbusStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: holyNimbusName,
        source: holyNimbusName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: paladinOathOfDevotionHolyNimbusStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfDevotionHolyNimbus(character: Character): Character {
  if (
    !hasPaladinOathOfDevotionHolyNimbusFeature(character) ||
    hasActivePaladinOathOfDevotionHolyNimbus(character)
  ) {
    return character;
  }

  const usesRemaining = getPaladinOathOfDevotionHolyNimbusUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const paladinState = character.classFeatureState?.paladin ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          holyNimbusUsesExpended: (paladinState.holyNimbusUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getPaladinOathOfDevotionHolyNimbusFallbackSlotLevel(character);

    if (fallbackSlotLevel === null) {
      return character;
    }

    const spellSlotTotals = getSpellSlotTotalsForCharacter(
      character.className,
      character.level,
      character.subclassId
    );
    const spellSlotsExpended = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      spellSlotTotals
    );
    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[fallbackSlotLevel - 1] =
      (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

    nextCharacter = {
      ...character,
      spellSlotsExpended: nextSpellSlotsExpended
    };
  }

  return applyPaladinOathOfDevotionHolyNimbusStatus(nextCharacter);
}

export function restorePaladinOathOfDevotionHolyNimbusOnLongRest(character: Character): Character {
  if (!hasPaladinOathOfDevotionHolyNimbusFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.holyNimbusUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        holyNimbusUsesExpended: 0
      }
    }
  };
}

function getDamageBonusLabel(entry: FeatureDamageBonus): string | null {
  if (entry.displayLabel) {
    return entry.displayLabel;
  }

  if (entry.formula) {
    return entry.formula;
  }

  return null;
}

function stripWeaponDamageBonusLabels(
  damageLabel: string,
  damageBonuses: readonly FeatureDamageBonus[]
): string {
  return [...damageBonuses].reverse().reduce((currentLabel, entry) => {
    const bonusLabel = getDamageBonusLabel(entry);

    if (!bonusLabel) {
      return currentLabel;
    }

    const suffix = ` + ${bonusLabel}`;
    return currentLabel.endsWith(suffix) ? currentLabel.slice(0, -suffix.length) : currentLabel;
  }, damageLabel);
}

function buildWeaponDamageLabel(
  baseDamageLabel: string,
  damageBonuses: readonly FeatureDamageBonus[]
): string {
  const bonusLabels = damageBonuses
    .map(getDamageBonusLabel)
    .filter((label): label is string => Boolean(label));

  return bonusLabels.length > 0 ? [baseDamageLabel, ...bonusLabels].join(" + ") : baseDamageLabel;
}

function addRadiantDamageTypeOption(baseDamageLabel: string): string {
  const match = baseDamageLabel.trim().match(/^(.*?)(\s+([A-Za-z]+(?:\/[A-Za-z]+)*))$/);

  if (!match) {
    return baseDamageLabel;
  }

  const damageTypes = match[3]
    .split("/")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (damageTypes.some((entry) => entry.toLowerCase() === "radiant")) {
    return baseDamageLabel;
  }

  return `${match[1].trim()} ${[...damageTypes, "Radiant"].join("/")}`;
}

function getSacredWeaponAttackBonusEntries(
  action: WeaponAction,
  attackBonus: number
): AbilityModifierBonusEntry[] {
  const existingEntries = action.abilityModifierBonusEntries.filter(
    (entry) => entry.label !== sacredWeaponAttackBonusLabel
  );

  return attackBonus === 0
    ? existingEntries
    : [
        ...existingEntries,
        {
          label: sacredWeaponAttackBonusLabel,
          value: attackBonus
        }
      ];
}

export function applyPaladinOathOfDevotionSacredWeaponAction(
  character: Partial<Pick<Character, "abilities">>,
  action: WeaponAction
): WeaponAction {
  if (!isSacredWeaponEligibleAction(action)) {
    return action;
  }

  const baseDamageLabel = stripWeaponDamageBonusLabels(
    action.damageLabel,
    action.damageBonusEntries
  );
  const nextBaseDamageLabel = addRadiantDamageTypeOption(baseDamageLabel);
  const attackBonus = Math.max(1, getCharismaModifier(character));
  const currentSacredWeaponAttackBonus = action.abilityModifierBonusEntries
    .filter((entry) => entry.label === sacredWeaponAttackBonusLabel)
    .reduce((total, entry) => total + entry.value, 0);
  const nextAbilityModifierBonusEntries = getSacredWeaponAttackBonusEntries(action, attackBonus);
  const nextAbilityModifier = action.abilityModifier - currentSacredWeaponAttackBonus + attackBonus;

  return {
    ...action,
    abilityModifier: nextAbilityModifier,
    abilityModifierBonusEntries: nextAbilityModifierBonusEntries,
    damageLabel: buildWeaponDamageLabel(nextBaseDamageLabel, action.damageBonusEntries)
  };
}

function transformSacredWeaponAction(
  character: PaladinOathOfDevotionCharacter,
  action: WeaponAction
): WeaponAction {
  if (
    !isPaladinOathOfDevotionSacredWeaponActive(character) ||
    !isSacredWeaponEligibleAction(action)
  ) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    appendWeaponActionCardBonusLabel(
      applyPaladinOathOfDevotionSacredWeaponAction(character, action),
      sacredWeaponEffectName
    ),
    character,
    CLASS_FEATURE.SACRED_WEAPON,
    sacredWeaponActiveDescription,
    sacredWeaponEffectName
  );
}

function getPaladinOathOfDevotionDerivedStatusEntries(
  character: PaladinOathOfDevotionCharacter
): DerivedFeatureStatusEntry[] {
  if (
    !hasPaladinOathOfDevotionAuraOfDevotion(character) ||
    !hasActivePaladinAuraOfProtection({
      className: character.className,
      level: character.level ?? 0,
      statusEntries: character.statusEntries ?? []
    })
  ) {
    return [];
  }

  return [
    {
      id: paladinOathOfDevotionAuraOfDevotionStatusSourceId,
      sourceId: paladinOathOfDevotionAuraOfDevotionStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: auraOfDevotionName,
      source: auraOfDevotionName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    },
    {
      id: paladinOathOfDevotionAuraOfDevotionImmunitySourceId,
      sourceId: paladinOathOfDevotionAuraOfDevotionImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: auraOfDevotionName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function hasPaladinOathOfDevotionSmiteOfProtection(
  character: PaladinOathOfDevotionCharacter
): boolean {
  return isPaladinOathOfDevotion(character) && (character.level ?? 0) >= 15;
}

function getPaladinOathOfDevotionFeatureActions(
  character: PaladinOathOfDevotionCharacter
): FeatureActionCard[] {
  if (!hasPaladinOathOfDevotionHolyNimbusFeature(character)) {
    return [];
  }

  const usesRemaining = getPaladinOathOfDevotionHolyNimbusUsesRemaining(character);
  const fallbackSlotSummary = getPaladinOathOfDevotionHolyNimbusFallbackSlotSummary(character);
  const showFallbackSlotInfo = usesRemaining <= 0 && fallbackSlotSummary.total > 0;
  const hasFallbackSlot = showFallbackSlotInfo && fallbackSlotSummary.remaining > 0;
  const isActive = hasActivePaladinOathOfDevotionHolyNimbus(character);

  return [
    {
      key: holyNimbusActionKey,
      name: holyNimbusName,
      summary: "Imbue your aura with holy power.",
      detail: "Empower your Aura of Protection for 10 minutes.",
      breakdown: "Holy aura empowerment",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        holyNimbusUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        })
      ),
      usesRemaining,
      usesTotal: holyNimbusUsesTotal,
      usesInlineLabel: showFallbackSlotInfo ? "| Use 5th Spell Slot" : undefined,
      description: [...holyNimbusDescription],
      facts: [
        {
          label: "Radiant Damage Formula",
          value: getPaladinOathOfDevotionHolyNimbusRadiantDamageFormula(character),
          fullWidth: true
        }
      ],
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        holyNimbusUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        }),
        fallbackSlotSummary.remaining,
        fallbackSlotSummary.total,
        {
          label: "Spell Slots"
        }
      ),
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of Devotion",
        factsSectionTitle: null
      },
      execute: {
        kind: "activate"
      },
      isActive,
      disabled: isActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: isActive
        ? "Holy Nimbus is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Holy Nimbus use or level 5 spell slots remaining."
          : undefined
    }
  ];
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function appendSmiteOfProtectionDescription(
  character: PaladinOathOfDevotionCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (action.key !== paladinsSmiteActionKey) {
    return action;
  }

  const nextAction =
    action.description?.length && action.description.length > 0
      ? action
      : {
          ...action,
          description: createDefaultFeatureActionDescription(action)
        };

  return appendFeatureSourcedDescriptionAddition(
    nextAction,
    character,
    CLASS_FEATURE.SMITE_OF_PROTECTION,
    smiteOfProtectionDescription,
    "Smite of Protection"
  );
}

function collectPaladinOathOfDevotionContributions(
  character: PaladinOathOfDevotionCharacter
): FeatureContributionSpec[] {
  if (!isPaladinOathOfDevotion(character)) {
    return [];
  }

  const featureActions = getPaladinOathOfDevotionFeatureActions(character);
  const channelDivinityCharacter = {
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  };
  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-devotion-spells",
        label: "Oath of Devotion Spells",
        entryId: CLASS_FEATURE.OATH_OF_DEVOTION_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        oathOfDevotionSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-devotion-sacred-weapon",
        label: sacredWeaponEffectName,
        entryId: CLASS_FEATURE.SACRED_WEAPON
      }),
      actionOptions: {
        [paladinChannelDivinityActionKey]: [
          {
            key: paladinChannelDivinityOptionKeys.sacredWeapon,
            name: sacredWeaponEffectName,
            summary: "Empower a melee weapon",
            detail: "Spend 1 Channel Divinity to create a 10-minute Sacred Weapon trait.",
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.FEATURE,
            resultLabel: "Effect",
            breakdown: "10-minute weapon blessing",
            description: getOathOfDevotionFeatureDescriptionEntries(CLASS_FEATURE.SACRED_WEAPON),
            disabled:
              isPaladinOathOfDevotionSacredWeaponActive(character) ||
              getPaladinChannelDivinityUsesRemaining(channelDivinityCharacter) <= 0,
            disabledReason: isPaladinOathOfDevotionSacredWeaponActive(character)
              ? "Sacred Weapon is already active."
              : getPaladinChannelDivinityUsesRemaining(channelDivinityCharacter) <= 0
                ? "No Channel Divinity uses remaining."
                : undefined
          }
        ]
      },
      weaponActionTransforms: [
        {
          id: "paladin-oath-of-devotion-sacred-weapon-transform",
          transform: (_character, action) =>
            transformSacredWeaponAction(character, action as WeaponAction)
        }
      ]
    }
  ];

  if (hasPaladinOathOfDevotionAuraOfDevotion(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-devotion-aura-of-devotion",
        label: auraOfDevotionName,
        entryId: CLASS_FEATURE.AURA_OF_DEVOTION
      }),
      statuses: getPaladinOathOfDevotionDerivedStatusEntries(character)
    });
  }

  if (hasPaladinOathOfDevotionSmiteOfProtection(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-devotion-smite-of-protection",
        label: "Smite of Protection",
        entryId: CLASS_FEATURE.SMITE_OF_PROTECTION
      }),
      featureActionTransforms: [
        {
          id: "paladin-oath-of-devotion-smite-of-protection-transform",
          transform: (action) => appendSmiteOfProtectionDescription(character, action)
        }
      ]
    });
  }

  if (hasPaladinOathOfDevotionHolyNimbusFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-devotion-holy-nimbus",
        label: holyNimbusName,
        entryId: CLASS_FEATURE.HOLY_NIMBUS
      }),
      actions: getFeatureActionByKey(featureActions, holyNimbusActionKey)
    });
  }

  return contributions;
}

export const getPaladinOathOfDevotionDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectPaladinOathOfDevotionContributions(character)),
    {
      character: character as Character
    }
  );

import {
  CLASS_FEATURE,
  DICE,
  DAMAGE_TYPE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type SpellDescriptionEntry,
  type WeaponDamage
} from "../../../../../codex/entries";
import {
  ARMOR_PROFICIENCY,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type ArtificerArmorerArmorModel,
  type Character,
  type CharacterArtificerFeatureState
} from "../../../../../types";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../../../../utils/codex";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  getBodyArmorCandidateByKeyForCharacter,
  getWornBodyArmorCandidateForCharacter
} from "../../../armor";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../../combat";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { createWeaponAction, getProficiencyBonus, type WeaponAction } from "../../../gameplay";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard, FeatureActionOptionCard } from "../../types";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";
import {
  createArtificerArmorProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const armorerSubclassId = "artificer-armorer";
export const artificerArmorerArcaneArmorActionKey = "artificer-armorer-arcane-armor";
export const artificerArmorerGiantStatureActionKey = "artificer-armorer-giant-stature";

const armorerSpellIdsByLevel = {
  3: ["spell-magic-missile", "spell-thunderwave"],
  5: ["spell-mirror-image", "spell-shatter"],
  9: ["spell-hypnotic-pattern", "spell-lightning-bolt"],
  13: ["spell-fire-shield", "spell-greater-invisibility"],
  17: ["spell-passwall", "spell-wall-of-force"]
} as const;

const armorerToolsSource = "Armorer: Tools of the Trade";
const arcaneArmorName = "Arcane Armor";
const arcaneArmorTagLabel = "Arcane Armor";
const forceDemolisherName = "Force Demolisher";
const giantStatureName = "Giant Stature";
const giantStatureStatusSourceId = "artificer-armorer-giant-stature";
const forceDemolisherWeaponActionKey = "artificer-armorer-force-demolisher";
const forceDemolisherDamage: WeaponDamage = [[DICE.D10, DAMAGE_TYPE.FORCE]];
const armorModelLabels: Record<ArtificerArmorerArmorModel, string> = {
  dreadnaught: "Dreadnaught",
  guardian: "Guardian",
  infiltrator: "Infiltrator"
};
const armorModelOptionKeys: ArtificerArmorerArmorModel[] = [
  "dreadnaught",
  "guardian",
  "infiltrator"
];

type ArmorerArcaneArmorCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "customEquipment"
      | "equipment"
      | "inventoryItems"
      | "level"
      | "roundTracker"
      | "statusEntries"
      | "subclassId"
    >
  >;

function hasArtificerArmorerArcaneArmorFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, armorerSubclassId, 3);
}

function hasArtificerArmorerArmorModelFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, armorerSubclassId, 3);
}

export function hasArtificerArmorerExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, armorerSubclassId, 5);
}

function isArtificerArmorerArmorModel(value: string): value is ArtificerArmorerArmorModel {
  return value in armorModelLabels;
}

function getArtificerArmorerAdditionalAttackCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerArmorerExtraAttackFeature(character) ? 1 : 0;
}

function normalizeArmorerUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function getArmorModelDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ARMOR_MODEL);
}

function getArmorModelDescriptionSection(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string
): SpellDescriptionEntry[] {
  const marker = `<strong>${heading}</strong>`;
  const description = getArmorModelDescription(character);
  const startIndex = description.findIndex(
    (entry) => typeof entry === "string" && entry.includes(marker)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: SpellDescriptionEntry[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && typeof entry === "string" && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

function stripDescriptionMarkup(value: string): string {
  return value
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<link:[^>]+>(.*?)<\/link>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPlainTextDescription(
  description: readonly SpellDescriptionEntry[],
  headingToStrip?: string
): string {
  const text = description
    .flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items))
    .map(stripDescriptionMarkup)
    .filter(Boolean)
    .join("\n\n");

  return headingToStrip
    ? text.replace(new RegExp(`^${escapeRegExp(headingToStrip)}\\s*`), "").trim()
    : text;
}

export function getArtificerArmorerArcaneArmorTargetKey(
  character: Pick<Character, "classFeatureState"> | Partial<Pick<Character, "classFeatureState">>
): string | null {
  const targetKey = character.classFeatureState?.artificer?.armorerArcaneArmorTargetKey?.trim();

  return targetKey && targetKey.length > 0 ? targetKey : null;
}

function getArtificerArmorerArcaneArmorTarget(character: ArmorerArcaneArmorCharacter) {
  const targetKey = getArtificerArmorerArcaneArmorTargetKey({
    classFeatureState: character.classFeatureState ?? {}
  });

  return targetKey
    ? getBodyArmorCandidateByKeyForCharacter(
        {
          equipment: character.equipment ?? [],
          inventoryItems: character.inventoryItems ?? [],
          customEquipment: character.customEquipment ?? []
        },
        targetKey
      )
    : null;
}

export function getArtificerArmorerArmorModel(
  character: Pick<Character, "classFeatureState"> | Partial<Pick<Character, "classFeatureState">>
): ArtificerArmorerArmorModel | null {
  const model = character.classFeatureState?.artificer?.armorerArmorModel;

  return model && isArtificerArmorerArmorModel(model) ? model : null;
}

function hasSelectedArtificerArmorerArmorModel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>,
  armorModel: ArtificerArmorerArmorModel
): boolean {
  return (
    hasArtificerArmorerArmorModelFeature(character) &&
    getArtificerArmorerArmorModel({
      classFeatureState: character.classFeatureState ?? {}
    }) === armorModel
  );
}

function hasActiveArtificerArmorerArmorModel(
  character: ArmorerArcaneArmorCharacter,
  armorModel: ArtificerArmorerArmorModel
): boolean {
  if (!hasSelectedArtificerArmorerArmorModel(character, armorModel)) {
    return false;
  }

  const wornArmor = getWornBodyArmorCandidateForCharacter({
    equipment: character.equipment ?? [],
    inventoryItems: character.inventoryItems ?? [],
    customEquipment: character.customEquipment ?? []
  });

  return Boolean(
    wornArmor &&
      getArtificerArmorerArcaneArmorTargetKey({
        classFeatureState: character.classFeatureState ?? {}
      }) === wornArmor.key
  );
}

export function getArtificerArmorerArcaneArmorTagLabelsForArmorKey(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>,
  armorKey: string | null | undefined,
  options?: { includeModel?: boolean }
): string[] {
  if (!armorKey || !hasArtificerArmorerArcaneArmorFeature(character)) {
    return [];
  }

  const isTargetArmor =
    getArtificerArmorerArcaneArmorTargetKey({
      classFeatureState: character.classFeatureState ?? {}
    }) === armorKey;

  if (!isTargetArmor) {
    return [];
  }

  const armorModel = getArtificerArmorerArmorModel({
    classFeatureState: character.classFeatureState ?? {}
  });

  return options?.includeModel && armorModel
    ? [`${arcaneArmorTagLabel}: ${armorModelLabels[armorModel]}`]
    : [arcaneArmorTagLabel];
}

export function normalizeArtificerArmorerState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): Pick<
  CharacterArtificerFeatureState,
  | "armorerArcaneArmorTargetKey"
  | "armorerArmorModel"
  | "armorerGiantStatureUsesExpended"
  | "extraAttacksRemainingThisTurn"
> {
  if (!hasArtificerArmorerArcaneArmorFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const targetKey = record.armorerArcaneArmorTargetKey?.trim();
  const armorModel =
    typeof record.armorerArmorModel === "string" &&
    isArtificerArmorerArmorModel(record.armorerArmorModel)
      ? record.armorerArmorModel
      : null;
  const additionalAttackCount = getArtificerArmorerAdditionalAttackCount(character);
  const extraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);
  const giantStatureUsesTotal = getArtificerArmorerGiantStatureMaximumUses(character);
  const armorerGiantStatureUsesExpended =
    giantStatureUsesTotal > 0
      ? normalizeArmorerUsesExpended(record.armorerGiantStatureUsesExpended, giantStatureUsesTotal)
      : undefined;

  return {
    armorerArcaneArmorTargetKey: targetKey || undefined,
    armorerArmorModel:
      armorModel && hasArtificerArmorerArmorModelFeature(character) ? armorModel : undefined,
    armorerGiantStatureUsesExpended,
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0
        ? Number.isFinite(extraAttacksRemainingThisTurn)
          ? Math.max(0, Math.min(additionalAttackCount, Math.floor(extraAttacksRemainingThisTurn)))
          : 0
        : undefined
  };
}

export function getArtificerArmorerArcaneArmorAction(
  character: ArmorerArcaneArmorCharacter
): FeatureActionCard | null {
  if (!hasArtificerArmorerArcaneArmorFeature(character)) {
    return null;
  }

  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ARCANE_ARMOR);
  const wornArmor = getWornBodyArmorCandidateForCharacter({
    equipment: character.equipment ?? [],
    inventoryItems: character.inventoryItems ?? [],
    customEquipment: character.customEquipment ?? []
  });
  const activeArmor = getArtificerArmorerArcaneArmorTarget(character);
  const armorModel = getArtificerArmorerArmorModel({
    classFeatureState: character.classFeatureState ?? {}
  });
  const armorModelDescription = getArmorModelDescription(character);
  const armorModelDescriptionAddition =
    armorModelDescription.length > 0
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.ARMOR_MODEL,
          armorModelDescription
        )
      : [];
  const disabledReason = wornArmor
    ? undefined
    : "Wear a suit of armor to turn it into Arcane Armor.";

  return {
    key: artificerArmorerArcaneArmorActionKey,
    name: arcaneArmorName,
    sourceFeature: CLASS_FEATURE.ARCANE_ARMOR,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Imbue worn armor with Artificer magic.",
    detail: activeArmor
      ? `${activeArmor.name} is your${
          armorModel ? ` ${armorModelLabels[armorModel]}` : ""
        } Arcane Armor.`
      : "Use Smith's Tools to turn your worn armor into Arcane Armor.",
    breakdown: activeArmor ? "Armor imbued" : "Imbue worn armor",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description,
    drawer: {
      kind: "options",
      eyebrow: "Armorer",
      description,
      descriptionAdditions:
        armorModelDescriptionAddition.length > 0 ? [armorModelDescriptionAddition] : [],
      optionSelection: "single-confirm",
      blockedReason: disabledReason
    },
    execute: {
      kind: "option"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function getArtificerArmorerArcaneArmorOptions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureActionOptionCard[] {
  if (!hasArtificerArmorerArmorModelFeature(character)) {
    return [];
  }

  return armorModelOptionKeys.map((key) => ({
    key,
    name: armorModelLabels[key],
    presentation: "plain",
    summary: "",
    detail: "",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC
  }));
}

export function activateArtificerArmorerArcaneArmor(
  character: Character,
  armorModel: ArtificerArmorerArmorModel | null = null
): Character {
  if (!hasArtificerArmorerArcaneArmorFeature(character)) {
    return character;
  }

  if (!armorModel) {
    return character;
  }

  const wornArmor = getWornBodyArmorCandidateForCharacter(character);

  if (!wornArmor) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};

  if (
    artificerState.armorerArcaneArmorTargetKey === wornArmor.key &&
    artificerState.armorerArmorModel === armorModel
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        armorerArcaneArmorTargetKey: wornArmor.key,
        armorerArmorModel: armorModel
      }
    }
  };
}

export function activateArtificerArmorerArcaneArmorOption(
  character: Character,
  optionKey: string
): Character {
  return isArtificerArmorerArmorModel(optionKey)
    ? activateArtificerArmorerArcaneArmor(character, optionKey)
    : character;
}

function getForceDemolisherDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Dreadnaught: Force Demolisher.");
}

function getGiantStatureDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Dreadnaught: Giant Stature.");
}

function getGiantStatureStatusDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string {
  const description = getPlainTextDescription(
    getGiantStatureDescription(character),
    "Dreadnaught: Giant Stature."
  );

  return description || "You transform and enlarge your Arcane Armor for 1 minute.";
}

function isGiantStatureStatusEntry(entry: { sourceId?: string }) {
  return entry.sourceId === giantStatureStatusSourceId;
}

export function hasActiveArtificerArmorerGiantStature(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(isGiantStatureStatusEntry);
}

function getArtificerArmorerGiantStatureMaximumUses(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return hasArtificerArmorerArmorModelFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function getArtificerArmorerGiantStatureUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return hasSelectedArtificerArmorerArmorModel(character, "dreadnaught")
    ? getArtificerArmorerGiantStatureMaximumUses(character)
    : 0;
}

export function getArtificerArmorerGiantStatureUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  const total = getArtificerArmorerGiantStatureUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  const expended = normalizeArmorerUsesExpended(
    character.classFeatureState?.artificer?.armorerGiantStatureUsesExpended,
    total
  );

  return Math.max(0, total - expended);
}

function getArtificerArmorerForceDemolisherWeaponAction(
  character: ArmorerArcaneArmorCharacter
): WeaponAction | null {
  if (!hasActiveArtificerArmorerArmorModel(character, "dreadnaught")) {
    return null;
  }

  const damageFormula = formatWeaponDamageFormula(forceDemolisherDamage);

  if (!damageFormula) {
    return null;
  }

  const abilityModifier = getAbilityModifierForCharacter(character, "STR");
  const baseAction = createWeaponAction(
    {
      abilities: character.abilities,
      className: character.className,
      classFeatureState: character.classFeatureState ?? {},
      level: character.level ?? 1,
      roundTracker: character.roundTracker,
      statusEntries: character.statusEntries ?? [],
      subclassId: character.subclassId
    },
    {
      key: forceDemolisherWeaponActionKey,
      name: forceDemolisherName,
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE,
      weaponTraining: WEAPON_TRAINING.SIMPLE,
      properties: [WEAPON_PROPERTY.REACH],
      mastery: null,
      damageLabel: formatWeaponDamage(forceDemolisherDamage),
      damageFormula,
      rollFormulaBase: damageFormula,
      ability: "STR",
      abilityModifier,
      damageAbility: "STR",
      damageAbilityModifier: abilityModifier,
      proficiencyLabel: "Simple weapon",
      proficiencyBonus: getProficiencyBonus(character.level ?? 1),
      economyType: ECONOMY_TYPE.ACTION,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      skipFeatureDerivedLookups: true
    }
  );

  return {
    ...baseAction,
    drawerEyebrow: "Dreadnaught",
    description: getForceDemolisherDescription(character)
  };
}

export function getArtificerArmorerDreadnaughtWeaponActions(
  character: ArmorerArcaneArmorCharacter
): WeaponAction[] {
  return [getArtificerArmorerForceDemolisherWeaponAction(character)].filter(
    (action): action is WeaponAction => action !== null
  );
}

function getArtificerArmorerGiantStatureAction(
  character: ArmorerArcaneArmorCharacter
): FeatureActionCard | null {
  if (!hasActiveArtificerArmorerArmorModel(character, "dreadnaught")) {
    return null;
  }

  const usesTotal = getArtificerArmorerGiantStatureUsesTotal(character);

  if (usesTotal <= 0) {
    return null;
  }

  const usesRemaining = getArtificerArmorerGiantStatureUsesRemaining(character);
  const isActive = hasActiveArtificerArmorerGiantStature({
    statusEntries: character.statusEntries ?? []
  });
  const description = getGiantStatureDescription(character);
  const disabledReason = isActive
    ? `${giantStatureName} is already active.`
    : usesRemaining <= 0
      ? `${giantStatureName} recharges when you finish a Long Rest.`
      : undefined;

  return {
    key: artificerArmorerGiantStatureActionKey,
    name: giantStatureName,
    sourceFeature: CLASS_FEATURE.ARMOR_MODEL,
    cardTheme: ACTION_CARD_THEME.FEATURE,
    summary: "Enlarge your Arcane Armor for 1 minute.",
    detail: "Your reach increases, and your armor can grow with you.",
    breakdown: isActive ? `${giantStatureName} is active` : "Grow with armor",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Dreadnaught",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function activateArtificerArmorerGiantStature(character: Character): Character {
  if (
    !hasActiveArtificerArmorerArmorModel(character, "dreadnaught") ||
    getArtificerArmorerGiantStatureUsesRemaining(character) <= 0 ||
    hasActiveArtificerArmorerGiantStature(character)
  ) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesTotal = getArtificerArmorerGiantStatureMaximumUses(character);
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerGiantStatureUsesExpended,
    usesTotal
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        armorerGiantStatureUsesExpended: usesExpended + 1
      }
    },
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isGiantStatureStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: giantStatureName,
        source: giantStatureName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 1
        },
        sourceId: giantStatureStatusSourceId,
        description: getGiantStatureStatusDescription(character)
      })
    ]
  };
}

export function restoreArtificerArmorerGiantStatureOnLongRest(character: Character): Character {
  const usesTotal = getArtificerArmorerGiantStatureMaximumUses(character);

  if (usesTotal <= 0) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerGiantStatureUsesExpended,
    usesTotal
  );

  if (usesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        armorerGiantStatureUsesExpended: 0
      }
    }
  };
}

export function getArtificerArmorerWeaponAttackMultiCount(
  character: Pick<Character, "className" | "classFeatureState" | "level"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return hasArtificerArmorerExtraAttackFeature(character)
    ? (character.classFeatureState?.artificer?.extraAttacksRemainingThisTurn ?? 0)
    : 0;
}

export function consumeArtificerArmorerWeaponAttack(character: Character): Character {
  if (!hasArtificerArmorerExtraAttackFeature(character)) {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const extraAttacksRemaining = artificerState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        artificer: {
          ...artificerState,
          extraAttacksRemainingThisTurn: getArtificerArmorerAdditionalAttackCount(character)
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function advanceArtificerArmorerFeaturesForNewRound(character: Character): Character {
  if (!hasArtificerArmorerExtraAttackFeature(character)) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};

  if ((artificerState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export const getArtificerArmorerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, armorerSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          armorerSpellIdsByLevel
        ),
        armorProficiencyEntries: createArtificerArmorProficiencyEntries(
          [ARMOR_PROFICIENCY.HEAVY],
          armorerToolsSource
        ),
        toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character),
        featureActions: [
          getArtificerArmorerArcaneArmorAction(character),
          getArtificerArmorerGiantStatureAction(character)
        ].filter(
          (action): action is FeatureActionCard => action !== null
        ),
        weaponActions: getArtificerArmorerDreadnaughtWeaponActions(character),
        featureActionOptions: {
          [artificerArmorerArcaneArmorActionKey]: getArtificerArmorerArcaneArmorOptions(character)
        }
      }
    : {};

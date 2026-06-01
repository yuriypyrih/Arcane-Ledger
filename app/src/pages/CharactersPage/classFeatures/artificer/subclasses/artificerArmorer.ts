import {
  CLASS_FEATURE,
  DICE,
  DAMAGE_TYPE,
  REACTION,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type WeaponDamage
} from "../../../../../codex/entries";
import {
  ARMOR_PROFICIENCY,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type ArtificerArmorerArmorModel,
  type Character,
  type CharacterArtificerFeatureState,
  type SkillName
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
import { skillGroupsByAbility } from "../../../skillDefinitions";
import { swapTemporaryHitPointsAssignment } from "../../../shared/temporaryHitPoints";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  AbilityCheckIndicatorMap,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureSpeedBonus,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "../../types";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";
import {
  createArtificerArmorProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const armorerSubclassId = "artificer-armorer";
export const artificerArmorerArcaneArmorActionKey = "artificer-armorer-arcane-armor";
export const artificerArmorerGiantStatureActionKey = "artificer-armorer-giant-stature";
export const artificerArmorerDefensiveFieldActionKey = "artificer-armorer-defensive-field";
export const artificerArmorerInfiltratorsFlightActionKey =
  "artificer-armorer-infiltrators-flight";
export const artificerArmorerPerfectedArmorGuardianReactionEntryId =
  "reaction-artificer-armorer-perfected-armor-guardian";

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
const thunderPulseName = "Thunder Pulse";
const lightningLauncherName = "Lightning Launcher";
const defensiveFieldName = "Defensive Field";
const giantStatureName = "Giant Stature";
const infiltratorsFlightName = "Infiltrator's Flight";
const perfectedArmorGuardianName = "Perfected Armor Guardian";
const giantStatureStatusSourceId = "artificer-armorer-giant-stature";
const infiltratorsFlightStatusSourceId = "artificer-armorer-infiltrators-flight";
const infiltratorPoweredStepsSource = "(Arcane Armor / Infiltrator / Powered Steps)";
const infiltratorDampeningFieldSource = "Arcane Armor / Infiltrator / Dampening Field";
const perfectedArmorDreadnaughtSource = "Perfected Armor / Dreadnaught";
const forceDemolisherWeaponActionKey = "artificer-armorer-force-demolisher";
const thunderPulseWeaponActionKey = "artificer-armorer-thunder-pulse";
const lightningLauncherWeaponActionKey = "artificer-armorer-lightning-launcher";
const forceDemolisherDamage: WeaponDamage = [[DICE.D10, DAMAGE_TYPE.FORCE]];
const thunderPulseDamage: WeaponDamage = [[DICE.D8, DAMAGE_TYPE.THUNDER]];
const lightningLauncherDamage: WeaponDamage = [[DICE.D6, DAMAGE_TYPE.LIGHTNING]];
const forceDemolisherPerfectedDamage: WeaponDamage = [
  [DICE.D6, DAMAGE_TYPE.FORCE],
  [DICE.D6, DAMAGE_TYPE.FORCE]
];
const thunderPulsePerfectedDamage: WeaponDamage = [[DICE.D10, DAMAGE_TYPE.THUNDER]];
const lightningLauncherPerfectedDamage: WeaponDamage = [
  [DICE.D6, DAMAGE_TYPE.LIGHTNING],
  [DICE.D6, DAMAGE_TYPE.LIGHTNING]
];
const perfectedArmorDreadnaughtAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: perfectedArmorDreadnaughtSource
};
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

export function hasArtificerArmorerImprovedArmorerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, armorerSubclassId, 9);
}

export function hasArtificerArmorerPerfectedArmorFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, armorerSubclassId, 15);
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

function getDescriptionSection(
  description: SpellDescriptionEntry[],
  heading: string
): SpellDescriptionEntry[] {
  const marker = `<strong>${heading}</strong>`;
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

function getArmorModelDescriptionSection(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string
): SpellDescriptionEntry[] {
  return getDescriptionSection(getArmorModelDescription(character), heading);
}

function getImprovedArmorerDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.IMPROVED_ARMORER);
}

export function getArtificerArmorerImprovedArmorerDescriptionSection(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string
): SpellDescriptionEntry[] {
  return getDescriptionSection(getImprovedArmorerDescription(character), heading);
}

function getPerfectedArmorDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.PERFECTED_ARMOR);
}

export function getArtificerArmorerPerfectedArmorDescriptionSection(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string
): SpellDescriptionEntry[] {
  return getDescriptionSection(getPerfectedArmorDescription(character), heading);
}

function getPerfectedArmorDescriptionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string,
  dreadnaughtPart?: "force-demolisher" | "giant-stature"
): SpellDescriptionEntry[] {
  const section = getArtificerArmorerPerfectedArmorDescriptionSection(character, heading);
  let description = section;

  if (heading === "Dreadnaught." && dreadnaughtPart) {
    const entry = section.find(
      (sectionEntry): sectionEntry is string => typeof sectionEntry === "string"
    );
    const splitMarker = " In addition,";
    const splitIndex = entry?.indexOf(splitMarker) ?? -1;

    if (entry && splitIndex >= 0) {
      description =
        dreadnaughtPart === "force-demolisher"
          ? [entry.slice(0, splitIndex).trim()]
          : [`<strong>Dreadnaught.</strong> ${entry.slice(splitIndex + 1).trim()}`];
    }
  }

  if (heading === "Infiltrator.") {
    description = description.filter(
      (entry) => !(typeof entry === "string" && entry.startsWith("Additionally,"))
    );
  }

  return description;
}

function createPerfectedArmorDescriptionAddition(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  heading: string,
  dreadnaughtPart?: "force-demolisher" | "giant-stature"
): SpellDescriptionEntry[] {
  const description = getPerfectedArmorDescriptionEntries(character, heading, dreadnaughtPart);

  return description.length > 0
    ? createFeatureSourcedDescriptionEntries(character, CLASS_FEATURE.PERFECTED_ARMOR, description)
    : [];
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
    Partial<Pick<Character, "abilities" | "statusEntries" | "subclassId">>
): Pick<
  CharacterArtificerFeatureState,
  | "armorerArcaneArmorTargetKey"
  | "armorerArmorModel"
  | "armorerGiantStatureUsesExpended"
  | "armorerInfiltratorsFlightUsesExpended"
  | "armorerPerfectedArmorGuardianUsesExpended"
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
  const perfectedArmorUsesTotal = getArtificerArmorerPerfectedArmorMaximumUses(character);
  const armorerPerfectedArmorGuardianUsesExpended =
    perfectedArmorUsesTotal > 0
      ? normalizeArmorerUsesExpended(
          record.armorerPerfectedArmorGuardianUsesExpended,
          perfectedArmorUsesTotal
        )
      : undefined;
  const armorerInfiltratorsFlightUsesExpended =
    perfectedArmorUsesTotal > 0
      ? normalizeArmorerUsesExpended(
          record.armorerInfiltratorsFlightUsesExpended,
          perfectedArmorUsesTotal
        )
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
        : undefined,
    armorerPerfectedArmorGuardianUsesExpended,
    armorerInfiltratorsFlightUsesExpended
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

function getThunderPulseDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Guardian: Thunder Pulse.");
}

function getLightningLauncherDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Infiltrator: Lightning Launcher.");
}

function getDefensiveFieldDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Guardian: Defensive Field.");
}

function getGiantStatureDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getArmorModelDescriptionSection(character, "Dreadnaught: Giant Stature.");
}

function getInfiltratorsFlightDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getPerfectedArmorDescription(character).filter(
    (entry) =>
      typeof entry === "string" &&
      entry.startsWith("Additionally, as a Bonus Action, you can gain a Fly Speed")
  );
}

function getGiantStatureStatusDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string {
  const descriptionParts = [
    getPlainTextDescription(
      getGiantStatureDescription(character),
      "Dreadnaught: Giant Stature."
    ),
    hasArtificerArmorerPerfectedArmorFeature(character)
      ? getPlainTextDescription(
          getPerfectedArmorDescriptionEntries(character, "Dreadnaught.", "giant-stature"),
          "Dreadnaught."
        )
      : ""
  ].filter(Boolean);

  const description = descriptionParts.join("\n\n");

  return description || "You transform and enlarge your Arcane Armor for 1 minute.";
}

function getInfiltratorsFlightStatusDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string {
  const description = getPlainTextDescription(getInfiltratorsFlightDescription(character));

  return description || "You gain a Fly Speed equal to twice your Speed until the end of the turn.";
}

function isInfiltratorsFlightStatusEntry(entry: { sourceId?: string }) {
  return entry.sourceId === infiltratorsFlightStatusSourceId;
}

export function hasActiveArtificerArmorerInfiltratorsFlight(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isInfiltratorsFlightStatusEntry
  );
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
    Partial<Pick<Character, "abilities" | "level" | "statusEntries" | "subclassId">>
): number {
  return hasArtificerArmorerArmorModelFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function getArtificerArmorerGiantStatureUsesTotal(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): number {
  return hasSelectedArtificerArmorerArmorModel(character, "dreadnaught")
    ? getArtificerArmorerGiantStatureMaximumUses(character)
    : 0;
}

export function getArtificerArmorerGiantStatureUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
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

function getArtificerArmorerPerfectedArmorMaximumUses(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "statusEntries" | "subclassId">>
): number {
  return hasArtificerArmorerPerfectedArmorFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function getArtificerArmorerPerfectedArmorGuardianUsesTotal(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): number {
  return hasSelectedArtificerArmorerArmorModel(character, "guardian")
    ? getArtificerArmorerPerfectedArmorMaximumUses(character)
    : 0;
}

export function getArtificerArmorerPerfectedArmorGuardianUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): number {
  const total = getArtificerArmorerPerfectedArmorGuardianUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  const expended = normalizeArmorerUsesExpended(
    character.classFeatureState?.artificer?.armorerPerfectedArmorGuardianUsesExpended,
    total
  );

  return Math.max(0, total - expended);
}

export function getArtificerArmorerInfiltratorsFlightUsesTotal(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): number {
  return hasSelectedArtificerArmorerArmorModel(character, "infiltrator")
    ? getArtificerArmorerPerfectedArmorMaximumUses(character)
    : 0;
}

export function getArtificerArmorerInfiltratorsFlightUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): number {
  const total = getArtificerArmorerInfiltratorsFlightUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  const expended = normalizeArmorerUsesExpended(
    character.classFeatureState?.artificer?.armorerInfiltratorsFlightUsesExpended,
    total
  );

  return Math.max(0, total - expended);
}

type ArmorerArmorModelWeaponConfig = {
  model: ArtificerArmorerArmorModel;
  key: string;
  name: string;
  normalAbility: AbilityKey;
  combatType: WEAPON_COMBAT_TYPE;
  damage: WeaponDamage;
  perfectedDamage: WeaponDamage;
  perfectedArmorHeading: string;
  perfectedArmorDreadnaughtPart?: "force-demolisher" | "giant-stature";
  properties: WEAPON_PROPERTY[];
  drawerEyebrow: string;
  description: (
    character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
  ) => SpellDescriptionEntry[];
  createDetails: (damage: WeaponDamage) => Array<{
    label: string;
    value: string;
    referenceTitle?: string;
    referenceKeywords?: string[];
  }>;
};

function getArtificerArmorerArmorModelWeaponAbility(
  character: Pick<Character, "className"> & Partial<Pick<Character, "abilities">>,
  normalAbility: AbilityKey
): { ability: AbilityKey; abilityModifier: number } {
  const normalModifier = getAbilityModifierForCharacter(character, normalAbility);
  const intelligenceModifier = getAbilityModifierForCharacter(character, "INT");

  return intelligenceModifier > normalModifier
    ? { ability: "INT", abilityModifier: intelligenceModifier }
    : { ability: normalAbility, abilityModifier: normalModifier };
}

function getArtificerArmorerArmorModelWeaponAction(
  character: ArmorerArcaneArmorCharacter,
  config: ArmorerArmorModelWeaponConfig
): WeaponAction | null {
  if (!hasActiveArtificerArmorerArmorModel(character, config.model)) {
    return null;
  }

  const hasPerfectedArmor = hasArtificerArmorerPerfectedArmorFeature(character);
  const weaponDamage = hasPerfectedArmor ? config.perfectedDamage : config.damage;
  const damageFormula = formatWeaponDamageFormula(weaponDamage);

  if (!damageFormula) {
    return null;
  }

  const { ability, abilityModifier } = getArtificerArmorerArmorModelWeaponAbility(
    character,
    config.normalAbility
  );
  const hasImprovedArsenal = hasArtificerArmorerImprovedArmorerFeature(character);
  const improvedArsenalDescription = hasImprovedArsenal
    ? getArtificerArmorerImprovedArmorerDescriptionSection(character, "Improved Arsenal.")
    : [];
  const improvedArsenalDescriptionAddition =
    improvedArsenalDescription.length > 0
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.IMPROVED_ARMORER,
          improvedArsenalDescription
        )
      : [];
  const perfectedArmorDescriptionAddition = hasPerfectedArmor
    ? createPerfectedArmorDescriptionAddition(
        character,
        config.perfectedArmorHeading,
        config.perfectedArmorDreadnaughtPart
      )
    : [];
  const descriptionAdditions = [
    improvedArsenalDescriptionAddition,
    perfectedArmorDescriptionAddition
  ].filter((section) => section.length > 0);
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
      key: config.key,
      name: config.name,
      attackKind: "weapon",
      combatType: config.combatType,
      weaponTraining: WEAPON_TRAINING.SIMPLE,
      properties: config.properties,
      mastery: null,
      damageLabel: formatWeaponDamage(weaponDamage),
      damageFormula,
      rollFormulaBase: damageFormula,
      ability,
      abilityModifier,
      damageAbility: ability,
      damageAbilityModifier: abilityModifier,
      proficiencyLabel: "Simple weapon",
      proficiencyBonus: getProficiencyBonus(character.level ?? 1),
      damageBonusEntries: hasImprovedArsenal
        ? [
            {
              label: "Improved Arsenal",
              value: 1,
              formula: "1",
              displayLabel: "1 Improved Arsenal"
            }
          ]
        : [],
      economyType: ECONOMY_TYPE.ACTION,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      skipFeatureDerivedLookups: true
    }
  );

  return {
    ...baseAction,
    attackBonusEntries: hasImprovedArsenal
      ? [
          ...(baseAction.attackBonusEntries ?? []),
          {
            label: "Improved Arsenal",
            value: 1
          }
        ]
      : baseAction.attackBonusEntries,
    drawerEyebrow: config.drawerEyebrow,
    description: config.description(character),
    descriptionAdditions,
    details: config.createDetails(weaponDamage)
  };
}

const armorerArmorModelWeaponConfigs: ArmorerArmorModelWeaponConfig[] = [
  {
    model: "dreadnaught",
    key: forceDemolisherWeaponActionKey,
    name: forceDemolisherName,
    normalAbility: "STR",
    combatType: WEAPON_COMBAT_TYPE.MELEE,
    damage: forceDemolisherDamage,
    perfectedDamage: forceDemolisherPerfectedDamage,
    perfectedArmorHeading: "Dreadnaught.",
    perfectedArmorDreadnaughtPart: "force-demolisher",
    properties: [WEAPON_PROPERTY.REACH],
    drawerEyebrow: armorModelLabels.dreadnaught,
    description: getForceDemolisherDescription,
    createDetails: (damage) => [
      { label: "Type", value: "Simple melee weapon" },
      { label: "Damage", value: formatWeaponDamage(damage) },
      {
        label: "Properties",
        value: "Reach",
        referenceTitle: "Properties",
        referenceKeywords: ["Reach"]
      },
      { label: "Mastery", value: "None" }
    ]
  },
  {
    model: "guardian",
    key: thunderPulseWeaponActionKey,
    name: thunderPulseName,
    normalAbility: "STR",
    combatType: WEAPON_COMBAT_TYPE.MELEE,
    damage: thunderPulseDamage,
    perfectedDamage: thunderPulsePerfectedDamage,
    perfectedArmorHeading: "Guardian.",
    properties: [],
    drawerEyebrow: armorModelLabels.guardian,
    description: getThunderPulseDescription,
    createDetails: (damage) => [
      { label: "Type", value: "Simple melee weapon" },
      { label: "Damage", value: formatWeaponDamage(damage) },
      { label: "Properties", value: "None" },
      { label: "Mastery", value: "None" }
    ]
  },
  {
    model: "infiltrator",
    key: lightningLauncherWeaponActionKey,
    name: lightningLauncherName,
    normalAbility: "DEX",
    combatType: WEAPON_COMBAT_TYPE.RANGED,
    damage: lightningLauncherDamage,
    perfectedDamage: lightningLauncherPerfectedDamage,
    perfectedArmorHeading: "Infiltrator.",
    properties: [WEAPON_PROPERTY.RANGE],
    drawerEyebrow: armorModelLabels.infiltrator,
    description: getLightningLauncherDescription,
    createDetails: (damage) => [
      { label: "Type", value: "Simple ranged weapon" },
      { label: "Damage", value: formatWeaponDamage(damage) },
      { label: "Range", value: "90/300 feet" },
      {
        label: "Properties",
        value: "Range",
        referenceTitle: "Properties",
        referenceKeywords: ["Range"]
      },
      { label: "Mastery", value: "None" }
    ]
  }
];

export function getArtificerArmorerArmorModelWeaponActions(
  character: ArmorerArcaneArmorCharacter
): WeaponAction[] {
  return armorerArmorModelWeaponConfigs
    .map((config) => getArtificerArmorerArmorModelWeaponAction(character, config))
    .filter((action): action is WeaponAction => action !== null);
}

function getArtificerArmorerDefensiveFieldAction(
  character: ArmorerArcaneArmorCharacter
): FeatureActionCard | null {
  if (!hasActiveArtificerArmorerArmorModel(character, "guardian")) {
    return null;
  }

  const description = getDefensiveFieldDescription(character);
  const temporaryHitPoints = Math.max(1, Math.floor(character.level ?? 1));

  return {
    key: artificerArmorerDefensiveFieldActionKey,
    name: defensiveFieldName,
    sourceFeature: CLASS_FEATURE.ARMOR_MODEL,
    cardTheme: ACTION_CARD_THEME.DEFENSE,
    summary: "Gain Temporary Hit Points equal to your level.",
    detail: `Gain ${temporaryHitPoints} Temporary Hit Points.`,
    breakdown: "Gain temporary HP",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Guardian",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function activateArtificerArmorerDefensiveField(character: Character): Character {
  if (!hasActiveArtificerArmorerArmorModel(character, "guardian")) {
    return character;
  }

  const temporaryHitPoints = Math.max(1, Math.floor(character.level ?? 1));

  return {
    ...character,
    ...swapTemporaryHitPointsAssignment(
      character.temporaryHitPoints,
      character.temporaryHitPointsSource,
      temporaryHitPoints,
      defensiveFieldName
    )
  };
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
  const perfectedArmorDescriptionAddition = hasArtificerArmorerPerfectedArmorFeature(character)
    ? createPerfectedArmorDescriptionAddition(character, "Dreadnaught.", "giant-stature")
    : [];
  const descriptionAdditions =
    perfectedArmorDescriptionAddition.length > 0 ? [perfectedArmorDescriptionAddition] : [];
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
    descriptionAdditions,
    drawer: {
      kind: "confirm",
      eyebrow: "Dreadnaught",
      description,
      descriptionAdditions
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

export function consumeArtificerArmorerPerfectedArmorGuardianUse(
  character: Character
): Character {
  if (
    !hasActiveArtificerArmorerArmorModel(character, "guardian") ||
    getArtificerArmorerPerfectedArmorGuardianUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesTotal = getArtificerArmorerPerfectedArmorMaximumUses(character);
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerPerfectedArmorGuardianUsesExpended,
    usesTotal
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        armorerPerfectedArmorGuardianUsesExpended: usesExpended + 1
      }
    }
  };
}

export function restoreArtificerArmorerPerfectedArmorGuardianOnLongRest(
  character: Character
): Character {
  const usesTotal = getArtificerArmorerPerfectedArmorMaximumUses(character);

  if (usesTotal <= 0) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerPerfectedArmorGuardianUsesExpended,
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
        armorerPerfectedArmorGuardianUsesExpended: 0
      }
    }
  };
}

function getArtificerArmorerInfiltratorsFlightAction(
  character: ArmorerArcaneArmorCharacter
): FeatureActionCard | null {
  if (!hasActiveArtificerArmorerArmorModel(character, "infiltrator")) {
    return null;
  }

  const usesTotal = getArtificerArmorerInfiltratorsFlightUsesTotal(character);

  if (usesTotal <= 0) {
    return null;
  }

  const usesRemaining = getArtificerArmorerInfiltratorsFlightUsesRemaining(character);
  const description = getInfiltratorsFlightDescription(character);
  const disabledReason =
    usesRemaining <= 0
      ? `${infiltratorsFlightName} recharges when you finish a Long Rest.`
      : undefined;

  return {
    key: artificerArmorerInfiltratorsFlightActionKey,
    name: infiltratorsFlightName,
    sourceFeature: CLASS_FEATURE.PERFECTED_ARMOR,
    cardTheme: ACTION_CARD_THEME.FEATURE,
    summary: "Gain a Fly Speed equal to twice your Speed.",
    detail: "Fly until the end of the current turn.",
    breakdown: "Fly speed x2",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Infiltrator",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function activateArtificerArmorerInfiltratorsFlight(character: Character): Character {
  if (
    !hasActiveArtificerArmorerArmorModel(character, "infiltrator") ||
    getArtificerArmorerInfiltratorsFlightUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesTotal = getArtificerArmorerPerfectedArmorMaximumUses(character);
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerInfiltratorsFlightUsesExpended,
    usesTotal
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        armorerInfiltratorsFlightUsesExpended: usesExpended + 1
      }
    },
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isInfiltratorsFlightStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: infiltratorsFlightName,
        source: infiltratorsFlightName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: infiltratorsFlightStatusSourceId,
        description: getInfiltratorsFlightStatusDescription(character)
      })
    ]
  };
}

export function restoreArtificerArmorerInfiltratorsFlightOnLongRest(
  character: Character
): Character {
  const usesTotal = getArtificerArmorerPerfectedArmorMaximumUses(character);

  if (usesTotal <= 0) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const usesExpended = normalizeArmorerUsesExpended(
    artificerState.armorerInfiltratorsFlightUsesExpended,
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
        armorerInfiltratorsFlightUsesExpended: 0
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

function getArtificerArmorerInfiltratorSpeedBonuses(
  character: ArmorerArcaneArmorCharacter
): FeatureSpeedBonus[] {
  const speedBonuses: FeatureSpeedBonus[] = [];

  if (hasActiveArtificerArmorerArmorModel(character, "infiltrator")) {
    speedBonuses.push({
      label: infiltratorPoweredStepsSource,
      value: 5,
      movementType: "walk"
    });
  }

  if (
    hasActiveArtificerArmorerArmorModel(character, "infiltrator") &&
    hasActiveArtificerArmorerInfiltratorsFlight(character)
  ) {
    speedBonuses.push({
      label: infiltratorsFlightName,
      value: 0,
      movementType: "fly",
      setBaseFromWalkMultiplier: 2
    });
  }

  return speedBonuses;
}

function getArtificerArmorerInfiltratorSkillIndicators(
  character: ArmorerArcaneArmorCharacter
): SkillIndicatorMap {
  return hasActiveArtificerArmorerArmorModel(character, "infiltrator")
    ? {
        [SKILL.STEALTH]: [
          {
            label: "Advantage",
            tone: "advantage",
            source: infiltratorDampeningFieldSource
          }
        ]
      }
    : {};
}

function getArtificerArmorerDreadnaughtSavingThrowIndicators(
  character: ArmorerArcaneArmorCharacter
): SavingThrowIndicatorMap {
  return hasArtificerArmorerPerfectedArmorFeature(character) &&
    hasActiveArtificerArmorerArmorModel(character, "dreadnaught") &&
    hasActiveArtificerArmorerGiantStature(character)
    ? {
        STR: [perfectedArmorDreadnaughtAdvantageIndicator]
      }
    : {};
}

function getArtificerArmorerDreadnaughtAbilityCheckIndicators(
  character: ArmorerArcaneArmorCharacter
): AbilityCheckIndicatorMap {
  return hasArtificerArmorerPerfectedArmorFeature(character) &&
    hasActiveArtificerArmorerArmorModel(character, "dreadnaught") &&
    hasActiveArtificerArmorerGiantStature(character)
    ? {
        STR: [perfectedArmorDreadnaughtAdvantageIndicator]
      }
    : {};
}

function getArtificerArmorerDreadnaughtSkillIndicators(
  character: ArmorerArcaneArmorCharacter
): SkillIndicatorMap {
  if (
    !hasArtificerArmorerPerfectedArmorFeature(character) ||
    !hasActiveArtificerArmorerArmorModel(character, "dreadnaught") ||
    !hasActiveArtificerArmorerGiantStature(character)
  ) {
    return {};
  }

  const strengthSkills =
    skillGroupsByAbility.find((group) => group.ability === "STR")?.skills ?? [];

  return Object.fromEntries(
    strengthSkills.map(
      (skill): [SkillName, Array<typeof perfectedArmorDreadnaughtAdvantageIndicator>] => [
        skill,
        [perfectedArmorDreadnaughtAdvantageIndicator]
      ]
    )
  ) as SkillIndicatorMap;
}

function mergeSkillIndicatorMaps(...maps: SkillIndicatorMap[]): SkillIndicatorMap {
  const merged: SkillIndicatorMap = {};

  maps.forEach((map) => {
    Object.entries(map).forEach(([skill, indicators]) => {
      if (!indicators || indicators.length === 0) {
        return;
      }

      const skillName = skill as SkillName;
      merged[skillName] = [...(merged[skillName] ?? []), ...indicators];
    });
  });

  return merged;
}

function getArtificerArmorerPerfectedArmorGuardianReactionEntries(
  character: ArmorerArcaneArmorCharacter
): ReactionEntry[] {
  if (
    !hasArtificerArmorerPerfectedArmorFeature(character) ||
    !hasActiveArtificerArmorerArmorModel(character, "guardian")
  ) {
    return [];
  }

  const description = getArtificerArmorerPerfectedArmorDescriptionSection(
    character,
    "Guardian."
  );

  return [
    {
      id: artificerArmorerPerfectedArmorGuardianReactionEntryId,
      reaction: REACTION.PERFECTED_ARMOR_GUARDIAN,
      name: perfectedArmorGuardianName,
      sourceType: "feature",
      sourceFeature: CLASS_FEATURE.PERFECTED_ARMOR,
      sourceLabel: "Armorer",
      description
    }
  ];
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
          getArtificerArmorerDefensiveFieldAction(character),
          getArtificerArmorerGiantStatureAction(character),
          getArtificerArmorerInfiltratorsFlightAction(character)
        ].filter((action): action is FeatureActionCard => action !== null),
        weaponActions: getArtificerArmorerArmorModelWeaponActions(character),
        speedBonuses: getArtificerArmorerInfiltratorSpeedBonuses(character),
        savingThrowIndicators: getArtificerArmorerDreadnaughtSavingThrowIndicators(character),
        abilityCheckIndicators: getArtificerArmorerDreadnaughtAbilityCheckIndicators(character),
        skillIndicators: mergeSkillIndicatorMaps(
          getArtificerArmorerInfiltratorSkillIndicators(character),
          getArtificerArmorerDreadnaughtSkillIndicators(character)
        ),
        reactionEntries: getArtificerArmorerPerfectedArmorGuardianReactionEntries(character),
        featureActionOptions: {
          [artificerArmorerArcaneArmorActionKey]: getArtificerArmorerArcaneArmorOptions(character)
        }
      }
    : {};

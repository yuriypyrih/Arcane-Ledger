import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  type WeaponDamage
} from "../../../../../codex/entries";
import {
  psychicBladeWeaponName,
  psychicBladeSoulBladesSummary,
  psychicBladeWeaponSummary
} from "../../../../../codex/entries/featureWeapons";
import { getCodexEntryByName } from "../../../../../codex/selectors";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterRogueFeatureState } from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { getResolvedCustomLoadoutEntries } from "../../../customEquipment";
import {
  createWeaponAction,
  getProficiencyBonus,
  type WeaponAction
} from "../../../gameplay";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount
} from "../../../inventory";
import { createHeldDescriptorForInventoryItem } from "../../../inventoryItems";
import { isShieldArmorEntry } from "../../../armor";
import { getLoadoutCodexEntryByName } from "../../../proficiency";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import {
  getPsionicDiceTotalForLevel,
  getPsionicDieForLevel,
  type PsionicDie
} from "../../psionicDice";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../cardUsage";
import type { FeatureActionCard, FeatureActionFact, FeatureEquipmentEntry } from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE, type EconomyType } from "../../../actionEconomy";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../../../../utils/codex";
import { rogueSneakAttackActionKey } from "../rogue";

export const soulknifeSubclassId = "rogue-soulknife";
export const rogueSoulknifePsychicBladeWeaponActionKey = "rogue-soulknife-psychic-blade";
export const rogueSoulknifeBonusPsychicBladeWeaponActionKey =
  "rogue-soulknife-bonus-psychic-blade";
export const rogueSoulknifePsychicWhispersActionKey = "rogue-soulknife-psychic-whispers";
export const rogueSoulknifePsychicTeleportationActionKey =
  "rogue-soulknife-psychic-teleportation";
export const rogueSoulknifePsychicVeilActionKey = "rogue-soulknife-psychic-veil";

const soulknifeSourceLabel = "Psychic Blades";
const soulknifeDrawerEyebrow = "Soulknife";
const soulknifePsychicBladeEquipmentKey = "feature-rogue-soulknife-psychic-blade";
const homingStrikesName = "Homing Strikes";
const psychicWhispersName = "Psychic Whispers";
const psychicTeleportationName = "Psychic Teleportation";
const psychicVeilName = "Psychic Veil";
const rendMindName = "Rend Mind";
const rogueSoulknifePsychicVeilStatusSourceId = "feature-rogue-soulknife-psychic-veil";
const rogueSoulknifePsionicFallbackCost = 1;
const rogueSoulknifePsychicTeleportationCost = 1;
const soulknifeSubclassEntry = getSubclassEntryById(soulknifeSubclassId);
const bonusPsychicBladeDamage = [[DICE.D4, DAMAGE_TYPE.PSYCHIC]] satisfies WeaponDamage;
const psychicBladeWeaponEntry = (() => {
  const entry = getCodexEntryByName(psychicBladeWeaponName);
  return entry?.category === ENTRY_CATEGORIES.WEAPONS ? entry : null;
})();

type RogueSoulknifeLimitedUseKey =
  | "soulknifePsychicWhispersUsesExpended"
  | "soulknifePsychicVeilUsesExpended"
  | "soulknifeRendMindUsesExpended";

type RogueSoulknifeCharacter = Pick<Character, "className"> &
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

function getRogueSoulknifeFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = soulknifeSubclassEntry?.features.find((row) =>
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

  const nextHeadingIndex = description.findIndex(
    (entry, index) => index > startIndex && /^<strong>.+<\/strong>/.test(entry.trim())
  );
  const endIndex = nextHeadingIndex >= 0 ? nextHeadingIndex : description.length;

  return description.slice(startIndex, endIndex);
}

function stripFeatureDescriptionHeading(description: readonly string[], heading: string): string[] {
  const [firstEntry, ...remainingEntries] = description;

  if (!firstEntry) {
    return [];
  }

  const normalizedFirstEntry = firstEntry.replace(heading, "").trim();

  return [...(normalizedFirstEntry ? [normalizedFirstEntry] : []), ...remainingEntries];
}

const psychicBladesDescription = getRogueSoulknifeFeatureDescriptionEntries(
  CLASS_FEATURE.PSYCHIC_BLADES
);
const psionicPowerDescription = getRogueSoulknifeFeatureDescriptionEntries(
  CLASS_FEATURE.PSIONIC_POWER
);
const psychicWhispersDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    psionicPowerDescription,
    `<strong>${psychicWhispersName}.</strong>`
  ),
  `<strong>${psychicWhispersName}.</strong>`
);
const soulBladesDescription = getRogueSoulknifeFeatureDescriptionEntries(CLASS_FEATURE.SOUL_BLADES);
const homingStrikesDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    soulBladesDescription,
    `<strong>${homingStrikesName}.</strong>`
  ),
  `<strong>${homingStrikesName}.</strong>`
);
const psychicTeleportationDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    soulBladesDescription,
    `<strong>${psychicTeleportationName}.</strong>`
  ),
  `<strong>${psychicTeleportationName}.</strong>`
);
const psychicVeilDescription = getRogueSoulknifeFeatureDescriptionEntries(
  CLASS_FEATURE.PSYCHIC_VEIL
);
const rendMindDescription = getRogueSoulknifeFeatureDescriptionEntries(CLASS_FEATURE.REND_MIND);

function getPsychicBladeHeldSlotCount(character: RogueSoulknifeCharacter): number {
  const heldCodexDescriptors = (character.equipment ?? []).flatMap((item) => {
    if (!item.onHand) {
      return [];
    }

    const entry = getLoadoutCodexEntryByName(item.name);

    if (!entry) {
      return [];
    }

    if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
      return [createHeldWeaponDescriptor(`codex-${entry.id}`, entry)];
    }

    if (entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry)) {
      return [createHeldShieldDescriptor(`codex-${entry.id}`)];
    }

    return [];
  });
  const heldInventoryDescriptors = (character.inventoryItems ?? []).flatMap((entry) => {
    if (!entry.onHand) {
      return [];
    }

    const descriptor = createHeldDescriptorForInventoryItem(`inventory-${entry.id}`, entry.item);
    return descriptor ? [descriptor] : [];
  });
  const heldCustomDescriptors = getResolvedCustomLoadoutEntries(character.customEquipment ?? [])
    .filter(
      (
        entry
      ): entry is Extract<
        ReturnType<typeof getResolvedCustomLoadoutEntries>[number],
        { category: ENTRY_CATEGORIES.WEAPONS }
      > => entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
    )
    .map((entry) => createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry));

  return getHeldWeaponSlotCount([
    ...heldCodexDescriptors,
    ...heldInventoryDescriptors,
    ...heldCustomDescriptors
  ]);
}

function hasFreeHandForPsychicBlade(character: RogueSoulknifeCharacter): boolean {
  return getPsychicBladeHeldSlotCount(character) < 2;
}

function hasTwoFreeHandsForPsychicBlade(character: RogueSoulknifeCharacter): boolean {
  return getPsychicBladeHeldSlotCount(character) === 0;
}

function getPsychicBladeAbility(character: RogueSoulknifeCharacter): "STR" | "DEX" {
  const strengthModifier = getAbilityModifierForCharacter(character, "STR");
  const dexterityModifier = getAbilityModifierForCharacter(character, "DEX");

  return dexterityModifier >= strengthModifier ? "DEX" : "STR";
}

export function hasRogueSoulknifePsychicBladesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === soulknifeSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRogueSoulknifeSoulBladesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === soulknifeSubclassId &&
    (character.level ?? 0) >= 9
  );
}

export function hasRogueSoulknifePsychicVeilFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === soulknifeSubclassId &&
    (character.level ?? 0) >= 13
  );
}

export function hasRogueSoulknifeRendMindFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === soulknifeSubclassId &&
    (character.level ?? 0) >= 17
  );
}

function getRogueSoulknifeStateRecord(
  value: Partial<CharacterRogueFeatureState> | undefined
): Partial<CharacterRogueFeatureState> {
  return value && typeof value === "object" ? value : {};
}

function getRogueSoulknifeLimitedUsesRemaining(
  character: RogueSoulknifeCharacter,
  key: RogueSoulknifeLimitedUseKey,
  totalUses: number
): number {
  const usesExpended = Math.max(
    0,
    Math.floor(Number(getRogueSoulknifeStateRecord(character.classFeatureState?.rogue)[key]) || 0)
  );

  return Math.max(0, totalUses - Math.min(totalUses, usesExpended));
}

function consumeRogueSoulknifeLimitedUse(
  character: Character,
  key: RogueSoulknifeLimitedUseKey,
  totalUses: number
): Character {
  if (totalUses <= 0) {
    return character;
  }

  const rogueState = getRogueSoulknifeStateRecord(character.classFeatureState?.rogue);
  const usesExpended = Math.max(0, Math.min(totalUses, Math.floor(Number(rogueState[key]) || 0)));

  if (usesExpended < totalUses) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rogue: {
          ...rogueState,
          [key]: usesExpended + 1
        }
      }
    };
  }

  if (getRogueSoulknifePsionicDiceRemaining(character) < rogueSoulknifePsionicFallbackCost) {
    return character;
  }

  return expendRogueSoulknifePsionicDie(character);
}

function restoreRogueSoulknifeLimitedUseOnLongRest(
  character: Character,
  key: RogueSoulknifeLimitedUseKey,
  totalUses: number
): Character {
  if (totalUses <= 0) {
    return character;
  }

  const rogueState = getRogueSoulknifeStateRecord(character.classFeatureState?.rogue);

  if ((rogueState[key] ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        [key]: 0
      }
    }
  };
}

export function hasRogueSoulknifePsionicPower(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasRogueSoulknifePsychicBladesFeature(character);
}

export function getRogueSoulknifePsionicDiceTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRogueSoulknifePsionicPower(character)
    ? getPsionicDiceTotalForLevel(character.level)
    : 0;
}

export function getRogueSoulknifePsionicDie(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): PsionicDie | null {
  return hasRogueSoulknifePsionicPower(character) ? getPsionicDieForLevel(character.level) : null;
}

export function getRogueSoulknifePsychicWhispersUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRogueSoulknifePsionicPower(character) ? 1 : 0;
}

export function getRogueSoulknifePsychicWhispersUsesRemaining(
  character: RogueSoulknifeCharacter
): number {
  return getRogueSoulknifeLimitedUsesRemaining(
    character,
    "soulknifePsychicWhispersUsesExpended",
    getRogueSoulknifePsychicWhispersUsesTotal(character)
  );
}

export function getRogueSoulknifePsychicVeilUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRogueSoulknifePsychicVeilFeature(character) ? 1 : 0;
}

export function getRogueSoulknifePsychicVeilUsesRemaining(
  character: RogueSoulknifeCharacter
): number {
  return getRogueSoulknifeLimitedUsesRemaining(
    character,
    "soulknifePsychicVeilUsesExpended",
    getRogueSoulknifePsychicVeilUsesTotal(character)
  );
}

export function getRogueSoulknifeRendMindUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRogueSoulknifeRendMindFeature(character) ? 1 : 0;
}

export function getRogueSoulknifeRendMindUsesRemaining(character: RogueSoulknifeCharacter): number {
  return getRogueSoulknifeLimitedUsesRemaining(
    character,
    "soulknifeRendMindUsesExpended",
    getRogueSoulknifeRendMindUsesTotal(character)
  );
}

export function getRogueSoulknifePsionicDiceRemaining(character: RogueSoulknifeCharacter): number {
  const totalDice = getRogueSoulknifePsionicDiceTotal(character);
  const diceExpended = Math.max(
    0,
    Math.floor(
      Number(
        getRogueSoulknifeStateRecord(character.classFeatureState?.rogue)
          .soulknifePsionicDiceExpended
      ) || 0
    )
  );

  return Math.max(0, totalDice - Math.min(totalDice, diceExpended));
}

export function expendRogueSoulknifePsionicDie(character: Character): Character {
  const totalDice = getRogueSoulknifePsionicDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const rogueState = getRogueSoulknifeStateRecord(character.classFeatureState?.rogue);
  const diceExpended = Math.max(
    0,
    Math.min(totalDice, Math.floor(Number(rogueState.soulknifePsionicDiceExpended) || 0))
  );

  if (diceExpended >= totalDice) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        soulknifePsionicDiceExpended: diceExpended + 1
      }
    }
  };
}

export function restoreRogueSoulknifePsionicDie(character: Character): Character {
  const totalDice = getRogueSoulknifePsionicDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const rogueState = getRogueSoulknifeStateRecord(character.classFeatureState?.rogue);
  const diceExpended = Math.max(
    0,
    Math.min(totalDice, Math.floor(Number(rogueState.soulknifePsionicDiceExpended) || 0))
  );

  if (diceExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        soulknifePsionicDiceExpended: diceExpended - 1
      }
    }
  };
}

export function restoreAllRogueSoulknifePsionicDice(character: Character): Character {
  if (getRogueSoulknifePsionicDiceTotal(character) <= 0) {
    return character;
  }

  const rogueState = getRogueSoulknifeStateRecord(character.classFeatureState?.rogue);

  if ((rogueState.soulknifePsionicDiceExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        soulknifePsionicDiceExpended: 0
      }
    }
  };
}

export function consumeRogueSoulknifePsychicWhispersUse(character: Character): Character {
  return consumeRogueSoulknifeLimitedUse(
    character,
    "soulknifePsychicWhispersUsesExpended",
    getRogueSoulknifePsychicWhispersUsesTotal(character)
  );
}

export function consumeRogueSoulknifePsychicVeilUse(character: Character): Character {
  return consumeRogueSoulknifeLimitedUse(
    character,
    "soulknifePsychicVeilUsesExpended",
    getRogueSoulknifePsychicVeilUsesTotal(character)
  );
}

export function consumeRogueSoulknifeRendMindUse(character: Character): Character {
  return consumeRogueSoulknifeLimitedUse(
    character,
    "soulknifeRendMindUsesExpended",
    getRogueSoulknifeRendMindUsesTotal(character)
  );
}

export function restoreRogueSoulknifePsychicWhispersOnLongRest(character: Character): Character {
  return restoreRogueSoulknifeLimitedUseOnLongRest(
    character,
    "soulknifePsychicWhispersUsesExpended",
    getRogueSoulknifePsychicWhispersUsesTotal(character)
  );
}

export function restoreRogueSoulknifePsychicVeilOnLongRest(character: Character): Character {
  return restoreRogueSoulknifeLimitedUseOnLongRest(
    character,
    "soulknifePsychicVeilUsesExpended",
    getRogueSoulknifePsychicVeilUsesTotal(character)
  );
}

export function restoreRogueSoulknifeRendMindOnLongRest(character: Character): Character {
  return restoreRogueSoulknifeLimitedUseOnLongRest(
    character,
    "soulknifeRendMindUsesExpended",
    getRogueSoulknifeRendMindUsesTotal(character)
  );
}

export function activateRogueSoulknifePsychicVeil(character: Character): Character {
  const nextCharacter = consumeRogueSoulknifePsychicVeilUse(character);

  if (nextCharacter === character) {
    return character;
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== rogueSoulknifePsychicVeilStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.CONDITIONS,
        value: CONDITION_NAME.INVISIBLE,
        source: psychicVeilName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.HOURS,
          amount: 1
        },
        sourceId: rogueSoulknifePsychicVeilStatusSourceId
      })
    ]
  };
}

export function activateRogueSoulknifePsychicWhispers(character: Character): Character {
  return consumeRogueSoulknifePsychicWhispersUse(character);
}

export function activateRogueSoulknifePsychicTeleportation(character: Character): Character {
  return expendRogueSoulknifePsionicDie(character);
}

function appendFeatureActionDescriptionSection(
  action: FeatureActionCard,
  actionKey: string,
  sourceName: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendSourcedDescriptionAddition(action, sourceName, descriptionEntries);
}

function getPsionicDieSideCount(psionicDie: PsionicDie): number {
  return Number(psionicDie.slice(1));
}

function formatDcFormulaBonusTerm(value: number, label: string): string {
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value)} ${label}`;
}

export function getRogueSoulknifePsychicTeleportationRollFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  const psionicDie = getRogueSoulknifePsionicDie(character);

  return psionicDie ? `1${psionicDie}*10` : null;
}

export function getRogueSoulknifePsychicWhispersRollFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  const psionicDie = getRogueSoulknifePsionicDie(character);

  return psionicDie ? `1${psionicDie}` : null;
}

export function getRogueSoulknifePsychicWhispersRollFormulaDisplay(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  return getRogueSoulknifePsionicDie(character);
}

export function getRogueSoulknifePsychicTeleportationRollFormulaDisplay(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  const psionicDie = getRogueSoulknifePsionicDie(character);

  return psionicDie ? `${psionicDie} * 10` : null;
}

export function getRogueSoulknifePsychicTeleportationFormulaFact(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureActionFact | null {
  const psionicDie = getRogueSoulknifePsionicDie(character);

  if (!psionicDie) {
    return null;
  }

  return {
    label: "Teleportation Distance Formula",
    value: `10~${getPsionicDieSideCount(psionicDie) * 10} feet = ${psionicDie} * 10`,
    fullWidth: true
  };
}

export function getRogueSoulknifeRendMindSavingThrowDc(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number | null {
  if (!hasRogueSoulknifeRendMindFeature(character)) {
    return null;
  }

  return (
    8 +
    getAbilityModifierForCharacter(character, "DEX") +
    getProficiencyBonus(character.level ?? 1)
  );
}

export function getRogueSoulknifeRendMindSavingThrowFormulaDisplay(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  const saveDc = getRogueSoulknifeRendMindSavingThrowDc(character);

  if (saveDc === null) {
    return null;
  }

  const dexterityModifier = getAbilityModifierForCharacter(character, "DEX");
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);

  return [
    `Wisdom DC ${saveDc} = DC 8`,
    formatDcFormulaBonusTerm(dexterityModifier, "DEX"),
    formatDcFormulaBonusTerm(proficiencyBonus, "Prof.Bonus")
  ].join(" ");
}

function getRogueSoulknifeRendMindSavingThrowFormulaFact(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): FeatureActionFact | null {
  const formulaDisplay = getRogueSoulknifeRendMindSavingThrowFormulaDisplay(character);

  return formulaDisplay
    ? {
        label: "REND MIND SAVING THROW",
        value: formulaDisplay,
        fullWidth: true
      }
    : null;
}

function getRogueSoulknifePsychicWhispersAction(
  character: RogueSoulknifeCharacter
): FeatureActionCard | null {
  if (!hasRogueSoulknifePsionicPower(character)) {
    return null;
  }

  const usesTotal = getRogueSoulknifePsychicWhispersUsesTotal(character);
  const usesRemaining = getRogueSoulknifePsychicWhispersUsesRemaining(character);
  const psionicDiceRemaining = getRogueSoulknifePsionicDiceRemaining(character);
  const psionicDiceTotal = getRogueSoulknifePsionicDiceTotal(character);
  const canUseFallback =
    usesRemaining <= 0 && psionicDiceRemaining >= rogueSoulknifePsionicFallbackCost;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Psychic Whispers charge or Psionic Die remaining.";
  const psionicDieCost = createFeatureActionCardCost({
    amountText: "1",
    resourceLabel: "Psionic Die",
    icon: "psi"
  });

  return {
    key: rogueSoulknifePsychicWhispersActionKey,
    name: psychicWhispersName,
    summary: "Telepathic link for Psionic Die hours",
    detail: "Roll one Psionic Die; the chosen creatures can speak telepathically for that many hours.",
    breakdown: "Telepathy for rolled hours",
    description: psychicWhispersDescription,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    cardUsage: createChargesOrResourceCardUsage(usesRemaining, usesTotal, psionicDieCost),
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1 Psionic Die" : undefined,
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      usesTotal,
      psionicDieCost,
      psionicDiceRemaining,
      psionicDiceTotal,
      {
        icon: "psi"
      },
      "Long Rest"
    ),
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal,
        supplementary: "Long Rest"
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1 Psionic Die",
              icon: "psi" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: soulknifeDrawerEyebrow
    },
    execute: {
      kind: "activate",
      label: "Roll Psychic Whispers"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getRogueSoulknifePsychicTeleportationAction(
  character: RogueSoulknifeCharacter
): FeatureActionCard | null {
  if (!hasRogueSoulknifeSoulBladesFeature(character)) {
    return null;
  }

  const psionicDiceRemaining = getRogueSoulknifePsionicDiceRemaining(character);
  const psionicDiceTotal = getRogueSoulknifePsionicDiceTotal(character);
  const formulaFact = getRogueSoulknifePsychicTeleportationFormulaFact(character);
  const disabledReason =
    psionicDiceRemaining >= rogueSoulknifePsychicTeleportationCost
      ? undefined
      : "No Psionic Dice remaining.";
  const psionicDieCost = createFeatureActionCardCost({
    amountText: `${rogueSoulknifePsychicTeleportationCost}`,
    resourceLabel: "Psionic Die",
    icon: "psi"
  });

  return {
    key: rogueSoulknifePsychicTeleportationActionKey,
    name: psychicTeleportationName,
    summary: formulaFact?.value ?? "Teleport with your Psychic Blade",
    detail: "Manifest a Psychic Blade, expend and roll one Psionic Die, then teleport.",
    breakdown: "Roll die for teleport distance",
    description: psychicTeleportationDescription,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(psionicDieCost),
    headerTags: createNamedUsageHeaderTags(
      psionicDieCost,
      psionicDiceRemaining,
      psionicDiceTotal,
      {
        label: "Psionic Dice",
        icon: "psi"
      }
    ),
    facts: formulaFact ? [formulaFact] : [],
    resources: [
      {
        kind: "tracker",
        label: "Psionic Dice",
        current: psionicDiceRemaining,
        total: psionicDiceTotal,
        icon: "psi",
        cost: rogueSoulknifePsychicTeleportationCost
      }
    ],
    drawer: {
      kind: "confirm",
      eyebrow: soulknifeDrawerEyebrow
    },
    execute: {
      kind: "activate",
      label: "Roll Teleportation"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getRogueSoulknifePsychicVeilAction(
  character: RogueSoulknifeCharacter
): FeatureActionCard | null {
  if (!hasRogueSoulknifePsychicVeilFeature(character)) {
    return null;
  }

  const usesTotal = getRogueSoulknifePsychicVeilUsesTotal(character);
  const usesRemaining = getRogueSoulknifePsychicVeilUsesRemaining(character);
  const psionicDiceRemaining = getRogueSoulknifePsionicDiceRemaining(character);
  const psionicDiceTotal = getRogueSoulknifePsionicDiceTotal(character);
  const canUseFallback =
    usesRemaining <= 0 && psionicDiceRemaining >= rogueSoulknifePsionicFallbackCost;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Psychic Veil charge or Psionic Die remaining.";

  return {
    key: rogueSoulknifePsychicVeilActionKey,
    name: psychicVeilName,
    summary: "Invisible for 1 hour",
    detail: "Gain the Invisible condition for 1 hour.",
    breakdown: "1-hour invisibility",
    description: psychicVeilDescription,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    cardUsage: createChargesOrResourceCardUsage(
      usesRemaining,
      usesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        resourceLabel: "Psionic Die",
        icon: "psi"
      })
    ),
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1 Psionic Die" : undefined,
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      usesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        resourceLabel: "Psionic Die",
        icon: "psi"
      }),
      psionicDiceRemaining,
      psionicDiceTotal,
      {
        icon: "psi"
      },
      "Long Rest"
    ),
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal,
        supplementary: "Long Rest"
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1 Psionic Die",
              icon: "psi" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: soulknifeDrawerEyebrow
    },
    execute: {
      kind: "activate"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getRogueSoulknifeFeatureActions(character: RogueSoulknifeCharacter): FeatureActionCard[] {
  const psychicWhispersAction = getRogueSoulknifePsychicWhispersAction(character);
  const psychicTeleportationAction = getRogueSoulknifePsychicTeleportationAction(character);
  const psychicVeilAction = getRogueSoulknifePsychicVeilAction(character);

  return [psychicWhispersAction, psychicTeleportationAction, psychicVeilAction].filter(
    (action): action is FeatureActionCard => action !== null
  );
}

function transformRogueSoulknifeFeatureAction(
  character: RogueSoulknifeCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (!hasRogueSoulknifeRendMindFeature(character)) {
    return action;
  }

  const actionWithDescription = appendFeatureActionDescriptionSection(
    action,
    rogueSneakAttackActionKey,
    rendMindName,
    rendMindDescription
  );

  if (actionWithDescription.key !== rogueSneakAttackActionKey) {
    return actionWithDescription;
  }

  const rendMindSavingThrowFact = getRogueSoulknifeRendMindSavingThrowFormulaFact(character);

  if (!rendMindSavingThrowFact) {
    return actionWithDescription;
  }

  if (actionWithDescription.drawer) {
    const existingFacts = actionWithDescription.drawer.facts ?? [];
    const nextFacts = [
      ...existingFacts.filter((fact) => fact.label !== rendMindSavingThrowFact.label),
      rendMindSavingThrowFact
    ];

    return {
      ...actionWithDescription,
      drawer: {
        ...actionWithDescription.drawer,
        facts: nextFacts
      }
    };
  }

  return {
    ...actionWithDescription,
    facts: [
      ...(actionWithDescription.facts ?? []).filter(
        (fact) => fact.label !== rendMindSavingThrowFact.label
      ),
      rendMindSavingThrowFact
    ]
  };
}

export function getRogueSoulknifeFeatureEquipmentEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureEquipmentEntry[] {
  if (!hasRogueSoulknifePsychicBladesFeature(character) || !psychicBladeWeaponEntry) {
    return [];
  }

  const summaryOverride = [
    psychicBladeWeaponSummary,
    hasRogueSoulknifeSoulBladesFeature(character) ? psychicBladeSoulBladesSummary : ""
  ]
    .filter((entry) => Boolean(entry && entry.trim()))
    .join(" ");

  return [
    {
      key: soulknifePsychicBladeEquipmentKey,
      entry: psychicBladeWeaponEntry,
      sourceLabel: soulknifeSourceLabel,
      summaryOverride: summaryOverride || undefined
    }
  ];
}

function getRogueSoulknifePsychicBladeDescriptionAdditions(character: RogueSoulknifeCharacter) {
  const descriptionAdditions = [
    ...(hasRogueSoulknifeSoulBladesFeature(character)
      ? [createSourcedDescriptionEntries(homingStrikesName, homingStrikesDescription)]
      : [])
  ];

  return descriptionAdditions.length > 0 ? descriptionAdditions : undefined;
}

function createRogueSoulknifePsychicBladeWeaponAction(
  character: RogueSoulknifeCharacter,
  {
    damage,
    economyType,
    key
  }: {
    damage: WeaponDamage;
    economyType: EconomyType;
    key: string;
  }
): WeaponAction | null {
  if (!psychicBladeWeaponEntry) {
    return null;
  }

  const damageFormula = formatWeaponDamageFormula(damage);

  if (!damageFormula) {
    return null;
  }

  const ability = getPsychicBladeAbility(character);
  const abilityModifier = getAbilityModifierForCharacter(character, ability);
  const baseAction = createWeaponAction(
    {
      abilities: character.abilities,
      className: character.className,
      level: character.level ?? 1,
      subclassId: character.subclassId,
      classFeatureState: character.classFeatureState,
      statusEntries: character.statusEntries,
      roundTracker: character.roundTracker
    },
    {
      key,
      name: psychicBladeWeaponEntry.name,
      attackKind: "weapon",
      combatType: psychicBladeWeaponEntry.type.combat,
      weaponTraining: psychicBladeWeaponEntry.type.training,
      properties: psychicBladeWeaponEntry.properties,
      damageLabel: formatWeaponDamage(damage),
      damageFormula,
      rollFormulaBase: damageFormula,
      ability,
      abilityModifier,
      damageAbility: ability,
      damageAbilityModifier: abilityModifier,
      proficiencyLabel: "Simple weapon",
      proficiencyBonus: getProficiencyBonus(character.level ?? 1),
      economyType,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      hasActiveMastery: true,
      // This action is derived from subclass runtime, so re-entering feature lookups would recurse.
      skipFeatureDerivedLookups: true
    }
  );

  return {
    ...baseAction,
    drawerEyebrow: soulknifeDrawerEyebrow,
    description: psychicBladesDescription,
    descriptionAdditions: getRogueSoulknifePsychicBladeDescriptionAdditions(character)
  };
}

export function getRogueSoulknifeWeaponActions(character: RogueSoulknifeCharacter): WeaponAction[] {
  if (
    !hasRogueSoulknifePsychicBladesFeature(character) ||
    !psychicBladeWeaponEntry ||
    !hasFreeHandForPsychicBlade(character)
  ) {
    return [];
  }

  const psychicBladeAction = createRogueSoulknifePsychicBladeWeaponAction(character, {
    key: rogueSoulknifePsychicBladeWeaponActionKey,
    damage: psychicBladeWeaponEntry.damage,
    economyType: ECONOMY_TYPE.ACTION
  });
  const bonusPsychicBladeAction = hasTwoFreeHandsForPsychicBlade(character)
    ? createRogueSoulknifePsychicBladeWeaponAction(character, {
        key: rogueSoulknifeBonusPsychicBladeWeaponActionKey,
        damage: bonusPsychicBladeDamage,
        economyType: ECONOMY_TYPE.BONUS_ACTION
      })
    : null;

  return [psychicBladeAction, bonusPsychicBladeAction].filter(
    (action): action is WeaponAction => action !== null
  );
}

export const getRogueSoulknifeDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasRogueSoulknifePsychicBladesFeature(character)
    ? {
        featureActions: getRogueSoulknifeFeatureActions(character),
        equipmentEntries: getRogueSoulknifeFeatureEquipmentEntries(character),
        weaponActions: getRogueSoulknifeWeaponActions(character),
        transformFeatureAction: hasRogueSoulknifeRendMindFeature(character)
          ? (action) => transformRogueSoulknifeFeatureAction(character, action)
          : undefined
      }
    : {};

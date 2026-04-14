import { CLASS_FEATURE, ENTRY_CATEGORIES } from "../../../../../codex/entries";
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
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getResolvedCustomLoadoutEntries } from "../../../customEquipment";
import {
  createWeaponAction,
  getAbilityModifier,
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
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import {
  getPsionicDiceTotalForLevel,
  getPsionicDieForLevel,
  type PsionicDie
} from "../../psionicDice";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard, FeatureEquipmentEntry } from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../../../../utils/codex";
import { rogueSneakAttackActionKey } from "../rogue";

export const soulknifeSubclassId = "rogue-soulknife";
export const rogueSoulknifePsychicBladeWeaponActionKey = "rogue-soulknife-psychic-blade";
export const rogueSoulknifePsychicVeilActionKey = "rogue-soulknife-psychic-veil";

const soulknifeSourceLabel = "Psychic Blades";
const soulknifeDrawerEyebrow = "Soulknife";
const soulknifePsychicBladeEquipmentKey = "feature-rogue-soulknife-psychic-blade";
const psychicVeilName = "Psychic Veil";
const rendMindName = "Rend Mind";
const rogueSoulknifePsychicVeilStatusSourceId = "feature-rogue-soulknife-psychic-veil";
const rogueSoulknifePsionicFallbackCost = 1;
const soulknifeSubclassEntry = getSubclassEntryById(soulknifeSubclassId);
const psychicBladeWeaponEntry = (() => {
  const entry = getCodexEntryByName(psychicBladeWeaponName);
  return entry?.category === ENTRY_CATEGORIES.WEAPONS ? entry : null;
})();

type RogueSoulknifeLimitedUseKey =
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

const psychicBladesDescription = getRogueSoulknifeFeatureDescriptionEntries(
  CLASS_FEATURE.PSYCHIC_BLADES
);
const soulBladesDescription = getRogueSoulknifeFeatureDescriptionEntries(CLASS_FEATURE.SOUL_BLADES);
const psychicVeilDescription = getRogueSoulknifeFeatureDescriptionEntries(
  CLASS_FEATURE.PSYCHIC_VEIL
);
const rendMindDescription = getRogueSoulknifeFeatureDescriptionEntries(CLASS_FEATURE.REND_MIND);

function hasFreeHandForPsychicBlade(character: RogueSoulknifeCharacter): boolean {
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
  ]) < 2;
}

function getPsychicBladeAbility(character: Partial<Pick<Character, "abilities">>): "STR" | "DEX" {
  const strengthModifier = getAbilityModifier(character.abilities?.STR ?? 10);
  const dexterityModifier = getAbilityModifier(character.abilities?.DEX ?? 10);

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

function appendFeatureActionDescriptionSection(
  action: FeatureActionCard,
  actionKey: string,
  sourceName: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    sourceName,
    descriptionEntries
  );
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
    breakdown: "Gain the Invisible condition for 1 hour.",
    description: psychicVeilDescription,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1 Psionic Die" : undefined,
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
      eyebrow: soulknifeDrawerEyebrow,
      confirmLabel: "Use Psychic Veil"
    },
    execute: {
      kind: "activate",
      label: "Use Psychic Veil"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getRogueSoulknifeFeatureActions(character: RogueSoulknifeCharacter): FeatureActionCard[] {
  const psychicVeilAction = getRogueSoulknifePsychicVeilAction(character);

  return psychicVeilAction ? [psychicVeilAction] : [];
}

function transformRogueSoulknifeFeatureAction(
  character: RogueSoulknifeCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (!hasRogueSoulknifeRendMindFeature(character)) {
    return action;
  }

  return appendFeatureActionDescriptionSection(
    action,
    rogueSneakAttackActionKey,
    rendMindName,
    rendMindDescription
  );
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

export function getRogueSoulknifeWeaponActions(character: RogueSoulknifeCharacter): WeaponAction[] {
  if (
    !hasRogueSoulknifePsychicBladesFeature(character) ||
    !psychicBladeWeaponEntry ||
    !hasFreeHandForPsychicBlade(character)
  ) {
    return [];
  }

  const damageFormula = formatWeaponDamageFormula(psychicBladeWeaponEntry.damage);

  if (!damageFormula) {
    return [];
  }

  const ability = getPsychicBladeAbility(character);
  const abilityModifier = getAbilityModifier(character.abilities?.[ability] ?? 10);
  const baseAction = createWeaponAction(
    {
      className: character.className,
      level: character.level ?? 1,
      subclassId: character.subclassId,
      classFeatureState: character.classFeatureState,
      statusEntries: character.statusEntries,
      roundTracker: character.roundTracker
    },
    {
      key: rogueSoulknifePsychicBladeWeaponActionKey,
      name: psychicBladeWeaponEntry.name,
      attackKind: "weapon",
      combatType: psychicBladeWeaponEntry.type.combat,
      properties: psychicBladeWeaponEntry.properties,
      damageLabel: formatWeaponDamage(psychicBladeWeaponEntry.damage),
      damageFormula,
      rollFormulaBase: damageFormula,
      ability,
      abilityModifier,
      damageAbility: ability,
      damageAbilityModifier: abilityModifier,
      proficiencyLabel: "Simple weapon",
      proficiencyBonus: getProficiencyBonus(character.level ?? 1),
      economyType: ECONOMY_TYPE.ACTION,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      // This action is derived from subclass runtime, so re-entering feature lookups would recurse.
      skipFeatureDerivedLookups: true
    }
  );

  return [
    {
      ...baseAction,
      drawerEyebrow: soulknifeDrawerEyebrow,
      description: psychicBladesDescription,
      descriptionAdditions: hasRogueSoulknifeSoulBladesFeature(character)
        ? [soulBladesDescription]
        : undefined
    }
  ];
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

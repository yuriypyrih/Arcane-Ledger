import { artificerFeatureModule } from "./artificer/module";
import { barbarianFeatureModule } from "./barbarian/module";
import { bardFeatureModule } from "./bard/module";
import { clericFeatureModule } from "./cleric/module";
import { customClassFeatureModule } from "./customClass/module";
import { druidFeatureModule } from "./druid/module";
import { fighterFeatureModule } from "./fighter/module";
import { monkFeatureModule } from "./monk/module";
import { paladinFeatureModule } from "./paladin/module";
import { rangerFeatureModule } from "./ranger/module";
import { rogueFeatureModule } from "./rogue/module";
import { sorcererFeatureModule } from "./sorcerer/module";
import { warlockFeatureModule } from "./warlock/module";
import { wizardFeatureModule } from "./wizard/module";
import { getClassRuntimeCharacter } from "../characterRuntime/classContexts";
import { getCharacterClasses } from "../multiclassState";
import type { Character, CharacterClassFeatureState } from "../../../types";
import { createDefaultAbilities } from "../constants";

import { getClassNeutralMechanicsDerivedState } from "./customClass/customClass";

import type {
  ActiveClassFeatureName,
  CollectedClassFeatureCharacter,
  ClassFeatureDerivedState,
  ClassFeatureModule
} from "./types";

const emptyFeatureDerivedState: ClassFeatureDerivedState = {};
const activeClassFeatureStateCache = new WeakMap<object, ClassFeatureDerivedState>();
const activeClassFeatureDerivations = new Set<ActiveClassFeatureName>();

function mergeDerivedArrays<T>(base?: T[], addition?: T[]): T[] | undefined {
  if (!base?.length && !addition?.length) {
    return undefined;
  }

  return [...(base ?? []), ...(addition ?? [])];
}

function mergeDerivedRecords<T>(
  base?: Partial<Record<string, T[]>>,
  addition?: Partial<Record<string, T[]>>
): Partial<Record<string, T[]>> | undefined {
  const keys = new Set([...Object.keys(base ?? {}), ...Object.keys(addition ?? {})]);

  if (keys.size === 0) {
    return undefined;
  }

  return [...keys].reduce<Partial<Record<string, T[]>>>((nextRecord, key) => {
    const values = mergeDerivedArrays(base?.[key], addition?.[key]);

    if (values?.length) {
      nextRecord[key] = values;
    }

    return nextRecord;
  }, {});
}

function mergeDerivedMaps<T extends Record<string, unknown>>(
  base?: T,
  addition?: T
): T | undefined {
  if (!base && !addition) {
    return undefined;
  }

  return { ...(base ?? {}), ...(addition ?? {}) } as T;
}

export function mergeClassFeatureDerivedStates(
  base: ClassFeatureDerivedState,
  addition: ClassFeatureDerivedState
): ClassFeatureDerivedState {
  if (addition === emptyFeatureDerivedState || Object.keys(addition).length === 0) {
    return base;
  }

  return {
    ...base,
    ...addition,
    weaponMastery:
      base.weaponMastery && addition.weaponMastery
        ? {
            ...base.weaponMastery,
            selectionCount:
              base.weaponMastery.selectionCount + addition.weaponMastery.selectionCount,
            options: [
              ...new Set([...base.weaponMastery.options, ...addition.weaponMastery.options])
            ],
            selections: [
              ...new Set([...base.weaponMastery.selections, ...addition.weaponMastery.selections])
            ]
          }
        : (addition.weaponMastery ?? base.weaponMastery),
    getUnarmedStrikeConfig: () =>
      addition.getUnarmedStrikeConfig?.() ?? base.getUnarmedStrikeConfig?.() ?? null,
    actions: mergeDerivedArrays(base.actions, addition.actions),
    actionOptions: mergeDerivedRecords(base.actionOptions, addition.actionOptions),
    equipmentEntries: mergeDerivedArrays(base.equipmentEntries, addition.equipmentEntries),
    weaponActions: mergeDerivedArrays(base.weaponActions, addition.weaponActions),
    getWeaponDamageBonuses:
      base.getWeaponDamageBonuses || addition.getWeaponDamageBonuses
        ? (context) => [
            ...(base.getWeaponDamageBonuses?.(context) ?? []),
            ...(addition.getWeaponDamageBonuses?.(context) ?? [])
          ]
        : undefined,
    getSpellDamageBonuses:
      base.getSpellDamageBonuses || addition.getSpellDamageBonuses
        ? (context) => [
            ...(base.getSpellDamageBonuses?.(context) ?? []),
            ...(addition.getSpellDamageBonuses?.(context) ?? [])
          ]
        : undefined,
    getInitiativeBonuses:
      base.getInitiativeBonuses || addition.getInitiativeBonuses
        ? () => [
            ...(base.getInitiativeBonuses?.() ?? []),
            ...(addition.getInitiativeBonuses?.() ?? [])
          ]
        : undefined,
    getSavingThrowBonuses:
      base.getSavingThrowBonuses || addition.getSavingThrowBonuses
        ? (ability) => [
            ...(base.getSavingThrowBonuses?.(ability) ?? []),
            ...(addition.getSavingThrowBonuses?.(ability) ?? [])
          ]
        : undefined,
    savingThrowIndicators: mergeDerivedMaps(
      base.savingThrowIndicators,
      addition.savingThrowIndicators
    ),
    abilityCheckIndicators: mergeDerivedMaps(
      base.abilityCheckIndicators,
      addition.abilityCheckIndicators
    ),
    coreStatIndicators: mergeDerivedMaps(base.coreStatIndicators, addition.coreStatIndicators),
    skillIndicators: mergeDerivedMaps(base.skillIndicators, addition.skillIndicators),
    getSkillBonuses:
      base.getSkillBonuses || addition.getSkillBonuses
        ? (skill, proficiencyLevel) => [
            ...(base.getSkillBonuses?.(skill, proficiencyLevel) ?? []),
            ...(addition.getSkillBonuses?.(skill, proficiencyLevel) ?? [])
          ]
        : undefined,
    getArmorClassModes:
      base.getArmorClassModes || addition.getArmorClassModes
        ? (context) => [
            ...(base.getArmorClassModes?.(context) ?? []),
            ...(addition.getArmorClassModes?.(context) ?? [])
          ]
        : undefined,
    getArmorClassBonuses:
      base.getArmorClassBonuses || addition.getArmorClassBonuses
        ? (context) => [
            ...(base.getArmorClassBonuses?.(context) ?? []),
            ...(addition.getArmorClassBonuses?.(context) ?? [])
          ]
        : undefined,
    getSpeedBonuses:
      base.getSpeedBonuses || addition.getSpeedBonuses
        ? (context) => [
            ...(base.getSpeedBonuses?.(context) ?? []),
            ...(addition.getSpeedBonuses?.(context) ?? [])
          ]
        : undefined,
    abilityScoreBonuses: mergeDerivedArrays(base.abilityScoreBonuses, addition.abilityScoreBonuses),
    weaponProficiencyEntries: mergeDerivedArrays(
      base.weaponProficiencyEntries,
      addition.weaponProficiencyEntries
    ),
    skillProficiencyEntries: mergeDerivedArrays(
      base.skillProficiencyEntries,
      addition.skillProficiencyEntries
    ),
    savingThrowProficiencyEntries: mergeDerivedArrays(
      base.savingThrowProficiencyEntries,
      addition.savingThrowProficiencyEntries
    ),
    armorProficiencyEntries: mergeDerivedArrays(
      base.armorProficiencyEntries,
      addition.armorProficiencyEntries
    ),
    toolProficiencyEntries: mergeDerivedArrays(
      base.toolProficiencyEntries,
      addition.toolProficiencyEntries
    ),
    languageProficiencyEntries: mergeDerivedArrays(
      base.languageProficiencyEntries,
      addition.languageProficiencyEntries
    ),
    alwaysPreparedSpellIds: mergeDerivedArrays(
      base.alwaysPreparedSpellIds,
      addition.alwaysPreparedSpellIds
    ),
    alwaysPreparedSpellSources: mergeDerivedMaps(
      base.alwaysPreparedSpellSources,
      addition.alwaysPreparedSpellSources
    ),
    alwaysSpellbookSpellIds: mergeDerivedArrays(
      base.alwaysSpellbookSpellIds,
      addition.alwaysSpellbookSpellIds
    ),
    ritualOnlySpellIds: mergeDerivedArrays(base.ritualOnlySpellIds, addition.ritualOnlySpellIds),
    derivedStatusEntries: mergeDerivedArrays(
      base.derivedStatusEntries,
      addition.derivedStatusEntries
    ),
    reactionEntries: mergeDerivedArrays(base.reactionEntries, addition.reactionEntries),
    transformSpellEntry:
      base.transformSpellEntry || addition.transformSpellEntry
        ? (spell) =>
            addition.transformSpellEntry?.(base.transformSpellEntry?.(spell) ?? spell) ??
            base.transformSpellEntry?.(spell) ??
            spell
        : undefined,
    transformCommonAction:
      base.transformCommonAction || addition.transformCommonAction
        ? (action) =>
            addition.transformCommonAction?.(base.transformCommonAction?.(action) ?? action) ??
            base.transformCommonAction?.(action) ??
            action
        : undefined,
    transformFeatureAction:
      base.transformFeatureAction || addition.transformFeatureAction
        ? (action) =>
            addition.transformFeatureAction?.(base.transformFeatureAction?.(action) ?? action) ??
            base.transformFeatureAction?.(action) ??
            action
        : undefined,
    transformWeaponAction:
      base.transformWeaponAction || addition.transformWeaponAction
        ? (action) =>
            addition.transformWeaponAction?.(base.transformWeaponAction?.(action) ?? action) ??
            base.transformWeaponAction?.(action) ??
            action
        : undefined,
    getSpellDamageFormulaOverride:
      base.getSpellDamageFormulaOverride || addition.getSpellDamageFormulaOverride
        ? (spell) =>
            addition.getSpellDamageFormulaOverride?.(spell) ??
            base.getSpellDamageFormulaOverride?.(spell) ??
            null
        : undefined,
    cantripLimitBonus: (base.cantripLimitBonus ?? 0) + (addition.cantripLimitBonus ?? 0),
    cantripDamageBonus: (base.cantripDamageBonus ?? 0) + (addition.cantripDamageBonus ?? 0),
    getInventoryAttunementLimit:
      base.getInventoryAttunementLimit || addition.getInventoryAttunementLimit
        ? (defaultLimit) => {
            const baseLimit = base.getInventoryAttunementLimit?.(defaultLimit) ?? defaultLimit;
            return addition.getInventoryAttunementLimit?.(baseLimit) ?? baseLimit;
          }
        : undefined,
    canUseMonkMartialArts:
      base.canUseMonkMartialArts || addition.canUseMonkMartialArts
        ? (context) =>
            (base.canUseMonkMartialArts?.(context) ?? true) &&
            (addition.canUseMonkMartialArts?.(context) ?? true)
        : undefined
  };
}

type ClassFeatureDerivationCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "level"
      | "subclassId"
      | "classFeatureState"
      | "classRules"
      | "customClass"
      | "spellSlotsExpended"
      | "abilities"
      | "statusEntries"
      | "roundTracker"
      | "equipment"
      | "inventoryItems"
      | "customEquipment"
      | "spellbookSpellIds"
      | "cantripIds"
      | "feats"
      | "skillProficiencies"
      | "toolProficiencies"
      | "savingThrowProficiencies"
    >
  >;

function withClassFeatureDerivationDefaults(
  character: ClassFeatureDerivationCharacter
): CollectedClassFeatureCharacter {
  return {
    ...character,
    level: character.level ?? 1,
    abilities: character.abilities ?? createDefaultAbilities(),
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState ?? {},
    classRules: character.classRules,
    customClass: character.customClass,
    skillProficiencies: character.skillProficiencies ?? [],
    toolProficiencies: character.toolProficiencies ?? [],
    savingThrowProficiencies: character.savingThrowProficiencies ?? [],
    spellSlotsExpended: character.spellSlotsExpended ?? [],
    statusEntries: character.statusEntries ?? [],
    roundTracker: character.roundTracker,
    equipment: character.equipment ?? [],
    inventoryItems: character.inventoryItems ?? [],
    customEquipment: character.customEquipment ?? [],
    spellbookSpellIds: character.spellbookSpellIds ?? [],
    cantripIds: character.cantripIds ?? [],
    feats: character.feats ?? []
  };
}

const classFeatureModules = {
  Artificer: artificerFeatureModule,
  Barbarian: barbarianFeatureModule,
  Bard: bardFeatureModule,
  Cleric: clericFeatureModule,
  Custom: customClassFeatureModule,
  Druid: druidFeatureModule,
  Fighter: fighterFeatureModule,
  Monk: monkFeatureModule,
  Paladin: paladinFeatureModule,
  Ranger: rangerFeatureModule,
  Rogue: rogueFeatureModule,
  Sorcerer: sorcererFeatureModule,
  Warlock: warlockFeatureModule,
  Wizard: wizardFeatureModule
} as Record<ActiveClassFeatureName, ClassFeatureModule<keyof CharacterClassFeatureState>>;

export function getClassFeatureModules(): ClassFeatureModule<keyof CharacterClassFeatureState>[] {
  return Object.values(classFeatureModules);
}

export function getActiveClassFeatureModule(className: string) {
  return classFeatureModules[className as ActiveClassFeatureName] ?? null;
}

export function collectActiveClassFeatureState(
  character: ClassFeatureDerivationCharacter
): ClassFeatureDerivedState {
  const cachedState = activeClassFeatureStateCache.get(character);

  if (cachedState) {
    return cachedState;
  }

  const progression = character as Partial<Character>;
  if (progression.multiclass && !progression.classEntryId) {
    const derived = getCharacterClasses(character).reduce((result, entry) => {
      const view = getClassRuntimeCharacter(character, entry);
      const next = collectActiveClassFeatureState(view);
      return mergeClassFeatureDerivedStates(result, {
        ...next,
        actions: next.actions?.map((action) => ({
          ...action,
          sourceClassEntryId: entry.id,
          actionSource: action.actionSource ?? {
            type: "class" as const,
            name: entry.customClass?.name || entry.className
          }
        }))
      });
    }, emptyFeatureDerivedState);
    activeClassFeatureStateCache.set(character, derived);
    return derived;
  }

  const activeModule = getActiveClassFeatureModule(character.className);

  if (!activeModule) {
    return emptyFeatureDerivedState;
  }

  if (activeClassFeatureDerivations.has(activeModule.className)) {
    return emptyFeatureDerivedState;
  }

  const safeCharacter = withClassFeatureDerivationDefaults(character);

  activeClassFeatureDerivations.add(activeModule.className);

  try {
    const classDerivedState = activeModule.collectDerived(safeCharacter);
    const neutralMechanicsDerivedState =
      activeModule.className === "Custom"
        ? emptyFeatureDerivedState
        : getClassNeutralMechanicsDerivedState(safeCharacter);
    const derivedState = mergeClassFeatureDerivedStates(
      classDerivedState,
      neutralMechanicsDerivedState
    );

    activeClassFeatureStateCache.set(character, derivedState);
    activeClassFeatureStateCache.set(safeCharacter, derivedState);
    return derivedState;
  } finally {
    activeClassFeatureDerivations.delete(activeModule.className);
  }
}

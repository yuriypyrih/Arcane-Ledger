import type { SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import type { WeaponAction } from "../gameplay";
import type {
  ClassFeatureDerivedState,
  FeatureActionCard,
  SpellFeatureContext
} from "../classFeatures/types";
import type { SubclassDerivedFeatureState } from "../classFeatures/subclassRuntime";
import { getFeatureSpellDamageBonuses } from "./compiler";
import type {
  CompiledFeatureContributionState,
  FeatureClassMechanicsContribution,
  FeatureInventoryAttunementLimitContribution
} from "./types";

export type FeatureContributionClassProjectionOptions<TDerivedState = unknown> = {
  character?: Character;
  derivedState?: TDerivedState;
};

function hasKeys(record: object): boolean {
  return Object.keys(record).length > 0;
}

function getLastDefined<TValue>(
  mechanics: readonly FeatureClassMechanicsContribution[],
  getValue: (mechanic: FeatureClassMechanicsContribution) => TValue | undefined
): TValue | undefined {
  for (let index = mechanics.length - 1; index >= 0; index -= 1) {
    const value = getValue(mechanics[index]);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function getProjectedActions<TDerivedState>(
  compiled: CompiledFeatureContributionState<TDerivedState>,
  options: FeatureContributionClassProjectionOptions<TDerivedState>
): FeatureActionCard[] {
  const factoryActions =
    options.character && options.derivedState
      ? compiled.actionFactories.flatMap((factory) =>
          factory(options.character as Character, options.derivedState as TDerivedState)
        )
      : [];

  return [...compiled.actions, ...factoryActions];
}

function getAlwaysPreparedSpellIds(
  compiled: Pick<
    CompiledFeatureContributionState,
    "alwaysPreparedSpellIds" | "alwaysPreparedCantripEntries" | "alwaysPreparedSpellEntries"
  >
): string[] {
  return [...new Set([
    ...compiled.alwaysPreparedSpellIds,
    ...compiled.alwaysPreparedCantripEntries.map((spell) => spell.id),
    ...compiled.alwaysPreparedSpellEntries.map((spell) => spell.id)
  ])];
}

function resolveSpellcastingState(
  states: CompiledFeatureContributionState["spellcastingStates"]
) {
  return states.find((state) => state.blocked) ?? states[states.length - 1];
}

function getSpellDamageFormulaOverride(
  compiled: Pick<
    CompiledFeatureContributionState,
    "spellDamageFormulaOverrides" | "spellDamageFormulaOverrideProviders"
  >,
  spell: Pick<SpellEntry, "id">
): string | null {
  const staticOverride = compiled.spellDamageFormulaOverrides[spell.id];

  if (staticOverride) {
    return staticOverride;
  }

  for (const provider of compiled.spellDamageFormulaOverrideProviders) {
    const override = provider.getOverride(spell);

    if (override) {
      return override;
    }
  }

  return null;
}

function resolveInventoryAttunementLimit(
  contributions: readonly FeatureInventoryAttunementLimitContribution[],
  defaultLimit: number
): number {
  return contributions.reduce((currentLimit, contribution) => {
    const nextLimit = contribution.getLimit({
      defaultLimit,
      currentLimit
    });

    return typeof nextLimit === "number" && Number.isFinite(nextLimit)
      ? Math.max(currentLimit, Math.floor(nextLimit))
      : currentLimit;
  }, defaultLimit);
}

function applyClassMechanics(
  state: ClassFeatureDerivedState,
  mechanics: readonly FeatureClassMechanicsContribution[]
) {
  const weaponMastery = getLastDefined(mechanics, (mechanic) => mechanic.weaponMastery);
  const magicTemporaryHitPointsFeature = getLastDefined(
    mechanics,
    (mechanic) => mechanic.magicTemporaryHitPointsFeature
  );
  const bardicInspirationDie = getLastDefined(
    mechanics,
    (mechanic) => mechanic.bardicInspirationDie
  );
  const monkMartialArtsDie = getLastDefined(
    mechanics,
    (mechanic) => mechanic.monkMartialArtsDie
  );
  const rogueSneakAttackDiceCount = getLastDefined(
    mechanics,
    (mechanic) => mechanic.rogueSneakAttackDiceCount
  );
  const rogueSneakAttackFormula = getLastDefined(
    mechanics,
    (mechanic) => mechanic.rogueSneakAttackFormula
  );
  const monkUnarmedDamageTypeLabel = getLastDefined(
    mechanics,
    (mechanic) => mechanic.monkUnarmedDamageTypeLabel
  );
  const getUnarmedStrikeConfig = getLastDefined(
    mechanics,
    (mechanic) => mechanic.getUnarmedStrikeConfig
  );
  const canUseMonkMartialArts = getLastDefined(
    mechanics,
    (mechanic) => mechanic.canUseMonkMartialArts
  );

  if (weaponMastery) state.weaponMastery = weaponMastery;
  if (magicTemporaryHitPointsFeature !== undefined) {
    state.magicTemporaryHitPointsFeature = magicTemporaryHitPointsFeature;
  }
  if (bardicInspirationDie !== undefined) state.bardicInspirationDie = bardicInspirationDie;
  if (monkMartialArtsDie !== undefined) state.monkMartialArtsDie = monkMartialArtsDie;
  if (rogueSneakAttackDiceCount !== undefined) {
    state.rogueSneakAttackDiceCount = rogueSneakAttackDiceCount;
  }
  if (rogueSneakAttackFormula !== undefined) state.rogueSneakAttackFormula = rogueSneakAttackFormula;
  if (monkUnarmedDamageTypeLabel !== undefined) {
    state.monkUnarmedDamageTypeLabel = monkUnarmedDamageTypeLabel;
  }
  if (getUnarmedStrikeConfig) state.getUnarmedStrikeConfig = getUnarmedStrikeConfig;
  if (canUseMonkMartialArts) state.canUseMonkMartialArts = canUseMonkMartialArts;
}

function applySubclassMechanics(
  state: SubclassDerivedFeatureState,
  mechanics: readonly FeatureClassMechanicsContribution[]
) {
  const magicTemporaryHitPointsFeature = getLastDefined(
    mechanics,
    (mechanic) => mechanic.magicTemporaryHitPointsFeature
  );
  const getUnarmedStrikeConfig = getLastDefined(
    mechanics,
    (mechanic) => mechanic.getUnarmedStrikeConfig
  );

  if (magicTemporaryHitPointsFeature !== undefined) {
    state.magicTemporaryHitPointsFeature = magicTemporaryHitPointsFeature;
  }
  if (getUnarmedStrikeConfig) state.getUnarmedStrikeConfig = getUnarmedStrikeConfig;
}

export function projectCompiledContributionsToClassFeatureDerivedState<
  TDerivedState = unknown
>(
  compiled: CompiledFeatureContributionState<TDerivedState>,
  options: FeatureContributionClassProjectionOptions<TDerivedState> = {}
): ClassFeatureDerivedState {
  const state: ClassFeatureDerivedState = {};
  const actions = getProjectedActions(compiled, options);
  const alwaysPreparedSpellIds = getAlwaysPreparedSpellIds(compiled);

  if (actions.length > 0) state.actions = actions;
  if (hasKeys(compiled.actionOptions)) {
    state.actionOptions = compiled.actionOptions;
  }
  if (compiled.equipmentEntries.length > 0) state.equipmentEntries = compiled.equipmentEntries;
  if (compiled.weaponActions.length > 0) state.weaponActions = compiled.weaponActions;
  if (compiled.weaponDamageBonuses.length > 0) {
    state.getWeaponDamageBonuses = (context) =>
      compiled.weaponDamageBonuses.flatMap((contribution) => contribution.getBonuses(context));
  }
  if (compiled.spellDamageBonuses.length > 0 && options.character) {
    state.getSpellDamageBonuses = (context: SpellFeatureContext) =>
      getFeatureSpellDamageBonuses(compiled, {
        ...context,
        character: options.character as Character
      });
  }
  if (compiled.initiativeBonuses.length > 0) {
    state.getInitiativeBonuses = () =>
      compiled.initiativeBonuses.flatMap((contribution) => contribution.getBonuses());
  }
  if (compiled.savingThrowBonuses.length > 0) {
    state.getSavingThrowBonuses = (ability) =>
      compiled.savingThrowBonuses.flatMap((contribution) => contribution.getBonuses(ability));
  }
  if (hasKeys(compiled.savingThrowIndicators)) state.savingThrowIndicators = compiled.savingThrowIndicators;
  if (hasKeys(compiled.abilityCheckIndicators)) state.abilityCheckIndicators = compiled.abilityCheckIndicators;
  if (hasKeys(compiled.coreStatIndicators)) state.coreStatIndicators = compiled.coreStatIndicators;
  if (hasKeys(compiled.skillIndicators)) state.skillIndicators = compiled.skillIndicators;
  if (compiled.skillBonuses.length > 0) {
    state.getSkillBonuses = (skill, proficiencyLevel) =>
      compiled.skillBonuses.flatMap((contribution) =>
        contribution.getBonuses(skill, proficiencyLevel)
      );
  }
  if (compiled.spellcastingStates.length > 0) state.spellcastingState = resolveSpellcastingState(compiled.spellcastingStates);
  if (compiled.armorClassModes.length > 0) {
    state.getArmorClassModes = (context) =>
      compiled.armorClassModes.flatMap((contribution) => contribution.getModes(context));
  }
  if (compiled.armorClassBonuses.length > 0) {
    state.getArmorClassBonuses = (context) =>
      compiled.armorClassBonuses.flatMap((contribution) => contribution.getBonuses(context));
  }
  if (compiled.inventoryAttunementLimits.length > 0) {
    state.getInventoryAttunementLimit = (defaultLimit) =>
      resolveInventoryAttunementLimit(compiled.inventoryAttunementLimits, defaultLimit);
  }
  if (compiled.speedBonuses.length > 0 || compiled.speedBonusProviders.length > 0) {
    state.getSpeedBonuses = (context) => [
      ...compiled.speedBonuses,
      ...compiled.speedBonusProviders.flatMap((contribution) => contribution.getBonuses(context))
    ];
  }
  if (compiled.abilityScoreBonuses.length > 0) state.abilityScoreBonuses = compiled.abilityScoreBonuses;
  if (compiled.cantripLimitBonus !== 0) state.cantripLimitBonus = compiled.cantripLimitBonus;
  if (compiled.cantripDamageBonus !== 0) state.cantripDamageBonus = compiled.cantripDamageBonus;
  if (compiled.weaponProficiencyEntries.length > 0) state.weaponProficiencyEntries = compiled.weaponProficiencyEntries;
  if (compiled.skillProficiencyEntries.length > 0) state.skillProficiencyEntries = compiled.skillProficiencyEntries;
  if (compiled.savingThrowProficiencyEntries.length > 0) {
    state.savingThrowProficiencyEntries = compiled.savingThrowProficiencyEntries;
  }
  if (compiled.armorProficiencyEntries.length > 0) state.armorProficiencyEntries = compiled.armorProficiencyEntries;
  if (compiled.toolProficiencyEntries.length > 0) state.toolProficiencyEntries = compiled.toolProficiencyEntries;
  if (compiled.languageProficiencyEntries.length > 0) state.languageProficiencyEntries = compiled.languageProficiencyEntries;
  if (alwaysPreparedSpellIds.length > 0) state.alwaysPreparedSpellIds = alwaysPreparedSpellIds;
  if (Object.keys(compiled.alwaysPreparedSpellSourceMap).length > 0) {
    state.alwaysPreparedSpellSources = compiled.alwaysPreparedSpellSourceMap;
  }
  if (compiled.alwaysSpellbookSpellIds.length > 0) state.alwaysSpellbookSpellIds = compiled.alwaysSpellbookSpellIds;
  if (compiled.ritualOnlySpellIds.length > 0) state.ritualOnlySpellIds = compiled.ritualOnlySpellIds;
  if (compiled.statuses.length > 0) state.derivedStatusEntries = compiled.statuses;
  if (compiled.reactions.length > 0) state.reactionEntries = compiled.reactions;
  if (compiled.spellTransforms.length > 0) {
    state.transformSpellEntry = (spell) =>
      compiled.spellTransforms.reduce((nextSpell, contribution) => contribution.transform(nextSpell), spell);
  }
  if (compiled.commonActionTransforms.length > 0 && options.character) {
    state.transformCommonAction = (action) =>
      compiled.commonActionTransforms.reduce(
        (nextAction, contribution) =>
          contribution.transform(options.character as Character, nextAction),
        action
      );
  }
  if (compiled.featureActionTransforms.length > 0) {
    state.transformFeatureAction = (action) =>
      compiled.featureActionTransforms.reduce(
        (nextAction, contribution) => contribution.transform(nextAction),
        action
      );
  }
  if (compiled.weaponActionTransforms.length > 0 && options.character) {
    state.transformWeaponAction = (action: WeaponAction) =>
      compiled.weaponActionTransforms.reduce(
        (nextAction, contribution) =>
          contribution.transform(options.character as Character, nextAction) as WeaponAction,
        action
      );
  }
  if (
    Object.keys(compiled.spellDamageFormulaOverrides).length > 0 ||
    compiled.spellDamageFormulaOverrideProviders.length > 0
  ) {
    state.getSpellDamageFormulaOverride = (spell) =>
      getSpellDamageFormulaOverride(compiled, spell);
  }

  applyClassMechanics(state, compiled.classMechanics);
  return state;
}

export function projectCompiledContributionsToSubclassDerivedFeatureState<
  TDerivedState = unknown
>(
  compiled: CompiledFeatureContributionState<TDerivedState>,
  options: FeatureContributionClassProjectionOptions<TDerivedState> = {}
): SubclassDerivedFeatureState {
  const state: SubclassDerivedFeatureState = {};
  const actions = getProjectedActions(compiled, options);
  const alwaysPreparedSpellIds = getAlwaysPreparedSpellIds(compiled);

  if (actions.length > 0) state.featureActions = actions;
  if (hasKeys(compiled.actionOptions)) {
    state.featureActionOptions = compiled.actionOptions;
  }
  if (compiled.equipmentEntries.length > 0) state.equipmentEntries = compiled.equipmentEntries;
  if (compiled.weaponActions.length > 0) state.weaponActions = compiled.weaponActions;
  if (compiled.commonActionTransforms.length > 0 && options.character) {
    state.transformCommonAction = (action) =>
      compiled.commonActionTransforms.reduce(
        (nextAction, contribution) =>
          contribution.transform(options.character as Character, nextAction),
        action
      );
  }
  if (compiled.featureActionTransforms.length > 0) {
    state.transformFeatureAction = (action) =>
      compiled.featureActionTransforms.reduce(
        (nextAction, contribution) => contribution.transform(nextAction),
        action
      );
  }
  if (compiled.weaponActionTransforms.length > 0 && options.character) {
    state.transformWeaponAction = (action: WeaponAction) =>
      compiled.weaponActionTransforms.reduce(
        (nextAction, contribution) =>
          contribution.transform(options.character as Character, nextAction) as WeaponAction,
        action
      );
  }
  if (compiled.initiativeBonuses.length > 0) {
    state.getInitiativeBonuses = () =>
      compiled.initiativeBonuses.flatMap((contribution) => contribution.getBonuses());
  }
  if (compiled.savingThrowBonuses.length > 0) {
    state.getSavingThrowBonuses = (ability) =>
      compiled.savingThrowBonuses.flatMap((contribution) => contribution.getBonuses(ability));
  }
  if (hasKeys(compiled.savingThrowIndicators)) state.savingThrowIndicators = compiled.savingThrowIndicators;
  if (hasKeys(compiled.abilityCheckIndicators)) state.abilityCheckIndicators = compiled.abilityCheckIndicators;
  if (hasKeys(compiled.coreStatIndicators)) state.coreStatIndicators = compiled.coreStatIndicators;
  if (hasKeys(compiled.skillIndicators)) state.skillIndicators = compiled.skillIndicators;
  if (compiled.weaponAttackIndicators.length > 0) state.weaponAttackIndicators = compiled.weaponAttackIndicators;
  if (compiled.weaponDamageBonuses.length > 0) {
    state.getWeaponDamageBonuses = (context) =>
      compiled.weaponDamageBonuses.flatMap((contribution) => contribution.getBonuses(context));
  }
  if (compiled.spellDamageBonuses.length > 0 && options.character) {
    state.getSpellDamageBonuses = (context: SpellFeatureContext) =>
      getFeatureSpellDamageBonuses(compiled, {
        ...context,
        character: options.character as Character
      });
  }
  if (compiled.armorClassModes.length > 0) {
    state.getArmorClassModes = (context) =>
      compiled.armorClassModes.flatMap((contribution) => contribution.getModes(context));
  }
  if (compiled.armorClassBonuses.length > 0) {
    state.getArmorClassBonuses = (context) =>
      compiled.armorClassBonuses.flatMap((contribution) => contribution.getBonuses(context));
  }
  if (compiled.inventoryAttunementLimits.length > 0) {
    state.getInventoryAttunementLimit = (defaultLimit) =>
      resolveInventoryAttunementLimit(compiled.inventoryAttunementLimits, defaultLimit);
  }
  if (compiled.speedBonuses.length > 0) state.speedBonuses = compiled.speedBonuses;
  if (compiled.speedBonusProviders.length > 0) {
    state.getSpeedBonuses = (context) =>
      compiled.speedBonusProviders.flatMap((contribution) => contribution.getBonuses(context));
  }
  if (compiled.abilityScoreBonuses.length > 0) state.abilityScoreBonuses = compiled.abilityScoreBonuses;
  if (compiled.cantripLimitBonus !== 0) state.cantripLimitBonus = compiled.cantripLimitBonus;
  if (compiled.cantripDamageBonus !== 0) state.cantripDamageBonus = compiled.cantripDamageBonus;
  if (compiled.weaponProficiencyEntries.length > 0) state.weaponProficiencyEntries = compiled.weaponProficiencyEntries;
  if (compiled.skillProficiencyEntries.length > 0) state.skillProficiencyEntries = compiled.skillProficiencyEntries;
  if (compiled.savingThrowProficiencyEntries.length > 0) {
    state.savingThrowProficiencyEntries = compiled.savingThrowProficiencyEntries;
  }
  if (compiled.armorProficiencyEntries.length > 0) state.armorProficiencyEntries = compiled.armorProficiencyEntries;
  if (compiled.toolProficiencyEntries.length > 0) state.toolProficiencyEntries = compiled.toolProficiencyEntries;
  if (compiled.languageProficiencyEntries.length > 0) state.languageProficiencyEntries = compiled.languageProficiencyEntries;
  if (alwaysPreparedSpellIds.length > 0) state.alwaysPreparedSpellIds = alwaysPreparedSpellIds;
  if (Object.keys(compiled.alwaysPreparedSpellSourceMap).length > 0) {
    state.alwaysPreparedSpellSources = compiled.alwaysPreparedSpellSourceMap;
  }
  if (compiled.alwaysSpellbookSpellIds.length > 0) state.alwaysSpellbookSpellIds = compiled.alwaysSpellbookSpellIds;
  if (compiled.ritualOnlySpellIds.length > 0) state.ritualOnlySpellIds = compiled.ritualOnlySpellIds;
  if (compiled.statuses.length > 0) state.derivedStatusEntries = compiled.statuses;
  if (compiled.reactions.length > 0) state.reactionEntries = compiled.reactions;
  if (Object.keys(compiled.spellDamageFormulaOverrides).length > 0) {
    state.spellDamageFormulaOverrides = compiled.spellDamageFormulaOverrides;
  }
  if (compiled.spellDamageFormulaOverrideProviders.length > 0) {
    state.getSpellDamageFormulaOverride = (spell) =>
      getSpellDamageFormulaOverride(compiled, spell);
  }
  if (compiled.spellTransforms.length > 0) {
    state.transformSpellEntry = (spell) =>
      compiled.spellTransforms.reduce((nextSpell, contribution) => contribution.transform(nextSpell), spell);
  }

  applySubclassMechanics(state, compiled.classMechanics);
  return state;
}

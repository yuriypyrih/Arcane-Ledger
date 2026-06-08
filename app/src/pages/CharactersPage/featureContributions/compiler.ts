import type { SpellEntry } from "../../../codex/entries";
import { createSourcedDescriptionEntries } from "../actionModalDescriptions";
import { addSpellSource } from "../classFeatures/spellSources";
import type {
  CompiledFeatureContributionState,
  FeatureDescriptionContribution,
  FeatureDescriptionContributionContext,
  FeatureDescriptionContributionTarget,
  FeatureContributionSpec,
  FeatureFreeCastEntry,
  FeatureSpellCastEffectContext,
  FeatureSpellCastEffectContribution,
  FeatureSpellDamageBonusContext,
  FeatureSpellcastingAbilityEntry
} from "./types";

function sortSpellsByName(spells: SpellEntry[]): SpellEntry[] {
  return spells.sort((left, right) => left.name.localeCompare(right.name));
}

function appendRecordArrayValues<TValue>(
  target: Partial<Record<string, TValue[]>>,
  source: Partial<Record<string, TValue[]>> | null | undefined
) {
  Object.entries(source ?? {}).forEach(([key, values]) => {
    if (!values) {
      return;
    }

    target[key] = [...(target[key] ?? []), ...values];
  });
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function addSpellcastingAbility<TDerivedState>(
  compiled: CompiledFeatureContributionState<TDerivedState>,
  entry: FeatureSpellcastingAbilityEntry | null
) {
  if (!entry) {
    return;
  }

  compiled.spellcastingAbilityEntries.push(entry);
  compiled.spellcastingAbilityBySpellId.set(entry.spellId, entry.ability);
}

function addFreeCastEntry<TDerivedState>(
  compiled: CompiledFeatureContributionState<TDerivedState>,
  entry: FeatureFreeCastEntry | null
) {
  if (!entry) {
    return;
  }

  compiled.freeCastEntries.push(entry);
}

export function createEmptyCompiledFeatureContributionState<TDerivedState = unknown>(
  contributions: FeatureContributionSpec<TDerivedState>[]
): CompiledFeatureContributionState<TDerivedState> {
  return {
    contributions,
    resources: [],
    actions: [],
    actionOptions: {},
    actionFactories: [],
    reactions: [],
    statuses: [],
    equipmentEntries: [],
    weaponActions: [],
    descriptionAdditions: [],
    abilityScoreBonuses: [],
    speedBonuses: [],
    speedBonusProviders: [],
    weaponProficiencyEntries: [],
    skillProficiencyEntries: [],
    savingThrowProficiencyEntries: [],
    armorProficiencyEntries: [],
    toolProficiencyEntries: [],
    languageProficiencyEntries: [],
    hitPointMaximumBonus: 0,
    cantripLimitBonus: 0,
    cantripDamageBonus: 0,
    grantedCantripEntries: [],
    alwaysPreparedCantripEntries: [],
    alwaysPreparedSpellEntries: [],
    alwaysPreparedSpellSourceMap: {},
    spellcastingAbilityEntries: [],
    spellcastingAbilityBySpellId: new Map(),
    freeCastEntries: [],
    spellcastingStates: [],
    alwaysPreparedSpellIds: [],
    alwaysSpellbookSpellIds: [],
    ritualOnlySpellIds: [],
    spellTransforms: [],
    spellDamageBonuses: [],
    spellDamageFormulaOverrides: {},
    spellDamageFormulaOverrideProviders: [],
    weaponDamageBonuses: [],
    initiativeBonuses: [],
    savingThrowBonuses: [],
    skillBonuses: [],
    armorClassModes: [],
    armorClassBonuses: [],
    savingThrowIndicators: {},
    abilityCheckIndicators: {},
    coreStatIndicators: {},
    skillIndicators: {},
    weaponAttackIndicators: [],
    commonActionTransforms: [],
    featureActionTransforms: [],
    weaponActionTransforms: [],
    itemDescriptionTransforms: [],
    spellActionPaths: [],
    spellCastEffects: [],
    classMechanics: []
  };
}

export function compileFeatureContributions<TDerivedState = unknown>(
  contributions: FeatureContributionSpec<TDerivedState>[]
): CompiledFeatureContributionState<TDerivedState> {
  const compiled = createEmptyCompiledFeatureContributionState(contributions);
  const grantedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedSpellEntriesById = new Map<string, SpellEntry>();

  contributions.forEach((contribution) => {
    compiled.resources.push(...(contribution.resources ?? []));
    compiled.actions.push(...(contribution.actions ?? []));
    appendRecordArrayValues(compiled.actionOptions, contribution.actionOptions);
    compiled.actionFactories.push(...(contribution.actionFactories ?? []));
    compiled.reactions.push(...(contribution.reactions ?? []));
    compiled.statuses.push(...(contribution.statuses ?? []));
    compiled.equipmentEntries.push(...(contribution.equipmentEntries ?? []));
    compiled.weaponActions.push(...(contribution.weaponActions ?? []));
    compiled.descriptionAdditions.push(...(contribution.descriptionAdditions ?? []));
    compiled.abilityScoreBonuses.push(...(contribution.abilityScoreBonuses ?? []));
    compiled.speedBonuses.push(...(contribution.speedBonuses ?? []));
    compiled.speedBonusProviders.push(...(contribution.speedBonusProviders ?? []));
    compiled.weaponProficiencyEntries.push(...(contribution.weaponProficiencyEntries ?? []));
    compiled.skillProficiencyEntries.push(...(contribution.skillProficiencyEntries ?? []));
    compiled.savingThrowProficiencyEntries.push(
      ...(contribution.savingThrowProficiencyEntries ?? [])
    );
    compiled.armorProficiencyEntries.push(...(contribution.armorProficiencyEntries ?? []));
    compiled.toolProficiencyEntries.push(...(contribution.toolProficiencyEntries ?? []));
    compiled.languageProficiencyEntries.push(...(contribution.languageProficiencyEntries ?? []));
    compiled.hitPointMaximumBonus += contribution.hitPointMaximumBonus ?? 0;
    compiled.cantripLimitBonus += contribution.cantripLimitBonus ?? 0;
    compiled.cantripDamageBonus += contribution.cantripDamageBonus ?? 0;
    if (contribution.spellcastingState) {
      compiled.spellcastingStates.push(contribution.spellcastingState);
    }
    compiled.alwaysPreparedSpellIds.push(...(contribution.alwaysPreparedSpellIds ?? []));
    appendRecordArrayValues(
      compiled.alwaysPreparedSpellSourceMap,
      contribution.alwaysPreparedSpellSources
    );
    compiled.alwaysSpellbookSpellIds.push(...(contribution.alwaysSpellbookSpellIds ?? []));
    compiled.ritualOnlySpellIds.push(...(contribution.ritualOnlySpellIds ?? []));
    compiled.spellTransforms.push(...(contribution.spellTransforms ?? []));
    compiled.spellDamageBonuses.push(...(contribution.spellDamageBonuses ?? []));
    Object.assign(
      compiled.spellDamageFormulaOverrides,
      contribution.spellDamageFormulaOverrides ?? {}
    );
    compiled.spellDamageFormulaOverrideProviders.push(
      ...(contribution.spellDamageFormulaOverrideProviders ?? [])
    );
    compiled.weaponDamageBonuses.push(...(contribution.weaponDamageBonuses ?? []));
    compiled.initiativeBonuses.push(...(contribution.initiativeBonuses ?? []));
    compiled.savingThrowBonuses.push(...(contribution.savingThrowBonuses ?? []));
    compiled.skillBonuses.push(...(contribution.skillBonuses ?? []));
    compiled.armorClassModes.push(...(contribution.armorClassModes ?? []));
    compiled.armorClassBonuses.push(...(contribution.armorClassBonuses ?? []));
    appendRecordArrayValues(compiled.savingThrowIndicators, contribution.savingThrowIndicators);
    appendRecordArrayValues(compiled.abilityCheckIndicators, contribution.abilityCheckIndicators);
    appendRecordArrayValues(compiled.coreStatIndicators, contribution.coreStatIndicators);
    appendRecordArrayValues(compiled.skillIndicators, contribution.skillIndicators);
    compiled.weaponAttackIndicators.push(...(contribution.weaponAttackIndicators ?? []));
    compiled.commonActionTransforms.push(...(contribution.commonActionTransforms ?? []));
    compiled.featureActionTransforms.push(...(contribution.featureActionTransforms ?? []));
    compiled.weaponActionTransforms.push(...(contribution.weaponActionTransforms ?? []));
    compiled.itemDescriptionTransforms.push(...(contribution.itemDescriptionTransforms ?? []));
    compiled.spellActionPaths.push(...(contribution.spellActionPaths ?? []));
    compiled.spellCastEffects.push(...(contribution.spellCastEffects ?? []));
    if (contribution.classMechanics) {
      compiled.classMechanics.push(contribution.classMechanics);
    }

    (contribution.spellGrants ?? []).forEach((grant) => {
      const sourceLabel = grant.sourceLabel ?? contribution.source.label;

      if (grant.kind === "granted-cantrip") {
        grantedCantripEntriesById.set(grant.spell.id, grant.spell);
      } else if (grant.kind === "always-prepared-cantrip") {
        alwaysPreparedCantripEntriesById.set(grant.spell.id, grant.spell);
        addSpellSource(compiled.alwaysPreparedSpellSourceMap, grant.spell.id, sourceLabel);
      } else {
        alwaysPreparedSpellEntriesById.set(grant.spell.id, grant.spell);
        addSpellSource(compiled.alwaysPreparedSpellSourceMap, grant.spell.id, sourceLabel);
      }

      addSpellcastingAbility(
        compiled,
        grant.spellcastingAbility
          ? {
              sourceId: grant.spellcastingAbilitySourceId ?? contribution.source.id,
              entryId: contribution.source.entryId,
              spellId: grant.spell.id,
              ability: grant.spellcastingAbility
            }
          : null
      );

      if (grant.freeCast) {
        addFreeCastEntry(compiled, {
          ...grant.freeCast,
          sourceId: grant.freeCast.sourceId ?? contribution.source.id,
          entryId: grant.freeCast.entryId ?? contribution.source.entryId,
          spellId: grant.freeCast.spellId ?? grant.spell.id
        });
      }
    });
  });

  compiled.grantedCantripEntries = sortSpellsByName([...grantedCantripEntriesById.values()]);
  compiled.alwaysPreparedCantripEntries = sortSpellsByName([
    ...alwaysPreparedCantripEntriesById.values()
  ]);
  compiled.alwaysPreparedSpellEntries = sortSpellsByName([
    ...alwaysPreparedSpellEntriesById.values()
  ]);
  compiled.alwaysPreparedSpellIds = uniqueStrings(compiled.alwaysPreparedSpellIds);
  compiled.alwaysSpellbookSpellIds = uniqueStrings(compiled.alwaysSpellbookSpellIds);
  compiled.ritualOnlySpellIds = uniqueStrings(compiled.ritualOnlySpellIds);

  return compiled;
}

export function getFeatureSpellcastingAbilityForSpell(
  compiled: Pick<CompiledFeatureContributionState, "spellcastingAbilityBySpellId">,
  spellId: string
) {
  return compiled.spellcastingAbilityBySpellId.get(spellId) ?? null;
}

export function getFeatureSpellcastingAbilityEntriesBySource(
  compiled: Pick<CompiledFeatureContributionState, "spellcastingAbilityEntries">,
  sourceId: string
): FeatureSpellcastingAbilityEntry[] {
  return compiled.spellcastingAbilityEntries.filter((entry) => entry.sourceId === sourceId);
}

export function getFeatureFreeCastEntriesById(
  compiled: Pick<CompiledFeatureContributionState, "freeCastEntries">,
  id: string
): FeatureFreeCastEntry[] {
  return compiled.freeCastEntries.filter((entry) => entry.id === id);
}

export function getFeatureFreeCastEntriesBySource(
  compiled: Pick<CompiledFeatureContributionState, "freeCastEntries">,
  sourceId: string
): FeatureFreeCastEntry[] {
  return compiled.freeCastEntries.filter((entry) => entry.sourceId === sourceId);
}

export function getFeatureFreeCastState(
  compiled: Pick<CompiledFeatureContributionState, "freeCastEntries">,
  id: string,
  spellId?: string
) {
  const entries = getFeatureFreeCastEntriesById(compiled, id).filter((entry) =>
    spellId ? entry.spellId === spellId : true
  );

  if (entries.length === 0) {
    return null;
  }

  const usesTotal = entries.reduce(
    (total, entry) => total + (entry.usesTotal ?? 1),
    0
  );
  const usesRemaining = entries.reduce(
    (total, entry) =>
      total +
      (entry.usesRemaining ??
        (entry.expended === true ? 0 : entry.usesTotal === undefined ? 1 : entry.usesTotal)),
    0
  );

  return {
    usesRemaining,
    usesTotal
  };
}

function matchesDescriptionContribution(
  contribution: FeatureDescriptionContribution,
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
): boolean {
  if (contribution.target !== target) {
    return false;
  }

  return (
    !targetKey ||
    !contribution.targetKey ||
    contribution.targetKey === targetKey ||
    contribution.targetPredicateId === targetKey
  );
}

export function getFeatureDescriptionAdditions<TDerivedState = unknown>(
  compiled: Pick<CompiledFeatureContributionState<TDerivedState>, "descriptionAdditions">,
  target: FeatureDescriptionContributionTarget,
  context: FeatureDescriptionContributionContext & {
    targetKey?: string;
  } = {}
) {
  return compiled.descriptionAdditions.flatMap((contribution) => {
    if (!matchesDescriptionContribution(contribution, target, context.targetKey)) {
      return [];
    }

    const generatedAdditions =
      contribution.getDescriptionAdditions?.({
        ...context,
        targetKey: context.targetKey ?? contribution.targetKey
      }) ?? [];
    const staticAddition =
      contribution.descriptionEntries && contribution.descriptionEntries.length > 0
        ? [
            contribution.sourceLabel
              ? createSourcedDescriptionEntries(
                  contribution.sourceLabel,
                  contribution.descriptionEntries
                )
              : contribution.descriptionEntries
          ]
        : [];

    return [...staticAddition, ...generatedAdditions];
  });
}

export function getFeatureSpellDamageBonuses(
  compiled: Pick<CompiledFeatureContributionState, "spellDamageBonuses">,
  context: FeatureSpellDamageBonusContext
) {
  return compiled.spellDamageBonuses.flatMap((contribution) =>
    contribution.getBonuses(context)
  );
}

export function applyFeatureSpellCastEffects(
  effects: readonly FeatureSpellCastEffectContribution[],
  character: Parameters<NonNullable<FeatureSpellCastEffectContribution["apply"]>>[0],
  context: FeatureSpellCastEffectContext,
  effectIds: readonly string[] | null | undefined
) {
  const uniqueEffectIds = [...new Set(effectIds ?? [])];

  if (uniqueEffectIds.length === 0) {
    return character;
  }

  const effectsById = new Map(effects.map((effect) => [effect.id, effect]));
  let nextCharacter = character;

  for (const effectId of uniqueEffectIds) {
    const effect = effectsById.get(effectId);

    if (!effect) {
      continue;
    }

    const nextEffectCharacter = effect.apply?.(nextCharacter, {
      ...context,
      spellCastEffectIds: uniqueEffectIds
    });

    if (!nextEffectCharacter || nextEffectCharacter === nextCharacter) {
      return null;
    }

    nextCharacter = nextEffectCharacter;
  }

  return nextCharacter;
}

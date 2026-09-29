import type { SpellEntry } from "../../../codex/entries";
import { createSourcedDescriptionEntries } from "../actionModalDescriptions";
import { addSpellSource } from "../classFeatures/spellSources";
import type {
  CompiledFeatureContributionState,
  FeatureDescriptionContribution,
  FeatureDescriptionContributionContext,
  FeatureDescriptionContributionTarget,
  FeatureContributionSpec,
  FeatureContributionSource,
  FeatureSpellGrant,
  FeatureFreeCastEntry,
  FeatureSpellCastEffectContext,
  FeatureSpellCastEffectContribution,
  FeatureSpellDamageBonusContext,
  FeatureSpellcastingAbilityEntry
} from "./types";

function sortSpellsByName(spells: SpellEntry[]): SpellEntry[] {
  return spells.sort((left, right) => left.name.localeCompare(right.name));
}

const compiledByCollector = new WeakMap<
  object,
  WeakMap<object, CompiledFeatureContributionState<unknown>>
>();

/** Reuse active contributions across projections of one immutable character context. */
export function getCompiledFeatureContributions<TCharacter extends object, TDerivedState = unknown>(
  character: TCharacter,
  collect: (character: TCharacter) => FeatureContributionSpec<TDerivedState>[]
): CompiledFeatureContributionState<TDerivedState> {
  let snapshots = compiledByCollector.get(collect);
  if (!snapshots) {
    snapshots = new WeakMap();
    compiledByCollector.set(collect, snapshots);
  }
  const cached = snapshots.get(character);
  if (cached) return cached as CompiledFeatureContributionState<TDerivedState>;
  const compiled = compileFeatureContributions(collect(character));
  snapshots.set(character, compiled as CompiledFeatureContributionState<unknown>);
  return compiled;
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

function resolveFreeCastEntry(
  source: FeatureContributionSource,
  grant: FeatureSpellGrant
): FeatureFreeCastEntry | null {
  return grant.freeCast
    ? {
        ...grant.freeCast,
        sourceId: grant.freeCast.sourceId ?? source.id,
        entryId: grant.freeCast.entryId ?? source.entryId,
        spellId: grant.freeCast.spellId ?? grant.spell.id
      }
    : null;
}

/** Resource derivation can inspect grants before the complete collection is ready to compile. */
export function collectFeatureFreeCastEntries<TDerivedState>(
  contributions: FeatureContributionSpec<TDerivedState>[]
): FeatureFreeCastEntry[] {
  return contributions.flatMap((contribution) =>
    (contribution.spellGrants ?? []).flatMap((grant) => {
      const entry = resolveFreeCastEntry(contribution.source, grant);
      return entry ? [entry] : [];
    })
  );
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
    inventoryAttunementLimits: [],
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
    compiled.inventoryAttunementLimits.push(...(contribution.inventoryAttunementLimits ?? []));
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

      const freeCastEntry = resolveFreeCastEntry(contribution.source, grant);
      if (freeCastEntry) compiled.freeCastEntries.push(freeCastEntry);
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

  const usesTotal = entries.reduce((total, entry) => total + (entry.usesTotal ?? 1), 0);
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

type DescriptionIndex = Map<
  FeatureDescriptionContributionTarget,
  {
    all: FeatureDescriptionContribution[];
    byKey: Map<string, FeatureDescriptionContribution[]>;
  }
>;
const descriptionIndexes = new WeakMap<FeatureDescriptionContribution[], DescriptionIndex>();

function getDescriptionCandidates(
  descriptions: FeatureDescriptionContribution[],
  target: FeatureDescriptionContributionTarget,
  key?: string
) {
  let index = descriptionIndexes.get(descriptions);
  if (!index) {
    index = new Map();
    for (const description of descriptions) {
      let group = index.get(description.target);
      if (!group) {
        group = { all: [], byKey: new Map() };
        index.set(description.target, group);
      }
      group.all.push(description);
    }
    descriptionIndexes.set(descriptions, index);
  }
  const group = index.get(target);
  if (!group) return [];
  if (!key) return group.all;
  let matches = group.byKey.get(key);
  if (!matches) {
    matches = group.all.filter(
      (entry) => !entry.targetKey || entry.targetKey === key || entry.targetPredicateId === key
    );
    group.byKey.set(key, matches);
  }
  return matches;
}

export function getFeatureDescriptionAdditions<TDerivedState = unknown>(
  compiled: Pick<CompiledFeatureContributionState<TDerivedState>, "descriptionAdditions">,
  target: FeatureDescriptionContributionTarget,
  context: FeatureDescriptionContributionContext & {
    targetKey?: string;
  } = {}
) {
  return getDescriptionCandidates(compiled.descriptionAdditions, target, context.targetKey).flatMap(
    (contribution) => {
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
    }
  );
}

export function getFeatureSpellDamageBonuses(
  compiled: Pick<CompiledFeatureContributionState, "spellDamageBonuses">,
  context: FeatureSpellDamageBonusContext
) {
  return compiled.spellDamageBonuses.flatMap((contribution) => contribution.getBonuses(context));
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

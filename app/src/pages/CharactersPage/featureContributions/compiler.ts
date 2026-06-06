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
  FeatureSpellcastingAbilityEntry
} from "./types";

function sortSpellsByName(spells: SpellEntry[]): SpellEntry[] {
  return spells.sort((left, right) => left.name.localeCompare(right.name));
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
    actionFactories: [],
    reactions: [],
    statuses: [],
    descriptionAdditions: [],
    abilityScoreBonuses: [],
    speedBonuses: [],
    weaponProficiencyEntries: [],
    skillProficiencyEntries: [],
    savingThrowProficiencyEntries: [],
    armorProficiencyEntries: [],
    toolProficiencyEntries: [],
    languageProficiencyEntries: [],
    hitPointMaximumBonus: 0,
    grantedCantripEntries: [],
    alwaysPreparedCantripEntries: [],
    alwaysPreparedSpellEntries: [],
    alwaysPreparedSpellSourceMap: {},
    spellcastingAbilityEntries: [],
    spellcastingAbilityBySpellId: new Map(),
    freeCastEntries: [],
    spellTransforms: [],
    commonActionTransforms: [],
    weaponActionTransforms: [],
    itemDescriptionTransforms: [],
    spellActionPaths: [],
    spellCastEffects: []
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
    compiled.actionFactories.push(...(contribution.actionFactories ?? []));
    compiled.reactions.push(...(contribution.reactions ?? []));
    compiled.statuses.push(...(contribution.statuses ?? []));
    compiled.descriptionAdditions.push(...(contribution.descriptionAdditions ?? []));
    compiled.abilityScoreBonuses.push(...(contribution.abilityScoreBonuses ?? []));
    compiled.speedBonuses.push(...(contribution.speedBonuses ?? []));
    compiled.weaponProficiencyEntries.push(...(contribution.weaponProficiencyEntries ?? []));
    compiled.skillProficiencyEntries.push(...(contribution.skillProficiencyEntries ?? []));
    compiled.savingThrowProficiencyEntries.push(
      ...(contribution.savingThrowProficiencyEntries ?? [])
    );
    compiled.armorProficiencyEntries.push(...(contribution.armorProficiencyEntries ?? []));
    compiled.toolProficiencyEntries.push(...(contribution.toolProficiencyEntries ?? []));
    compiled.languageProficiencyEntries.push(...(contribution.languageProficiencyEntries ?? []));
    compiled.hitPointMaximumBonus += contribution.hitPointMaximumBonus ?? 0;
    compiled.spellTransforms.push(...(contribution.spellTransforms ?? []));
    compiled.commonActionTransforms.push(...(contribution.commonActionTransforms ?? []));
    compiled.weaponActionTransforms.push(...(contribution.weaponActionTransforms ?? []));
    compiled.itemDescriptionTransforms.push(...(contribution.itemDescriptionTransforms ?? []));
    compiled.spellActionPaths.push(...(contribution.spellActionPaths ?? []));
    compiled.spellCastEffects.push(...(contribution.spellCastEffects ?? []));

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

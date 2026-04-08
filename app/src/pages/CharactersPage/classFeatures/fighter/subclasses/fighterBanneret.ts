import {
  banneretBolsteredGroupRecoveryDescription,
  banneretBolsteredRallyingSurgeDescription,
  banneretGroupRecoveryDescription,
  banneretRallyingSurgeDescription,
  banneretSharedResilienceDescription,
  banneretTeamTacticsDescription
} from "../../../../../codex/subclasses/fighterBanneret";
import { getReactionEntryById } from "../../../../../codex/entries";
import type {
  Character,
  CharacterFighterFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry
} from "../../../../../types";
import {
  CONDITION_NAME,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  getSkillProficiencyForSkillName,
  isSkillName,
  languageEntries
} from "../../../../../types";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSkillProficiencyEntry
} from "../../types";
import {
  appendSourcedDescriptionAddition,
  descriptionValueSomeText
} from "../../../actionModalDescriptions";
import {
  fighterBanneretInspiringCommanderCharmedImmunitySourceId,
  fighterBanneretInspiringCommanderFrightenedImmunitySourceId,
  fighterBanneretInspiringCommanderSource,
  fighterBanneretTeamTacticsEffectName,
  fighterBanneretTeamTacticsStatusSource,
  fighterBanneretTeamTacticsStatusSourceId
} from "./fighterBanneretShared";

export const banneretSubclassId = "fighter-banneret";

const fighterActionSurgeActionKey = "fighter-action-surge";
const fighterSecondWindActionKey = "fighter-second-wind";
const knightlyEnvoySource = "Knightly Envoy";
const comprehendLanguagesSpellId = "spell-comprehend-languages";
const fighterBanneretLanguageOptions = languageEntries.map((entry) => entry.proficiency);

export const fighterBanneretKnightlyEnvoySkillOptions = [
  SKILL.INSIGHT,
  SKILL.INTIMIDATION,
  SKILL.PERSUASION,
  SKILL.PERFORMANCE
] as const satisfies readonly SkillName[];

const sharedResilienceDescriptionEntries = [...banneretSharedResilienceDescription];
const teamTacticsDescriptionEntries = [...banneretTeamTacticsDescription];

function hasFighterBanneretFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === banneretSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function hasFighterBanneretKnightlyEnvoy(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBanneretFeature(character, 3);
}

export function hasFighterBanneretGroupRecovery(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBanneretFeature(character, 3);
}

export function hasFighterBanneretTeamTactics(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBanneretFeature(character, 7);
}

export function hasFighterBanneretSharedResilience(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBanneretFeature(character, 15);
}

export function hasFighterBanneretInspiringCommander(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBanneretFeature(character, 18);
}

function getFighterBanneretGroupRecoveryDescriptionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return hasFighterBanneretInspiringCommander(character)
    ? [...banneretBolsteredGroupRecoveryDescription]
    : [...banneretGroupRecoveryDescription];
}

function getFighterBanneretRallyingSurgeDescriptionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return hasFighterBanneretInspiringCommander(character)
    ? [...banneretBolsteredRallyingSurgeDescription]
    : [...banneretRallyingSurgeDescription];
}

function getFighterBanneretDerivedStatusEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasFighterBanneretInspiringCommander(character)) {
    return [];
  }

  return [
    {
      id: fighterBanneretInspiringCommanderCharmedImmunitySourceId,
      sourceId: fighterBanneretInspiringCommanderCharmedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: fighterBanneretInspiringCommanderSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    },
    {
      id: fighterBanneretInspiringCommanderFrightenedImmunitySourceId,
      sourceId: fighterBanneretInspiringCommanderFrightenedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.FRIGHTENED,
      source: fighterBanneretInspiringCommanderSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function normalizeFighterBanneretLanguageSelection(
  value: unknown
): LANGUAGE_PROFICIENCY | undefined {
  return typeof value === "string" &&
    fighterBanneretLanguageOptions.includes(value as LANGUAGE_PROFICIENCY)
    ? (value as LANGUAGE_PROFICIENCY)
    : undefined;
}

function normalizeFighterBanneretSkillSelection(value: unknown): SkillName | undefined {
  return typeof value === "string" &&
    isSkillName(value) &&
    fighterBanneretKnightlyEnvoySkillOptions.some((option) => option === value)
    ? value
    : undefined;
}

function getFighterStateRecord(
  value: Partial<CharacterFighterFeatureState> | undefined
): Partial<CharacterFighterFeatureState> {
  return value && typeof value === "object" ? value : {};
}

function createKnightlyEnvoySkillEntry(skill: SkillName): SkillProficiencyEntry | null {
  const proficiency = getSkillProficiencyForSkillName(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: knightlyEnvoySource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  } satisfies SkillProficiencyEntry;
}

function appendFeatureDescriptionSections(
  action: FeatureActionCard,
  actionKey: string,
  sections: Array<{
    sourceName: string;
    descriptionEntries: string[];
  }>
) {
  if (action.key !== actionKey || sections.length === 0) {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);
  let nextAction: FeatureActionCard = {
    ...action,
    description
  };
  let hasChanges = false;

  sections.forEach(({ sourceName, descriptionEntries }) => {
    if (
      descriptionValueSomeText(nextAction, (entry) =>
        entry.includes(`<strong>${sourceName}.</strong>`)
      )
    ) {
      return;
    }

    nextAction = appendSourcedDescriptionAddition(nextAction, sourceName, descriptionEntries);
    hasChanges = true;
  });

  return hasChanges ? nextAction : action;
}

export function normalizeFighterBanneretFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterFighterFeatureState,
  | "banneretKnightlyEnvoyLanguage"
  | "banneretKnightlyEnvoySkill"
  | "banneretGroupRecoveryUsesExpended"
> {
  const hasKnightlyEnvoy = hasFighterBanneretKnightlyEnvoy(character);
  const hasGroupRecovery = hasFighterBanneretGroupRecovery(character);

  return {
    banneretKnightlyEnvoyLanguage: hasKnightlyEnvoy
      ? normalizeFighterBanneretLanguageSelection(value.banneretKnightlyEnvoyLanguage)
      : undefined,
    banneretKnightlyEnvoySkill: hasKnightlyEnvoy
      ? normalizeFighterBanneretSkillSelection(value.banneretKnightlyEnvoySkill)
      : undefined,
    banneretGroupRecoveryUsesExpended: hasGroupRecovery
      ? Math.max(
          0,
          Math.min(
            1,
            Number.isFinite(Number(value.banneretGroupRecoveryUsesExpended))
              ? Math.floor(Number(value.banneretGroupRecoveryUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

export function getFighterBanneretKnightlyEnvoyLanguageSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): LANGUAGE_PROFICIENCY | null {
  if (!hasFighterBanneretKnightlyEnvoy(character)) {
    return null;
  }

  return (
    normalizeFighterBanneretFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .banneretKnightlyEnvoyLanguage ?? null
  );
}

export function setFighterBanneretKnightlyEnvoyLanguageSelection(
  character: Character,
  selection: LANGUAGE_PROFICIENCY | null
): Character {
  if (!hasFighterBanneretKnightlyEnvoy(character)) {
    return character;
  }

  const fighterState = getFighterStateRecord(character.classFeatureState?.fighter);
  const nextSelection = selection
    ? normalizeFighterBanneretLanguageSelection(selection)
    : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizeFighterBanneretFeatureState(fighterState, character),
        banneretKnightlyEnvoyLanguage: nextSelection
      }
    }
  };
}

export function getFighterBanneretKnightlyEnvoySkillSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): SkillName | null {
  if (!hasFighterBanneretKnightlyEnvoy(character)) {
    return null;
  }

  return (
    normalizeFighterBanneretFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .banneretKnightlyEnvoySkill ?? null
  );
}

export function setFighterBanneretKnightlyEnvoySkillSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasFighterBanneretKnightlyEnvoy(character)) {
    return character;
  }

  const fighterState = getFighterStateRecord(character.classFeatureState?.fighter);
  const nextSelection = selection ? normalizeFighterBanneretSkillSelection(selection) : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizeFighterBanneretFeatureState(fighterState, character),
        banneretKnightlyEnvoySkill: nextSelection
      }
    }
  };
}

export function getFighterBanneretLanguageProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): FeatureLanguageProficiencyEntry[] {
  const selection = getFighterBanneretKnightlyEnvoyLanguageSelection(character);

  if (!selection) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: knightlyEnvoySource,
      proficiency: selection,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies LanguageProficiencyEntry
  ];
}

export function getFighterBanneretSkillProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): FeatureSkillProficiencyEntry[] {
  const selection = getFighterBanneretKnightlyEnvoySkillSelection(character);

  if (!selection) {
    return [];
  }

  const entry = createKnightlyEnvoySkillEntry(selection);
  return entry ? [entry] : [];
}

export function getFighterBanneretGroupRecoveryUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterBanneretGroupRecovery(character) ? 1 : 0;
}

export function getFighterBanneretGroupRecoveryUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getFighterBanneretGroupRecoveryUsesTotal(character);
  const usesExpended =
    normalizeFighterBanneretFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .banneretGroupRecoveryUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterBanneretGroupRecoveryHealingFormula(
  character: Pick<Character, "level">
): string {
  return `1d4+${Math.max(1, Math.floor(character.level ?? 1))}`;
}

export function applyFighterBanneretTeamTacticsStatus(character: Character): Character {
  if (!hasFighterBanneretTeamTactics(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== fighterBanneretTeamTacticsStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: fighterBanneretTeamTacticsEffectName,
        source: fighterBanneretTeamTacticsStatusSource,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: fighterBanneretTeamTacticsStatusSourceId
      })
    ]
  };
}

export function consumeFighterBanneretGroupRecoveryUse(character: Character): Character {
  if (!hasFighterBanneretGroupRecovery(character)) {
    return character;
  }

  const fighterState = getFighterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBanneretFeatureState(fighterState, character);

  if ((normalizedState.banneretGroupRecoveryUsesExpended ?? 0) >= 1) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        banneretGroupRecoveryUsesExpended:
          (normalizedState.banneretGroupRecoveryUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreFighterBanneretGroupRecoveryOnShortRest(character: Character): Character {
  if (!hasFighterBanneretGroupRecovery(character)) {
    return character;
  }

  const fighterState = getFighterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBanneretFeatureState(fighterState, character);

  if ((normalizedState.banneretGroupRecoveryUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        banneretGroupRecoveryUsesExpended: 0
      }
    }
  };
}

export function restoreFighterBanneretGroupRecoveryOnLongRest(character: Character): Character {
  return restoreFighterBanneretGroupRecoveryOnShortRest(character);
}

export const getFighterBanneretDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (
    character.className !== "Fighter" ||
    character.subclassId !== banneretSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  return {
    alwaysPreparedSpellIds: [comprehendLanguagesSpellId],
    ritualOnlySpellIds: [comprehendLanguagesSpellId],
    languageProficiencyEntries: getFighterBanneretLanguageProficiencyEntries(character),
    skillProficiencyEntries: getFighterBanneretSkillProficiencyEntries(character),
    derivedStatusEntries: getFighterBanneretDerivedStatusEntries(character),
    transformFeatureAction: (action) => {
      const secondWindAction = appendFeatureDescriptionSections(
        action,
        fighterSecondWindActionKey,
        [
          {
            sourceName: "Group Recovery",
            descriptionEntries: getFighterBanneretGroupRecoveryDescriptionEntries(character)
          },
          ...(hasFighterBanneretTeamTactics(character)
            ? [
                {
                  sourceName: "Team Tactics",
                  descriptionEntries: teamTacticsDescriptionEntries
                }
              ]
            : [])
        ]
      );

      return appendFeatureDescriptionSections(secondWindAction, fighterActionSurgeActionKey, [
        ...(hasFighterBanneretFeature(character, 10)
          ? [
              {
                sourceName: "Rallying Surge",
                descriptionEntries: getFighterBanneretRallyingSurgeDescriptionEntries(character)
              }
            ]
          : [])
      ]);
    },
    reactionEntries: hasFighterBanneretSharedResilience(character)
      ? (() => {
          const sharedResilience = getReactionEntryById("reaction-banneret-shared-resilience");
          return sharedResilience
            ? [{ ...sharedResilience, description: sharedResilienceDescriptionEntries }]
            : [];
        })()
      : undefined
  };
};

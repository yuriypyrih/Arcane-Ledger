import { sorcererFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  activateTelepathicBond,
  createTelepathicBondFeatureAction,
  getTelepathicBondDurationMinutes
} from "../../shared/telepathicBond";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureSpeedBonus
} from "../../types";

export const aberrantSorcerySubclassId = "sorcerer-aberrant-sorcery";
export const sorcererTelepathicSpeechActionKey = "sorcerer-aberrant-sorcery-telepathic-speech";
export const sorcererTelepathicSpeechStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-telepathic-speech";
export const sorcererPsychicDefensesStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-psychic-defenses";
export const sorcererRevelationInFleshActionKey =
  "sorcerer-aberrant-sorcery-revelation-in-flesh";
export const sorcererWarpingImplosionActionKey =
  "sorcerer-aberrant-sorcery-warping-implosion";
export const sorcererRevelationInFleshAquaticAdaptationStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-aquatic-adaptation";
export const sorcererRevelationInFleshGlisteningFlightStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-glistening-flight";
export const sorcererRevelationInFleshSeeTheInvisibleStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-see-the-invisible";
export const sorcererRevelationInFleshWormlikeMovementStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-wormlike-movement";

const aberrantSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Arms of Hadar",
    "Calm Emotions",
    "Detect Thoughts",
    "Dissonant Whispers",
    "Mind Sliver"
  ]),
  5: resolveSpellIdsByName(["Hunger of Hadar", "Sending"]),
  7: resolveSpellIdsByName(["Evard's Black Tentacles", "Summon Aberration"]),
  9: resolveSpellIdsByName(["Rary's Telepathic Bond", "Telekinesis"])
} as const;

const telepathicSpeechName = "Telepathic Speech";
const telepathicSpeechSource = "Aberrant Sorcery";
const psychicDefensesName = "Psychic Defenses";
const revelationInFleshName = "Revelation in Flesh";
const revelationInFleshDurationMinutes = 10;
const warpingImplosionName = "Warping Implosion";
const warpingImplosionUsesTotal = 1;
const warpingImplosionFallbackSorceryPointCost = 5;

type RevelationInFleshAlterationDefinition = {
  key: string;
  name: string;
  heading: string;
  summary: string;
  detail: string;
  statusSourceId: string;
};

const revelationInFleshAlterationDefinitions: RevelationInFleshAlterationDefinition[] = [
  {
    key: "aquatic-adaptation",
    name: "Aquatic Adaptation",
    heading: "<strong>Aquatic Adaptation.</strong>",
    summary: "Gain a swim speed and breathe underwater.",
    detail: "Gain a swim speed equal to twice your Speed and breathe underwater.",
    statusSourceId: sorcererRevelationInFleshAquaticAdaptationStatusSourceId
  },
  {
    key: "glistening-flight",
    name: "Glistening Flight",
    heading: "<strong>Glistening Flight.</strong>",
    summary: "Gain a fly speed and hover.",
    detail: "Gain a fly speed equal to your Speed and the ability to hover.",
    statusSourceId: sorcererRevelationInFleshGlisteningFlightStatusSourceId
  },
  {
    key: "see-the-invisible",
    name: "See the Invisible",
    heading: "<strong>See the Invisible.</strong>",
    summary: "Perceive nearby invisible creatures.",
    detail: "See Invisible creatures within 60 feet that aren't behind Total Cover.",
    statusSourceId: sorcererRevelationInFleshSeeTheInvisibleStatusSourceId
  },
  {
    key: "wormlike-movement",
    name: "Wormlike Movement",
    heading: "<strong>Wormlike Movement.</strong>",
    summary: "Slip through tight spaces and escape restraints.",
    detail: "Move through 1-inch spaces and spend 5 feet of movement to escape restraints.",
    statusSourceId: sorcererRevelationInFleshWormlikeMovementStatusSourceId
  }
];

function extractSubclassFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

function getSorcererFeatureRow(level: number | undefined) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getSorcererAberrantSorceryPointsTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return character.className === "Sorcerer"
    ? Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0)
    : 0;
}

function getSorcererAberrantSorceryPointsRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState">>
): number {
  const totalPoints = getSorcererAberrantSorceryPointsTotal(character);
  const expendedPoints = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);

  return Math.max(
    0,
    totalPoints -
      (Number.isFinite(expendedPoints)
        ? Math.max(0, Math.min(totalPoints, Math.floor(expendedPoints)))
        : 0)
  );
}

function spendSorcererAberrantSorceryPoints(character: Character, cost: number): Character {
  const normalizedCost = Math.max(0, Math.floor(cost));

  if (normalizedCost <= 0) {
    return character;
  }

  const totalPoints = getSorcererAberrantSorceryPointsTotal(character);
  const remainingPoints = getSorcererAberrantSorceryPointsRemaining(character);

  if (totalPoints <= 0 || remainingPoints < normalizedCost) {
    return character;
  }

  const currentExpended = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);
  const nextExpended = Math.max(
    0,
    Math.min(
      totalPoints,
      (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + normalizedCost
    )
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

function hasSorcererAberrantTelepathicSpeechFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasSorcererAberrantRevelationInFleshFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 14
  );
}

function hasSorcererAberrantPsychicDefensesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererAberrantWarpingImplosionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

function hasSorcererAberrantPsionicSpellsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasSorcererAberrantPsionicSorceryFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === aberrantSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

export function getSorcererAberrantPsionicSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string[] {
  if (!hasSorcererAberrantPsionicSpellsFeature(character)) {
    return [];
  }

  return getPreparedSpellIdsByLevel(character.level ?? 0, aberrantSorcerySpellIdsByLevel);
}

export function canUseSorcererAberrantPsionicSorceryForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spellId: string
): boolean {
  return (
    hasSorcererAberrantPsionicSorceryFeature(character) &&
    getSorcererAberrantPsionicSpellIds(character).includes(spellId)
  );
}

function getSorcererAberrantFeatureDescription(
  character: Parameters<SubclassRuntimeResolver>[0],
  feature: CLASS_FEATURE
) {
  return (
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      character.level ?? 0,
      feature
    )?.description ?? []
  );
}

function getSorcererAberrantRevelationInFleshAlterationDescription(
  character: Parameters<SubclassRuntimeResolver>[0],
  heading: string
): string[] {
  return extractSubclassFeatureDescriptionSection(
    getSorcererAberrantFeatureDescription(character, CLASS_FEATURE.REVELATION_IN_FLESH).filter(
      (entry): entry is string => typeof entry === "string"
    ),
    heading
  );
}

function normalizeRevelationInFleshAlterations(
  optionKeys: string[]
): RevelationInFleshAlterationDefinition[] {
  const seen = new Set<string>();

  return optionKeys.reduce<RevelationInFleshAlterationDefinition[]>((definitions, optionKey) => {
    const normalizedKey = optionKey.trim();

    if (normalizedKey.length <= 0 || seen.has(normalizedKey)) {
      return definitions;
    }

    const definition =
      revelationInFleshAlterationDefinitions.find((entry) => entry.key === normalizedKey) ?? null;

    if (!definition) {
      return definitions;
    }

    seen.add(normalizedKey);
    definitions.push(definition);
    return definitions;
  }, []);
}

function hasActiveSorcererAberrantRevelationInFleshAlteration(
  character: Partial<Pick<Character, "statusEntries">>,
  statusSourceId: string
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.source === revelationInFleshName &&
      entry.sourceId === statusSourceId
  );
}

function hasActiveSorcererAberrantRevelationInFlesh(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return revelationInFleshAlterationDefinitions.some((definition) =>
    hasActiveSorcererAberrantRevelationInFleshAlteration(character, definition.statusSourceId)
  );
}

function getSorcererAberrantRevelationInFleshSelectionLimit(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  if (!hasSorcererAberrantRevelationInFleshFeature(character)) {
    return 0;
  }

  return Math.min(
    revelationInFleshAlterationDefinitions.length,
    getSorcererAberrantSorceryPointsRemaining(character)
  );
}

export function getSorcererAberrantWarpingImplosionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererAberrantWarpingImplosionFeature(character) ? warpingImplosionUsesTotal : 0;
}

export function getSorcererAberrantWarpingImplosionUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getSorcererAberrantWarpingImplosionUsesTotal(character);
  const expendedUses = Number(
    character.classFeatureState?.sorcerer?.warpingImplosionUsesExpended
  );
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(1, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function getSorcererAberrantRevelationInFleshOptions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureActionOptionCard[] {
  const remainingPoints = getSorcererAberrantSorceryPointsRemaining(character);

  return revelationInFleshAlterationDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.summary,
    detail: definition.detail,
    breakdown: definition.summary,
    usesLabel: "1",
    usesIcon: "sparkles",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description: getSorcererAberrantRevelationInFleshAlterationDescription(
      character,
      definition.heading
    ),
    disabled: remainingPoints <= 0,
    disabledReason: remainingPoints <= 0 ? "No Sorcery Points remaining." : undefined
  }));
}

function getSorcererAberrantRevelationInFleshSpeedBonuses(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureSpeedBonus[] {
  const speedBonuses: FeatureSpeedBonus[] = [];

  if (
    hasActiveSorcererAberrantRevelationInFleshAlteration(
      character,
      sorcererRevelationInFleshAquaticAdaptationStatusSourceId
    )
  ) {
    speedBonuses.push({
      label: "Aquatic Adaptation",
      value: 0,
      movementType: "swim",
      setBaseFromWalkMultiplier: 2
    });
  }

  if (
    hasActiveSorcererAberrantRevelationInFleshAlteration(
      character,
      sorcererRevelationInFleshGlisteningFlightStatusSourceId
    )
  ) {
    speedBonuses.push({
      label: "Glistening Flight",
      value: 0,
      movementType: "fly",
      setBaseFromWalkMultiplier: 1,
      hover: true
    });
  }

  return speedBonuses;
}

function getSorcererAberrantDerivedStatusEntries(
  character: Parameters<SubclassRuntimeResolver>[0]
): DerivedFeatureStatusEntry[] {
  if (!hasSorcererAberrantPsychicDefensesFeature(character)) {
    return [];
  }

  return [
    {
      id: sorcererPsychicDefensesStatusSourceId,
      sourceId: sorcererPsychicDefensesStatusSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PSYCHIC,
      source: psychicDefensesName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function getSorcererAberrantSorceryFeatureActions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasSorcererAberrantTelepathicSpeechFeature(character)) {
    actions.push(
      createTelepathicBondFeatureAction(character, {
        actionKey: sorcererTelepathicSpeechActionKey,
        name: telepathicSpeechName,
        sourceId: sorcererTelepathicSpeechStatusSourceId,
        eyebrow: "Aberrant Sorcery",
        description: getSorcererAberrantFeatureDescription(
          character,
          CLASS_FEATURE.TELEPATHIC_SPEECH
        )
      })
    );
  }

  if (hasSorcererAberrantRevelationInFleshFeature(character)) {
    const remainingPoints = getSorcererAberrantSorceryPointsRemaining(character);
    const totalPoints = getSorcererAberrantSorceryPointsTotal(character);
    const selectionLimit = getSorcererAberrantRevelationInFleshSelectionLimit(character);
    const description = getSorcererAberrantFeatureDescription(
      character,
      CLASS_FEATURE.REVELATION_IN_FLESH
    );

    actions.push({
      key: sorcererRevelationInFleshActionKey,
      name: revelationInFleshName,
      summary: "Spend Sorcery Points to manifest aberrant alterations.",
      detail: "Spend 1 or more Sorcery Points to gain chosen aberrant alterations for 10 minutes.",
      breakdown: "Choose aberrant traits",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      resources:
        totalPoints > 0
          ? [
              {
                kind: "tracker",
                label: "Sorcery Points",
                current: remainingPoints,
                total: totalPoints,
                icon: "sparkles",
                tone: remainingPoints > 0 ? "default" : "danger"
              }
            ]
          : undefined,
      drawer: {
        kind: "options",
        eyebrow: "Aberrant Sorcery",
        description,
        helperText:
          selectionLimit > 0
            ? `Choose up to ${selectionLimit} alteration${selectionLimit === 1 ? "" : "s"}. Each chosen alteration costs 1 Sorcery Point.`
            : "You need at least 1 Sorcery Point to choose an alteration.",
        optionSelection: "multi-confirm",
        optionSelectionLimit: selectionLimit
      },
      execute: {
        kind: "option"
      },
      isActive: hasActiveSorcererAberrantRevelationInFlesh(character),
      disabled: remainingPoints <= 0,
      disabledReason: remainingPoints <= 0 ? "No Sorcery Points remaining." : undefined
    });
  }

  if (hasSorcererAberrantWarpingImplosionFeature(character)) {
    const usesRemaining = getSorcererAberrantWarpingImplosionUsesRemaining(character);
    const fallbackAvailable =
      usesRemaining <= 0 &&
      getSorcererAberrantSorceryPointsRemaining(character) >=
        warpingImplosionFallbackSorceryPointCost;
    const disabledReason =
      usesRemaining > 0
        ? undefined
        : fallbackAvailable
          ? undefined
          : `You need ${warpingImplosionFallbackSorceryPointCost} Sorcery Points.`;

    actions.push({
      key: sorcererWarpingImplosionActionKey,
      name: warpingImplosionName,
      summary: "Teleport and collapse space where you stood.",
      detail: "Teleport to a visible space and implode space at your previous location.",
      breakdown: "Teleport, implode space",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        getSorcererAberrantWarpingImplosionUsesTotal(character),
        createFeatureActionCardCost({
          amountText: String(warpingImplosionFallbackSorceryPointCost),
          icon: "sparkles"
        })
      ),
      usesRemaining,
      usesTotal: getSorcererAberrantWarpingImplosionUsesTotal(character),
      usesInlineLabel:
        usesRemaining <= 0 ? `| Use ${warpingImplosionFallbackSorceryPointCost}` : undefined,
      usesInlineIcon: usesRemaining <= 0 ? "sparkles" : undefined,
      usesInlineSuffix: usesRemaining <= 0 ? "instead" : undefined,
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        getSorcererAberrantWarpingImplosionUsesTotal(character),
        createFeatureActionCardCost({
          amountText: String(warpingImplosionFallbackSorceryPointCost),
          icon: "sparkles"
        }),
        getSorcererAberrantSorceryPointsRemaining(character),
        getSorcererAberrantSorceryPointsTotal(character),
        {
          icon: "sparkles"
        }
      ),
      description: getSorcererAberrantFeatureDescription(character, CLASS_FEATURE.WARPING_IMPLOSION),
      drawer: {
        kind: "confirm",
        eyebrow: "Aberrant Sorcery",
        description: getSorcererAberrantFeatureDescription(
          character,
          CLASS_FEATURE.WARPING_IMPLOSION
        )
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function activateSorcererAberrantTelepathicSpeech(character: Character): Character {
  if (!hasSorcererAberrantTelepathicSpeechFeature(character)) {
    return character;
  }

  return activateTelepathicBond(character, {
    name: telepathicSpeechName,
    source: telepathicSpeechSource,
    sourceId: sorcererTelepathicSpeechStatusSourceId,
    durationMinutes: getTelepathicBondDurationMinutes(character.level)
  });
}

export function activateSorcererAberrantRevelationInFlesh(
  character: Character,
  optionKeys: string[]
): Character {
  if (!hasSorcererAberrantRevelationInFleshFeature(character)) {
    return character;
  }

  const selectedAlterations = normalizeRevelationInFleshAlterations(optionKeys);

  if (selectedAlterations.length <= 0) {
    return character;
  }

  const nextCharacter = spendSorcererAberrantSorceryPoints(character, selectedAlterations.length);

  if (nextCharacter === character) {
    return character;
  }

  const refreshedSourceIds = new Set(
    selectedAlterations.map((alteration) => alteration.statusSourceId)
  );
  const nextStatusEntries = normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
    (entry) => !refreshedSourceIds.has(entry.sourceId ?? "")
  );

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      ...selectedAlterations.map((alteration) =>
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: alteration.name,
          source: revelationInFleshName,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: revelationInFleshDurationMinutes
          },
          sourceId: alteration.statusSourceId
        })
      )
    ]
  };
}

export function activateSorcererAberrantWarpingImplosion(character: Character): Character {
  if (!hasSorcererAberrantWarpingImplosionFeature(character)) {
    return character;
  }

  const usesRemaining = getSorcererAberrantWarpingImplosionUsesRemaining(character);

  if (usesRemaining > 0) {
    const currentExpended = Number(
      character.classFeatureState?.sorcerer?.warpingImplosionUsesExpended
    );
    const nextExpended = Math.max(
      0,
      Math.min(
        warpingImplosionUsesTotal,
        (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + 1
      )
    );

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...character.classFeatureState?.sorcerer,
          warpingImplosionUsesExpended: nextExpended
        }
      }
    };
  }

  return spendSorcererAberrantSorceryPoints(character, warpingImplosionFallbackSorceryPointCost);
}

export function restoreSorcererAberrantWarpingImplosionOnLongRest(
  character: Character
): Character {
  if (!hasSorcererAberrantWarpingImplosionFeature(character)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        warpingImplosionUsesExpended: 0
      }
    }
  };
}

export const getSorcererAberrantSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === aberrantSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: getSorcererAberrantSorceryFeatureActions(character),
        featureActionOptions: hasSorcererAberrantRevelationInFleshFeature(character)
          ? {
              [sorcererRevelationInFleshActionKey]:
                getSorcererAberrantRevelationInFleshOptions(character)
            }
          : {},
        derivedStatusEntries: getSorcererAberrantDerivedStatusEntries(character),
        speedBonuses: getSorcererAberrantRevelationInFleshSpeedBonuses(character),
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          aberrantSorcerySpellIdsByLevel
        )
      }
    : {};

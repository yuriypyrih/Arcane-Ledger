import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../codex/entries";
import type { AbilityKey, Character, CoreStats } from "../../../types";
import { createFeatureSourcedDescriptionEntries } from "../actionModalDescriptions";
import {
  getArmorClassResolutionForCharacter,
  type ArmorClassBreakdown,
  type ArmorClassResolution
} from "../armor";
import {
  getCoreStatIndicatorsForCharacter,
  type FeatureIndicator
} from "../classFeatures";
import { getArtificerCartographerPortalJumpSpeedDescriptionAdditions } from "../classFeatures/artificer/artificer";
import { getFeatureDescriptionForCharacter } from "../classFeatures/featureDescriptions";
import { getInitiativeReferenceDescriptionAdditions } from "../classFeatures/initiativeDescriptionSections";
import { createDefaultCoreStats } from "../constants";
import { formatCustomTraitBonusFormulaTerm } from "../customTraitEffects";
import {
  formatAbilityModifier,
  getInitiativeBreakdownForCharacter,
  getPassivePerceptionForCharacter,
  getProficiencyBonus
} from "../gameplay";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter,
  getHitDieLabelForCharacter,
  getHitDieLabelForClass
} from "../hitDice";
import { getKeywordDescription } from "../keywordDescriptions";
import { parseFormulaRange, formatSignedFormulaTerm } from "../shared/formulas";
import {
  canCharacterHover,
  getJumpDistanceBreakdownsForCharacter,
  getMovementSpeedBreakdownsForCharacter,
  getSpeedBreakdownForCharacter,
  getSpeedForCharacter,
  hasModifiedSpecialMovementForCharacter,
  type JumpDistanceBreakdown
} from "../speed";
import {
  getAthleteSpeedDescriptionAdditionsForCharacter,
  getMediumArmorMasterArmorClassDescriptionAdditionsForCharacter,
  getPurpleDragonRookRallyingCryDescriptionAdditionsForCharacter,
  getZhentarimRuffianFamilyFirstDescriptionAdditionsForCharacter
} from "../feats/runtime";
import { createAdditionalCoreStatCards } from "./combatSummaryCoreStatAdditionalCards";

export { createAdditionalCoreStatCards } from "./combatSummaryCoreStatAdditionalCards";

export type CombatSummaryReferenceIndicatorSection = {
  label?: string;
  indicators: FeatureIndicator[];
};

export type CombatSummaryReferenceDetailCard = {
  label: string;
  value: string;
  breakdown?: string;
  variant?: "default" | "formula";
};

export type CombatSummarySelectedStatReference = {
  keyword: string;
  summaryText?: string;
  warning?: string | null;
  rollIndicators?: FeatureIndicator[];
  rollActions?: {
    label: string;
    actionName: string;
    mod: {
      title: string;
      modifier: number;
      description: string;
      indicators?: FeatureIndicator[];
    };
    save: {
      title: string;
      modifier: number;
      description: string;
      indicators?: FeatureIndicator[];
      formulaTerms?: string[];
      formulaDisplayTerms?: string[];
    };
  };
  descriptionAdditions?: SpellDescriptionEntry[][];
  descriptionItems?: Array<{
    label: string;
    text: string;
  }>;
  detailCards?: CombatSummaryReferenceDetailCard[];
  indicatorSections?: CombatSummaryReferenceIndicatorSection[];
};

export type CombatSummaryCoreStatCard = {
  key: string;
  label: string;
  value: string;
  showBoostIcon?: boolean;
  indicators?: FeatureIndicator[];
  summaryText?: string;
  detailCards?: CombatSummaryReferenceDetailCard[];
};

export type CombatSummaryCoreStatField = {
  key: keyof CoreStats;
  label: string;
};

export type CombatSummaryCoreStatCardsResult = {
  cards: CombatSummaryCoreStatCard[];
  armorClassResolution: ArmorClassResolution;
  initiativeBreakdown: ReturnType<typeof getInitiativeBreakdownForCharacter>;
};

export type CharacterCombatSummaryCoreStats = CombatSummaryCoreStatCardsResult & {
  profileRows: CombatSummaryCoreStatCard[][];
  profileColumns: CombatSummaryCoreStatCard[][];
  broadProfileRows: CombatSummaryCoreStatCard[][];
  baseCards: CombatSummaryCoreStatCard[];
  additionalCards: CombatSummaryCoreStatCard[];
  armorClassDetailCards: CombatSummaryReferenceDetailCard[];
  proficiencyBonus: number;
  passivePerception: number;
  speed: number;
  speedBreakdown: ReturnType<typeof getSpeedBreakdownForCharacter>;
  movementSpeedBreakdowns: ReturnType<typeof getMovementSpeedBreakdownsForCharacter>;
  canHover: boolean;
  jumpDistanceBreakdowns: ReturnType<typeof getJumpDistanceBreakdownsForCharacter>;
  hitDiceSummary: {
    remaining: number;
    total: number;
    label: string;
  };
  getReferenceForCard: (card: CombatSummaryCoreStatCard) => CombatSummarySelectedStatReference;
};

export const profileCoreStatFields: CombatSummaryCoreStatField[] = [
  { key: "armorClass", label: "Armor Class" },
  { key: "initiative", label: "Initiative" },
  { key: "speed", label: "Speed" },
  { key: "passivePerception", label: "Passive Perception" },
  { key: "proficiencyBonus", label: "Proficiency Bonus" },
  { key: "hitDice", label: "Hit Dice" }
];

function formatArmorClassTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  if (["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(label)) {
    return label;
  }

  return label;
}

export function formatArmorClassFormula(breakdown: ArmorClassBreakdown): string {
  const terms = breakdown.entries.map(
    (entry) =>
      entry.formulaLabel ??
      formatCustomTraitBonusFormulaTerm(entry) ??
      formatSignedFormulaTerm(entry.value, formatArmorClassTermLabel(entry.label, breakdown.source))
  );

  return `${breakdown.total} AC = ${terms.join(" ")}`;
}

export function getArmorClassReferenceDetailCards(
  resolution: ArmorClassResolution
): CombatSummaryReferenceDetailCard[] {
  return [
    {
      label: "AC Formula",
      value: formatArmorClassFormula(resolution.activeFormula.breakdown),
      variant: "formula"
    }
  ];
}

function formatMovementBaseFormula(
  baseExpression: ReturnType<
    typeof getMovementSpeedBreakdownsForCharacter
  >["walk"]["baseExpression"]
): string {
  if (baseExpression.kind === "none") {
    return "-";
  }

  if (baseExpression.kind === "fixed") {
    return `${baseExpression.value} ${baseExpression.label}`;
  }

  const sourceSuffix = baseExpression.sourceLabel ? ` (${baseExpression.sourceLabel})` : "";

  if (baseExpression.multiplier === 1) {
    return `${baseExpression.walkValue} (Walk Speed)${sourceSuffix}`;
  }

  if (baseExpression.multiplier === 0.5) {
    const expression = `${baseExpression.walkValue} (Walk Speed) / 2`;
    const formattedExpression =
      baseExpression.walkValue % 2 === 0 ? expression : `floor(${expression})`;

    return `${formattedExpression}${sourceSuffix}`;
  }

  return `${baseExpression.walkValue} (Walk Speed) x ${baseExpression.multiplier}${sourceSuffix}`;
}

function formatMovementFormula(
  movement: ReturnType<typeof getMovementSpeedBreakdownsForCharacter>["walk"]
): string {
  if (movement.total === null) {
    return "-";
  }

  const terms: string[] =
    movement.baseExpression.kind === "none" && movement.entries.length > 0
      ? []
      : [formatMovementBaseFormula(movement.baseExpression)];

  movement.entries.forEach((entry, index) => {
    const isFirstVisibleTerm = terms.length === 0 && index === 0;
    const formulaLabel = entry.formulaLabel ?? formatCustomTraitBonusFormulaTerm(entry);

    terms.push(
      formulaLabel ??
        `${!isFirstVisibleTerm && entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
    );
  });

  return `${movement.total} ft = ${terms.join(" ")}`;
}

function formatJumpDistanceFormula(jump: JumpDistanceBreakdown): string {
  const sourceSuffix = jump.sourceLabel ? ` (${jump.sourceLabel})` : "";

  if (jump.type === "high") {
    return `${jump.total} ft = 3 (Base) ${formatAbilityModifier(jump.abilityValue)} ${jump.ability}${sourceSuffix}`;
  }

  return `${jump.total} ft = ${jump.abilityValue} ${jump.ability} Score${sourceSuffix}`;
}

type InitiativeFormulaEntry = {
  label: string;
  value: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
};

function getInitiativeFormulaRange(
  entry: InitiativeFormulaEntry
): ReturnType<typeof parseFormulaRange> {
  const formula = entry.formula?.trim();

  if (!formula) {
    return null;
  }

  const range = parseFormulaRange(formula);

  if (!range || entry.formulaMultiplier !== -1) {
    return range;
  }

  return {
    minimum: -range.maximum,
    maximum: -range.minimum,
    hasDice: range.hasDice
  };
}

function formatInitiativeRangeValue(minimum: number, maximum: number): string {
  if (minimum === maximum) {
    return formatAbilityModifier(minimum);
  }

  return `${formatAbilityModifier(minimum)}~${maximum}`;
}

export function formatInitiativeDisplayValue(
  total: number,
  entries: InitiativeFormulaEntry[]
): string {
  let minimum = total;
  let maximum = total;
  let hasFormulaRange = false;
  let hasDice = false;

  entries.forEach((entry) => {
    const range = getInitiativeFormulaRange(entry);

    if (!range) {
      return;
    }

    minimum += range.minimum;
    maximum += range.maximum;
    hasFormulaRange = true;
    hasDice = hasDice || range.hasDice;
  });

  if (hasDice) {
    return formatInitiativeRangeValue(minimum, maximum);
  }

  if (hasFormulaRange && minimum === maximum) {
    return formatAbilityModifier(minimum);
  }

  return formatAbilityModifier(total);
}

export function formatInitiativeFormula(
  total: number,
  entries: InitiativeFormulaEntry[]
): string {
  const terms = entries.map(
    (entry) =>
      formatCustomTraitBonusFormulaTerm(entry) ??
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatInitiativeDisplayValue(total, entries)} Initiative = ${terms.join(" ")}`;
}

export function buildReferenceIndicatorSections(
  sections: Array<{
    label?: string;
    indicators?: FeatureIndicator[];
  }>
): CombatSummaryReferenceIndicatorSection[] | undefined {
  const normalizedSections = sections.flatMap((section) =>
    section.indicators && section.indicators.length > 0
      ? [
          {
            label: section.label,
            indicators: section.indicators
          }
        ]
      : []
  );

  return normalizedSections.length > 0 ? normalizedSections : undefined;
}

function getInitiativeDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  return [
    ...getInitiativeReferenceDescriptionAdditions(character),
    ...getPurpleDragonRookRallyingCryDescriptionAdditionsForCharacter(character),
    ...getZhentarimRuffianFamilyFirstDescriptionAdditionsForCharacter(character)
  ];
}

function getArmorClassDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  return getMediumArmorMasterArmorClassDescriptionAdditionsForCharacter(character);
}

function getSpeedDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const acrobaticMovementDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.ACROBATIC_MOVEMENT
  );
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (acrobaticMovementDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.ACROBATIC_MOVEMENT,
        acrobaticMovementDescription,
        "Acrobatic Movement"
      )
    );
  }

  descriptionAdditions.push(...getAthleteSpeedDescriptionAdditionsForCharacter(character));
  descriptionAdditions.push(
    ...getArtificerCartographerPortalJumpSpeedDescriptionAdditions(character)
  );

  return descriptionAdditions;
}

export function createBaseCoreStatCards(
  character: Character,
  fields: CombatSummaryCoreStatField[]
): CombatSummaryCoreStatCardsResult {
  const armorClassResolution = getArmorClassResolutionForCharacter(character);
  const armorClassBreakdown = armorClassResolution.activeFormula.breakdown;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);
  const hitDiceTotal = getHitDiceTotalForCharacter(character);
  const initiativeBreakdown = getInitiativeBreakdownForCharacter(character);
  const displayedCoreStats: CoreStats = {
    ...(character.coreStats ?? createDefaultCoreStats()),
    armorClass: String(armorClassBreakdown.total),
    initiative: formatInitiativeDisplayValue(
      initiativeBreakdown.total,
      initiativeBreakdown.entries
    ),
    speed: `${getSpeedForCharacter(character)} ft`,
    passivePerception: String(getPassivePerceptionForCharacter(character)),
    proficiencyBonus: formatAbilityModifier(proficiencyBonus),
    hitDice: getHitDieLabelForClass(character.className, character.customClass)
  };
  const coreStatIndicators = getCoreStatIndicatorsForCharacter(character);
  const speedBreakdown = getSpeedBreakdownForCharacter(character);
  const movementSpeedBreakdowns = getMovementSpeedBreakdownsForCharacter(character);
  const jumpDistanceBreakdowns = getJumpDistanceBreakdownsForCharacter(character);
  const hasModifiedSpecialMovement = hasModifiedSpecialMovementForCharacter(character);
  const characterCanHover = canCharacterHover(character);
  const hasPortalJumpSpeedDescription =
    getArtificerCartographerPortalJumpSpeedDescriptionAdditions(character).length > 0;
  const hasAcrobaticMovement =
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ACROBATIC_MOVEMENT).length > 0;
  const cards = fields.map((field) => {
    let detailValue: string | undefined;

    if (field.label === "Initiative") {
      detailValue = formatInitiativeFormula(initiativeBreakdown.total, initiativeBreakdown.entries);
    } else if (field.label === "Speed") {
      detailValue = formatMovementFormula(speedBreakdown);
    }

    return {
      key: String(field.key),
      label:
        field.key === "hitDice"
          ? `${field.label} ${hitDiceRemaining}/${hitDiceTotal}`
          : field.label,
      value: displayedCoreStats[field.key],
      showBoostIcon:
        field.label === "Speed" &&
        (hasModifiedSpecialMovement || hasAcrobaticMovement || hasPortalJumpSpeedDescription),
      indicators: coreStatIndicators[field.key],
      summaryText: getKeywordDescription(field.label) ?? undefined,
      detailCards:
        field.label === "Speed"
          ? [
              {
                label: "WALK FORMULA (default)",
                value: formatMovementFormula(movementSpeedBreakdowns.walk),
                variant: "formula"
              },
              {
                label: "CLIMB FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.climb),
                variant: "formula"
              },
              {
                label: "SWIM FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.swim),
                variant: "formula"
              },
              {
                label: "FLY FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.fly),
                variant: "formula"
              },
              {
                label: "BURROW FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.burrow),
                variant: "formula"
              },
              {
                label: "LONG JUMP FORMULA",
                value: formatJumpDistanceFormula(jumpDistanceBreakdowns.longJump),
                breakdown: "[requires 10 ft running start]",
                variant: "formula"
              },
              {
                label: "HIGH JUMP FORMULA",
                value: formatJumpDistanceFormula(jumpDistanceBreakdowns.highJump),
                breakdown: "[requires 10 ft running start]",
                variant: "formula"
              },
              {
                label: "Hover",
                value: characterCanHover ? "Yes" : "No"
              }
            ]
          : field.label === "Armor Class"
            ? getArmorClassReferenceDetailCards(armorClassResolution)
            : detailValue
              ? [
                  {
                    label: "Formula",
                    value: detailValue,
                    variant: "formula"
                  }
                ]
              : undefined
    } satisfies CombatSummaryCoreStatCard;
  });

  return {
    cards,
    armorClassResolution,
    initiativeBreakdown
  };
}

function createProfileRows(
  baseCards: CombatSummaryCoreStatCard[],
  additionalCards: CombatSummaryCoreStatCard[]
): CombatSummaryCoreStatCard[][] {
  const [armorClass, initiative, speed, passivePerception, proficiencyBonus, hitDice] = baseCards;
  const [seventhStat, eighthStat, ...remainingStats] = additionalCards;
  const rows: CombatSummaryCoreStatCard[][] = [
    [armorClass, initiative, speed, seventhStat].filter(
      (card): card is CombatSummaryCoreStatCard => Boolean(card)
    ),
    [passivePerception, proficiencyBonus, hitDice, eighthStat].filter(
      (card): card is CombatSummaryCoreStatCard => Boolean(card)
    )
  ];

  if (remainingStats.length > 0) {
    rows.push(remainingStats);
  }

  return rows;
}

function createProfileColumns(
  baseCards: CombatSummaryCoreStatCard[],
  additionalCards: CombatSummaryCoreStatCard[]
): CombatSummaryCoreStatCard[][] {
  const [armorClass, initiative, speed, passivePerception, proficiencyBonus, hitDice] = baseCards;
  const columns: CombatSummaryCoreStatCard[][] = [
    [armorClass, speed, passivePerception].filter(
      (card): card is CombatSummaryCoreStatCard => Boolean(card)
    ),
    [initiative, proficiencyBonus, hitDice].filter(
      (card): card is CombatSummaryCoreStatCard => Boolean(card)
    )
  ];

  additionalCards.forEach((card, index) => {
    columns[index % columns.length].push(card);
  });

  return columns;
}

function createChunkedCoreStatRows(
  cards: CombatSummaryCoreStatCard[],
  cardsPerRow: number
): CombatSummaryCoreStatCard[][] {
  const rows: CombatSummaryCoreStatCard[][] = [];

  for (let index = 0; index < cards.length; index += cardsPerRow) {
    rows.push(cards.slice(index, index + cardsPerRow));
  }

  return rows;
}

export function createProfileCoreStatRows(character: Character): CombatSummaryCoreStatCard[][] {
  return createCombatSummaryCoreStats(character).profileRows;
}

export function createProfileCoreStatColumns(character: Character): CombatSummaryCoreStatCard[][] {
  return createCombatSummaryCoreStats(character).profileColumns;
}

export function createBroadProfileCoreStatRows(
  character: Character
): CombatSummaryCoreStatCard[][] {
  return createCombatSummaryCoreStats(character).broadProfileRows;
}

export function createCoreStatReference(
  character: Character,
  card: CombatSummaryCoreStatCard
): CombatSummarySelectedStatReference {
  const descriptionAdditions =
    card.label === "Initiative"
      ? (() => {
          const additions = getInitiativeDescriptionAdditions(character);
          return additions.length > 0 ? additions : undefined;
        })()
      : card.label === "Speed"
        ? (() => {
            const additions = getSpeedDescriptionAdditions(character);
            return additions.length > 0 ? additions : undefined;
          })()
        : card.label === "Armor Class"
          ? (() => {
              const additions = getArmorClassDescriptionAdditions(character);
              return additions.length > 0 ? additions : undefined;
            })()
          : undefined;

  return {
    keyword: card.label,
    rollIndicators: card.indicators,
    summaryText: card.summaryText,
    descriptionAdditions,
    indicatorSections: buildReferenceIndicatorSections([
      {
        indicators: card.indicators
      }
    ]),
    detailCards: card.detailCards
  };
}

export function createCombatSummaryCoreStats(character: Character): CharacterCombatSummaryCoreStats {
  const baseResult = createBaseCoreStatCards(character, profileCoreStatFields);
  const baseCards = baseResult.cards;
  const additionalCards = createAdditionalCoreStatCards(character);
  const speedBreakdown = getSpeedBreakdownForCharacter(character);
  const movementSpeedBreakdowns = getMovementSpeedBreakdownsForCharacter(character);
  const jumpDistanceBreakdowns = getJumpDistanceBreakdownsForCharacter(character);
  const armorClassDetailCards = getArmorClassReferenceDetailCards(baseResult.armorClassResolution);

  return {
    ...baseResult,
    baseCards,
    additionalCards,
    profileRows: createProfileRows(baseCards, additionalCards),
    profileColumns: createProfileColumns(baseCards, additionalCards),
    broadProfileRows: createChunkedCoreStatRows([...baseCards, ...additionalCards], 2),
    armorClassDetailCards,
    proficiencyBonus: getProficiencyBonus(character.level),
    passivePerception: getPassivePerceptionForCharacter(character),
    speed: getSpeedForCharacter(character),
    speedBreakdown,
    movementSpeedBreakdowns,
    canHover: canCharacterHover(character),
    jumpDistanceBreakdowns,
    hitDiceSummary: {
      remaining: getHitDiceRemainingForCharacter(character),
      total: getHitDiceTotalForCharacter(character),
      label: getHitDieLabelForCharacter(character)
    },
    getReferenceForCard: (card) => createCoreStatReference(character, card)
  };
}

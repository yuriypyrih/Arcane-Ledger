import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character, CoreStats } from "../../../../types";
import { createDefaultCoreStats } from "../../../../pages/CharactersPage/constants";
import { createFeatureSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import {
  formatAbilityModifier,
  getInitiativeBreakdownForCharacter,
  getInitiativeForCharacter,
  getPassivePerceptionForCharacter,
  getProficiencyBonus
} from "../../../../pages/CharactersPage/gameplay";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter,
  getHitDieLabelForClass
} from "../../../../pages/CharactersPage/hitDice";
import {
  getArmorClassResolutionForCharacter,
  type ArmorClassResolution
} from "../../../../pages/CharactersPage/armor";
import {
  canCharacterHover,
  getJumpDistanceBreakdownsForCharacter,
  getMovementSpeedBreakdownsForCharacter,
  hasModifiedSpecialMovementForCharacter,
  getSpeedBreakdownForCharacter,
  type JumpDistanceBreakdown,
  getSpeedForCharacter
} from "../../../../pages/CharactersPage/speed";
import {
  getBarbarianRageDamageBonusForCharacter,
  getBardicInspirationDieForCharacter,
  getCoreStatIndicatorsForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  getMonkMartialArtsDieForCharacter,
  getRogueSneakAttackDiceCountForCharacter,
  getRogueSneakAttackFormulaForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import { getFeatureDescriptionForCharacter } from "../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getInitiativeReferenceDescriptionAdditions } from "../../../../pages/CharactersPage/classFeatures/initiativeDescriptionSections";
import {
  getAthleteSpeedDescriptionAdditionsForCharacter,
  getMediumArmorMasterArmorClassDescriptionAdditionsForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import { formatCustomTraitBonusFormulaTerm } from "../../../../pages/CharactersPage/customTraitEffects";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import type {
  ReferenceDetailCard,
  ReferenceIndicatorSection,
  SelectedStatReference
} from "./StatReferenceDrawer";
import { getArmorClassReferenceDetailCards } from "./armorClassReference";

export type CoreStatCard = {
  key: string;
  label: string;
  value: string;
  showBoostIcon?: boolean;
  indicators?: FeatureIndicator[];
  summaryText?: string;
  detailCards?: ReferenceDetailCard[];
};

export type CoreStatField = {
  key: keyof CoreStats;
  label: string;
};

export type CoreStatCardsResult = {
  cards: CoreStatCard[];
  armorClassResolution: ArmorClassResolution;
  initiativeBreakdown: ReturnType<typeof getInitiativeBreakdownForCharacter>;
};

export const profileCoreStatFields: CoreStatField[] = [
  { key: "armorClass", label: "Armor Class" },
  { key: "initiative", label: "Initiative" },
  { key: "speed", label: "Speed" },
  { key: "passivePerception", label: "Passive Perception" },
  { key: "proficiencyBonus", label: "Proficiency Bonus" },
  { key: "hitDice", label: "Hit Dice" }
];

function formatDieValue(die: string | null): string | null {
  return die ? String(die).toLowerCase() : null;
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

export function formatInitiativeFormula(
  total: number,
  entries: Array<{
    label: string;
    value: number;
    abilityModifierSource?: AbilityKey;
    formulaSourceLabel?: string;
  }>
): string {
  const terms = entries.map(
    (entry) =>
      formatCustomTraitBonusFormulaTerm(entry) ??
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(total)} Initiative = ${terms.join(" ")}`;
}

export function buildReferenceIndicatorSections(
  sections: Array<{
    label?: string;
    indicators?: FeatureIndicator[];
  }>
): ReferenceIndicatorSection[] | undefined {
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
  return getInitiativeReferenceDescriptionAdditions(character);
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

  return descriptionAdditions;
}

export function createBaseCoreStatCards(
  character: Character,
  fields: CoreStatField[]
): CoreStatCardsResult {
  const armorClassResolution = getArmorClassResolutionForCharacter(character);
  const armorClassBreakdown = armorClassResolution.activeFormula.breakdown;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);
  const hitDiceTotal = getHitDiceTotalForCharacter(character);
  const displayedCoreStats: CoreStats = {
    ...(character.coreStats ?? createDefaultCoreStats()),
    armorClass: String(armorClassBreakdown.total),
    initiative: formatAbilityModifier(getInitiativeForCharacter(character)),
    speed: `${getSpeedForCharacter(character)} ft`,
    passivePerception: String(getPassivePerceptionForCharacter(character)),
    proficiencyBonus: formatAbilityModifier(proficiencyBonus),
    hitDice: getHitDieLabelForClass(character.className)
  };
  const coreStatIndicators = getCoreStatIndicatorsForCharacter(character);
  const speedBreakdown = getSpeedBreakdownForCharacter(character);
  const movementSpeedBreakdowns = getMovementSpeedBreakdownsForCharacter(character);
  const jumpDistanceBreakdowns = getJumpDistanceBreakdownsForCharacter(character);
  const hasModifiedSpecialMovement = hasModifiedSpecialMovementForCharacter(character);
  const characterCanHover = canCharacterHover(character);
  const initiativeBreakdown = getInitiativeBreakdownForCharacter(character);
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
        field.label === "Speed" && (hasModifiedSpecialMovement || hasAcrobaticMovement),
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
    } satisfies CoreStatCard;
  });

  return {
    cards,
    armorClassResolution,
    initiativeBreakdown
  };
}

export function createAdditionalCoreStatCards(character: Character): CoreStatCard[] {
  const barbarianRageDamageBonus = getBarbarianRageDamageBonusForCharacter(character);
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const fighterBattleMasterSuperiorityDie =
    getFighterBattleMasterSuperiorityDieForCharacter(character);
  const fighterBattleMasterSuperiorityDiceTotal =
    getFighterBattleMasterSuperiorityDiceTotalForCharacter(character);
  const fighterBattleMasterSuperiorityDiceRemaining =
    getFighterBattleMasterSuperiorityDiceRemainingForCharacter(character);
  const fighterPsiWarriorEnergyDie = getFighterPsiWarriorEnergyDieForCharacter(character);
  const fighterPsiWarriorEnergyDiceTotal =
    getFighterPsiWarriorEnergyDiceTotalForCharacter(character);
  const fighterPsiWarriorEnergyDiceRemaining =
    getFighterPsiWarriorEnergyDiceRemainingForCharacter(character);
  const rogueSoulknifePsionicDie = getRogueSoulknifePsionicDieForCharacter(character);
  const rogueSoulknifePsionicDiceTotal = getRogueSoulknifePsionicDiceTotalForCharacter(character);
  const rogueSoulknifePsionicDiceRemaining =
    getRogueSoulknifePsionicDiceRemainingForCharacter(character);
  const rogueSneakAttackDiceCount = getRogueSneakAttackDiceCountForCharacter(character);
  const rogueSneakAttackFormula = getRogueSneakAttackFormulaForCharacter(character);
  const cards: CoreStatCard[] = [];

  if (barbarianRageDamageBonus > 0) {
    cards.push({
      key: "barbarian-rage-damage",
      label: "Rage Damage",
      value: formatAbilityModifier(barbarianRageDamageBonus),
      summaryText:
        "Your current Rage Damage bonus. While Rage is active, Strength-based weapon and Unarmed Strike damage rolls gain this bonus. Rage Damage progresses from +2 at levels 1-8 to +3 at levels 9-15 and +4 at levels 16-20.",
      detailCards: [
        {
          label: "Current Bonus",
          value: formatAbilityModifier(barbarianRageDamageBonus)
        }
      ]
    });
  }

  if (monkMartialArtsDie) {
    cards.push({
      key: "martial-arts-die",
      label: "Martial Arts Die",
      value: formatDieValue(monkMartialArtsDie) ?? "-",
      summaryText:
        "Your current Martial Arts die. When Martial Arts applies, your Unarmed Strike and Monk weapons can use this die in place of their normal damage die if it is higher.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(monkMartialArtsDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 11, d12 at 17"
        }
      ]
    });
  }

  if (bardicInspirationDie) {
    cards.push({
      key: "bardic-inspiration-die",
      label: "Bardic Die",
      value: formatDieValue(bardicInspirationDie) ?? "-",
      summaryText:
        "Your current Bardic Inspiration die. Creatures inspired by you roll this die when they spend a Bardic Inspiration use.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(bardicInspirationDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 10, d12 at 15"
        }
      ]
    });
  }

  if (fighterBattleMasterSuperiorityDie && fighterBattleMasterSuperiorityDiceTotal > 0) {
    cards.push({
      key: "fighter-battle-master-superiority-dice",
      label: "Superiority Dice",
      value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-",
      summaryText:
        "Your current Battle Master Superiority Dice pool. Maneuvers expend these dice, and you regain all expended Superiority Dice when you finish a Short Rest or Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterBattleMasterSuperiorityDiceRemaining}/${fighterBattleMasterSuperiorityDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore all expended dice on Short Rest or Long Rest"
        },
        {
          label: "Progression",
          value: "4 dice at 3, 5 dice at 7, 6 dice at 15 | d8 at 3, d10 at 10, d12 at 18"
        }
      ]
    });
  }

  if (fighterPsiWarriorEnergyDie && fighterPsiWarriorEnergyDiceTotal > 0) {
    cards.push({
      key: "fighter-psi-warrior-energy-dice",
      label: "Psi Energy Dice",
      value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-",
      summaryText:
        "Your current Psi Warrior Energy Die. Psionic powers expend these dice, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterPsiWarriorEnergyDiceRemaining}/${fighterPsiWarriorEnergyDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSoulknifePsionicDie && rogueSoulknifePsionicDiceTotal > 0) {
    cards.push({
      key: "rogue-soulknife-psionic-die",
      label: "Psionic Die",
      value: formatDieValue(rogueSoulknifePsionicDie) ?? "-",
      summaryText:
        "Your current Soulknife Psionic Die. Soulknife powers spend this pool, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(rogueSoulknifePsionicDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${rogueSoulknifePsionicDiceRemaining}/${rogueSoulknifePsionicDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSneakAttackDiceCount > 0 && rogueSneakAttackFormula) {
    cards.push({
      key: "rogue-sneak-attack",
      label: "Sneak Attack",
      value: rogueSneakAttackFormula,
      summaryText:
        "Your current Sneak Attack damage. You can apply it once per turn after a hit when Sneak Attack's requirements are met.",
      detailCards: [
        {
          label: "Current Dice",
          value: rogueSneakAttackFormula
        },
        {
          label: "Progression",
          value:
            "1d6 at 1, 2d6 at 3, 3d6 at 5, 4d6 at 7, 5d6 at 9, 6d6 at 11, 7d6 at 13, 8d6 at 15, 9d6 at 17, 10d6 at 19"
        }
      ]
    });
  }

  return cards;
}

export function createProfileCoreStatRows(character: Character): CoreStatCard[][] {
  const { cards: baseCards } = createBaseCoreStatCards(character, profileCoreStatFields);
  const [armorClass, initiative, speed, passivePerception, proficiencyBonus, hitDice] = baseCards;
  const [seventhStat, eighthStat, ...remainingStats] = createAdditionalCoreStatCards(character);
  const rows: CoreStatCard[][] = [
    [armorClass, initiative, speed, seventhStat].filter((card): card is CoreStatCard =>
      Boolean(card)
    ),
    [passivePerception, proficiencyBonus, hitDice, eighthStat].filter(
      (card): card is CoreStatCard => Boolean(card)
    )
  ];

  if (remainingStats.length > 0) {
    rows.push(remainingStats);
  }

  return rows;
}

export function createProfileCoreStatColumns(character: Character): CoreStatCard[][] {
  const { cards: baseCards } = createBaseCoreStatCards(character, profileCoreStatFields);
  const [armorClass, initiative, speed, passivePerception, proficiencyBonus, hitDice] = baseCards;
  const columns: CoreStatCard[][] = [
    [armorClass, speed, passivePerception].filter((card): card is CoreStatCard => Boolean(card)),
    [initiative, proficiencyBonus, hitDice].filter((card): card is CoreStatCard => Boolean(card))
  ];

  createAdditionalCoreStatCards(character).forEach((card, index) => {
    columns[index % columns.length].push(card);
  });

  return columns;
}

function createChunkedCoreStatRows(cards: CoreStatCard[], cardsPerRow: number): CoreStatCard[][] {
  const rows: CoreStatCard[][] = [];

  for (let index = 0; index < cards.length; index += cardsPerRow) {
    rows.push(cards.slice(index, index + cardsPerRow));
  }

  return rows;
}

export function createBroadProfileCoreStatRows(character: Character): CoreStatCard[][] {
  const { cards: baseCards } = createBaseCoreStatCards(character, profileCoreStatFields);

  return createChunkedCoreStatRows(
    [...baseCards, ...createAdditionalCoreStatCards(character)],
    2
  );
}

export function createCoreStatReference(
  character: Character,
  card: CoreStatCard
): SelectedStatReference {
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

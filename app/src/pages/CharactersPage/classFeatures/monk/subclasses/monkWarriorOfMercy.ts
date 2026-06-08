import { monkFeatures, type MonkFeatureClassObj } from "../../../../../codex/classes";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterMonkFeatureState, SkillName } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  getSkillProficiencyForSkillName
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { formatFormulaCell, formatSignedFormulaTerm } from "../../../shared/formulas";
import {
  createChargesAndResourceCardUsage,
  createFeatureActionCardCost,
  createHeaderTagsFromResources
} from "../../cardUsage";
import type {
  FeatureActionCard,
  FeatureActionFact,
  FeatureDamageBonus,
  FeatureSkillProficiencyEntry
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { WeaponAction } from "../../../gameplay";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";

export const warriorOfMercySubclassId = "monk-warrior-of-mercy";
export const monkWarriorOfMercyHandOfHarmBonusLabel = "Hand of Harm";
export const monkHandOfHealingActionKey = "monk-warrior-of-mercy-hand-of-healing";
export const monkHandOfUltimateJusticeActionKey = "monk-warrior-of-mercy-hand-of-ultimate-justice";
const monkFlurryOfBlowsActionKey = "monk-flurry-of-blows";

const implementsOfMercySource = "Implements of Mercy";
const handOfHealingSource = "Hand of Healing";
const flurryOfHealingAndHarmSource = "Flurry of Healing and Harm";
const warriorOfMercySubclassEntry = getSubclassEntryById(warriorOfMercySubclassId);
const handOfUltimateJusticeActionName = "Hand of Ultimate Mercy";
const handOfUltimateMercyUsesTotal = 1;
const handOfUltimateMercyFocusCost = 5;

type MonkWarriorOfMercyCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "abilities">>;

type MercyWeaponAction = Pick<WeaponAction, "key" | "attackKind" | "description">;
export type MonkWarriorOfMercyHandOfHealingMode = "action" | "flurry_bonus_action";

export type MonkWarriorOfMercyHandOfHarmOptionState = {
  damageBonus: FeatureDamageBonus;
  focusPointCost: number;
  disabled: boolean;
  disabledReason?: string;
};

function getWarriorOfMercyFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = warriorOfMercySubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const handOfHarmDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.HAND_OF_HARM
);
const handOfHealingDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.HAND_OF_HEALING
);
const handOfHealingFlurryDescription = handOfHealingDescription.filter((entry) =>
  entry.startsWith("When you use your Flurry of Blows")
);
const flurryOfHealingAndHarmDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.FLURRY_OF_HEALING_AND_HARM
);
const physiciansTouchHandOfHarmDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.PHYSICIANS_TOUCH
).filter((entry) => entry.startsWith("<strong>Hand of Harm.</strong>"));
const physiciansTouchHandOfHealingDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.PHYSICIANS_TOUCH
).filter((entry) => entry.startsWith("<strong>Hand of Healing.</strong>"));
const handOfUltimateMercyDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.HAND_OF_ULTIMATE_MERCY
);

function getMonkFeatureRow(level: number | undefined): MonkFeatureClassObj | null {
  if (!Number.isFinite(level)) {
    return null;
  }

  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function appendWeaponDescriptionSection<T extends { description?: SpellDescriptionEntry[] }>(
  character: MonkWarriorOfMercyCharacter,
  action: T,
  feature: CLASS_FEATURE,
  sourceName: string,
  descriptionEntries: readonly string[]
): T {
  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    feature,
    descriptionEntries,
    sourceName
  ) as T;
}

function appendFeatureActionDescriptionEntries(
  character: MonkWarriorOfMercyCharacter,
  action: FeatureActionCard,
  actionKey: string,
  feature: CLASS_FEATURE,
  sourceName: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    feature,
    descriptionEntries,
    sourceName
  );
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getRawWisdomModifier(character: Partial<Pick<Character, "abilities">>): number | null {
  const wisdomScore = character.abilities?.WIS;

  if (typeof wisdomScore !== "number" || !Number.isFinite(wisdomScore)) {
    return null;
  }

  return Math.floor((wisdomScore - 10) / 2);
}

function getMonkFocusPointsTotal(character: Partial<Pick<Character, "level">>): number {
  return getMonkFeatureRow(character.level)?.focusPoints ?? 0;
}

function getMonkMartialArtsDieLabel(character: Partial<Pick<Character, "level">>): string | null {
  const martialArtsDie = getMonkFeatureRow(character.level)?.martialArts;

  return martialArtsDie ? `1${String(martialArtsDie).toLowerCase()}` : null;
}

function getMonkFocusPointsRemaining(
  character: Partial<Pick<Character, "level" | "classFeatureState">>
): number {
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawExpended = Number(character.classFeatureState?.monk?.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawExpended)
    ? Math.max(0, Math.floor(rawExpended))
    : 0;

  return Math.max(0, totalFocusPoints - focusPointsExpended);
}

function getMonkFlurryOfBlowsUsesRemaining(
  character: Partial<Pick<Character, "classFeatureState">>
): number {
  const rawFlurryUses = Number(
    character.classFeatureState?.monk?.flurryOfBlowsAttacksRemainingThisTurn
  );

  return Number.isFinite(rawFlurryUses) ? Math.max(0, Math.floor(rawFlurryUses)) : 0;
}

function isMercyUnarmedStrikeAction(action: MercyWeaponAction | null): boolean {
  return Boolean(action && action.key === "unarmed-strike" && action.attackKind === "unarmed");
}

export function isMonkWarriorOfMercy(character: MonkWarriorOfMercyCharacter): boolean {
  return (
    character.className === "Monk" &&
    character.subclassId === warriorOfMercySubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasMonkWarriorOfMercyHandOfHarm(character: MonkWarriorOfMercyCharacter): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyHandOfHealing(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyImplementsOfMercy(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyPhysiciansTouch(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character) && (character.level ?? 0) >= 6;
}

export function hasMonkWarriorOfMercyHandOfUltimateMercy(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character) && (character.level ?? 0) >= 17;
}

export function hasMonkWarriorOfMercyFlurryOfHealingAndHarm(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character) && (character.level ?? 0) >= 11;
}

export function getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal(
  character: MonkWarriorOfMercyCharacter
): number {
  if (!hasMonkWarriorOfMercyFlurryOfHealingAndHarm(character)) {
    return 0;
  }

  return Math.max(1, getRawWisdomModifier(character) ?? 0);
}

export function getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): number {
  const totalUses = getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal(character);
  const rawUsesExpended = Number(
    character.classFeatureState?.monk?.warriorOfMercyFlurryOfHealingAndHarmUsesExpended
  );
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.floor(rawUsesExpended))
    : 0;

  return Math.max(0, totalUses - usesExpended);
}

export function isMonkWarriorOfMercyFlurryOfHealingAndHarmActive(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): boolean {
  return hasMonkWarriorOfMercyFlurryOfHealingAndHarm(character) &&
    character.classFeatureState?.monk?.warriorOfMercyFlurryOfHealingAndHarmActive === true
    ? true
    : false;
}

export function getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal(
  character: MonkWarriorOfMercyCharacter
): number {
  return hasMonkWarriorOfMercyHandOfUltimateMercy(character) ? handOfUltimateMercyUsesTotal : 0;
}

export function getMonkWarriorOfMercyHandOfUltimateMercyUsesRemaining(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): number {
  const totalUses = getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal(character);
  const usesExpended = Number(
    character.classFeatureState?.monk?.warriorOfMercyHandOfUltimateMercyUsesExpended
  );

  return Math.max(
    0,
    totalUses - (Number.isFinite(usesExpended) ? Math.max(0, Math.floor(usesExpended)) : 0)
  );
}

export function getMonkWarriorOfMercyHandOfHarmUsedThisTurn(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): boolean {
  return hasMonkWarriorOfMercyHandOfHarm(character) &&
    character.classFeatureState?.monk?.warriorOfMercyHandOfHarmUsedThisTurn === true
    ? true
    : false;
}

export function getMonkWarriorOfMercyHandOfHealingFlurryUseCap(
  character: MonkWarriorOfMercyCharacter
): number {
  if (isMonkWarriorOfMercyFlurryOfHealingAndHarmActive(character)) {
    return 3;
  }

  return hasMonkWarriorOfMercyHandOfHealing(character) ? 1 : 0;
}

export function getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): number {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return 0;
  }

  const rawUsesThisTurn = Number(
    character.classFeatureState?.monk?.warriorOfMercyHandOfHealingFlurryUsesThisTurn
  );

  if (Number.isFinite(rawUsesThisTurn)) {
    return Math.max(0, Math.floor(rawUsesThisTurn));
  }

  return 0;
}

export function normalizeMonkWarriorOfMercyFeatureState(
  value: Partial<CharacterMonkFeatureState> | undefined,
  character: MonkWarriorOfMercyCharacter
): Pick<
  CharacterMonkFeatureState,
  | "warriorOfMercyHandOfHarmUsedThisTurn"
  | "warriorOfMercyHandOfHealingFlurryUsesThisTurn"
  | "warriorOfMercyFlurryOfHealingAndHarmUsesExpended"
  | "warriorOfMercyFlurryOfHealingAndHarmActive"
  | "warriorOfMercyHandOfUltimateMercyUsesExpended"
> {
  const handOfUltimateMercyUsesExpended = Number(
    value?.warriorOfMercyHandOfUltimateMercyUsesExpended
  );
  const flurryOfHealingAndHarmUsesExpended = Number(
    value?.warriorOfMercyFlurryOfHealingAndHarmUsesExpended
  );
  const handOfUltimateMercyUsesTotal = getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal(character);
  const flurryOfHealingAndHarmUsesTotal =
    getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal(character);
  const handOfHealingFlurryUsesThisTurn = getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn({
    ...character,
    classFeatureState: value ? { monk: value } : undefined
  });
  const flurryOfHealingAndHarmActive =
    hasMonkWarriorOfMercyFlurryOfHealingAndHarm(character) &&
    value?.warriorOfMercyFlurryOfHealingAndHarmActive === true;
  const handOfHealingFlurryUseCap = getMonkWarriorOfMercyHandOfHealingFlurryUseCap(character);

  return {
    warriorOfMercyHandOfHarmUsedThisTurn: hasMonkWarriorOfMercyHandOfHarm(character)
      ? value?.warriorOfMercyHandOfHarmUsedThisTurn === true
      : false,
    warriorOfMercyHandOfHealingFlurryUsesThisTurn: hasMonkWarriorOfMercyHandOfHealing(character)
      ? Math.max(0, Math.min(handOfHealingFlurryUseCap, handOfHealingFlurryUsesThisTurn))
      : 0,
    warriorOfMercyFlurryOfHealingAndHarmUsesExpended: hasMonkWarriorOfMercyFlurryOfHealingAndHarm(
      character
    )
      ? Number.isFinite(flurryOfHealingAndHarmUsesExpended)
        ? Math.max(
            0,
            Math.min(
              flurryOfHealingAndHarmUsesTotal,
              Math.floor(flurryOfHealingAndHarmUsesExpended)
            )
          )
        : 0
      : 0,
    warriorOfMercyFlurryOfHealingAndHarmActive: flurryOfHealingAndHarmActive,
    warriorOfMercyHandOfUltimateMercyUsesExpended: hasMonkWarriorOfMercyHandOfUltimateMercy(
      character
    )
      ? Number.isFinite(handOfUltimateMercyUsesExpended)
        ? Math.max(
            0,
            Math.min(handOfUltimateMercyUsesTotal, Math.floor(handOfUltimateMercyUsesExpended))
          )
        : 0
      : 0
  };
}

export function getMonkWarriorOfMercyHandOfHarmDamageBonus(
  character: MonkWarriorOfMercyCharacter
): FeatureDamageBonus | null {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return null;
  }

  const martialArtsDie = getMonkMartialArtsDieLabel(character);
  const wisdomModifier = getRawWisdomModifier(character);

  if (!martialArtsDie || wisdomModifier === null) {
    return null;
  }

  const modifierFormula =
    wisdomModifier === 0 ? "" : wisdomModifier > 0 ? `+${wisdomModifier}` : `${wisdomModifier}`;
  const modifierLabel =
    wisdomModifier === 0
      ? ""
      : wisdomModifier > 0
        ? ` + ${wisdomModifier}`
        : ` - ${Math.abs(wisdomModifier)}`;

  return {
    label: monkWarriorOfMercyHandOfHarmBonusLabel,
    formula: `${martialArtsDie}${modifierFormula}`,
    displayLabel: `${martialArtsDie}${modifierLabel} Necrotic`
  };
}

function formatLabeledModifier(value: number, label: string): string | null {
  if (value === 0) {
    return null;
  }

  return formatSignedFormulaTerm(value, label);
}

function formatFormulaValue(formula: string, terms: string[]): string {
  return formatFormulaCell({
    formula,
    displayTerms: terms,
    resultLabel: "Heal"
  }).value;
}

export function getMonkWarriorOfMercyHandOfHealingFormula(
  character: MonkWarriorOfMercyCharacter
): string | null {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return null;
  }

  const martialArtsDie = getMonkMartialArtsDieLabel(character);
  const wisdomModifier = getRawWisdomModifier(character);

  if (!martialArtsDie || wisdomModifier === null) {
    return null;
  }

  if (wisdomModifier === 0) {
    return martialArtsDie;
  }

  return `${martialArtsDie}${wisdomModifier > 0 ? "+" : ""}${wisdomModifier}`;
}

export function getMonkWarriorOfMercyHandOfHealingFacts(
  character: MonkWarriorOfMercyCharacter
): FeatureActionFact[] {
  const formula = getMonkWarriorOfMercyHandOfHealingFormula(character);
  const wisdomModifier = getRawWisdomModifier(character);
  const martialArtsDie = getMonkMartialArtsDieLabel(character);

  if (!formula || wisdomModifier === null || !martialArtsDie) {
    return [];
  }

  return [
    {
      label: "Healing Formula",
      value: formatFormulaValue(
        formula,
        [martialArtsDie, formatLabeledModifier(wisdomModifier, "WIS")].filter(
          (term): term is string => term !== null
        )
      ),
      fullWidth: true
    }
  ];
}

export function getMonkWarriorOfMercyHandOfHealingFlurryUsesRemaining(
  character: MonkWarriorOfMercyCharacter
): number {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return 0;
  }

  const sharedFlurryUsesRemaining = getMonkFlurryOfBlowsUsesRemaining(character);
  const flurryUseCap = getMonkWarriorOfMercyHandOfHealingFlurryUseCap(character);
  const flurryUsesThisTurn = getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn(character);
  const cappedUsesRemaining = Math.max(0, flurryUseCap - flurryUsesThisTurn);

  return Math.min(sharedFlurryUsesRemaining, cappedUsesRemaining);
}

export function getMonkWarriorOfMercyHandOfHarmOptionState(
  character: MonkWarriorOfMercyCharacter,
  action: MercyWeaponAction | null
): MonkWarriorOfMercyHandOfHarmOptionState | null {
  if (!hasMonkWarriorOfMercyHandOfHarm(character) || !isMercyUnarmedStrikeAction(action)) {
    return null;
  }

  const damageBonus = getMonkWarriorOfMercyHandOfHarmDamageBonus(character);

  if (!damageBonus) {
    return null;
  }

  const focusPointCost = isMonkWarriorOfMercyFlurryOfHealingAndHarmActive(character) ? 0 : 1;
  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const disabledReason =
    focusPointCost > 0 && focusPointsRemaining < focusPointCost
      ? "No Focus Points remaining."
      : getMonkWarriorOfMercyHandOfHarmUsedThisTurn(character)
        ? "Hand of Harm has already been used this turn."
        : undefined;

  return {
    damageBonus,
    focusPointCost,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function consumeMonkWarriorOfMercyHandOfHarm(character: Character): Character {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return character;
  }

  const optionState = getMonkWarriorOfMercyHandOfHarmOptionState(character, {
    key: "unarmed-strike",
    attackKind: "unarmed"
  });

  if (!optionState || optionState.disabled) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;
  const focusPointCost = optionState.focusPointCost;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + focusPointCost),
        warriorOfMercyHandOfHarmUsedThisTurn: true
      }
    }
  };
}

export function getMonkWarriorOfMercyFeatureActions(
  character: MonkWarriorOfMercyCharacter
): FeatureActionCard[] {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return [];
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const focusPointsTotal = getMonkFocusPointsTotal(character);
  const flurryHealingUsesRemaining =
    getMonkWarriorOfMercyHandOfHealingFlurryUsesRemaining(character);
  const handOfHealingFacts = getMonkWarriorOfMercyHandOfHealingFacts(character);

  const actions: FeatureActionCard[] = [
    {
      key: monkHandOfHealingActionKey,
      name: "Hand of Healing",
      summary: "Restore HP equal to your Martial Arts die plus WIS.",
      detail:
        "Expend 1 Focus Point to touch a creature and restore Hit Points equal to your Martial Arts die plus your Wisdom modifier.",
      breakdown: "Martial Arts healing",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "brain",
      description: [...handOfHealingDescription],
      facts: handOfHealingFacts,
      headerTags: createHeaderTagsFromResources([
        {
          kind: "tracker",
          label: "Focus",
          current: focusPointsRemaining,
          total: focusPointsTotal,
          icon: "brain",
          cost: 1
        }
      ]),
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of Mercy",
        description: [...handOfHealingDescription],
        facts: handOfHealingFacts
      },
      execute: {
        kind: "activate"
      },
      disabled: focusPointsRemaining <= 0 && flurryHealingUsesRemaining <= 0,
      disabledReason:
        focusPointsRemaining <= 0 && flurryHealingUsesRemaining <= 0
          ? "No Focus Points remaining."
          : undefined
    }
  ];

  if (hasMonkWarriorOfMercyHandOfUltimateMercy(character)) {
    const usesRemaining = getMonkWarriorOfMercyHandOfUltimateMercyUsesRemaining(character);
    const disabledReason =
      usesRemaining <= 0
        ? `${handOfUltimateJusticeActionName} recharges on a Long Rest.`
        : focusPointsRemaining < handOfUltimateMercyFocusCost
          ? `${handOfUltimateJusticeActionName} requires ${handOfUltimateMercyFocusCost} Focus Points.`
          : undefined;

    actions.push({
      key: monkHandOfUltimateJusticeActionKey,
      name: handOfUltimateJusticeActionName,
      summary: "Return a creature to life.",
      detail:
        "Expend 5 Focus Points to return a creature that died within the past 24 hours to life.",
      breakdown: "Revive with 4d10 + WIS",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createChargesAndResourceCardUsage(
        usesRemaining,
        handOfUltimateMercyUsesTotal,
        createFeatureActionCardCost({
          amountText: String(handOfUltimateMercyFocusCost),
          icon: "brain"
        })
      ),
      usesRemaining,
      usesTotal: handOfUltimateMercyUsesTotal,
      usesInlineLabel: "Use 5",
      usesInlineIcon: "brain",
      description: [...handOfUltimateMercyDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of Mercy",
        description: [...handOfUltimateMercyDescription]
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

export function activateMonkWarriorOfMercyHandOfHealing(
  character: Character,
  mode: MonkWarriorOfMercyHandOfHealingMode = "action"
): Character {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};

  if (mode === "flurry_bonus_action") {
    const sharedFlurryUsesRemaining = getMonkFlurryOfBlowsUsesRemaining(character);
    const flurryHealingUsesRemaining =
      getMonkWarriorOfMercyHandOfHealingFlurryUsesRemaining(character);
    const flurryHealingUsesThisTurn =
      getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn(character);

    if (flurryHealingUsesRemaining <= 0) {
      return character;
    }

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        monk: {
          ...monkState,
          flurryOfBlowsAttacksRemainingThisTurn: sharedFlurryUsesRemaining - 1,
          warriorOfMercyHandOfHealingFlurryUsesThisTurn: flurryHealingUsesThisTurn + 1
        }
      }
    };
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);

  if (focusPointsRemaining <= 0) {
    return character;
  }

  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + 1)
      }
    }
  };
}

export function activateMonkWarriorOfMercyHandOfUltimateJustice(character: Character): Character {
  if (!hasMonkWarriorOfMercyHandOfUltimateMercy(character)) {
    return character;
  }

  const usesRemaining = getMonkWarriorOfMercyHandOfUltimateMercyUsesRemaining(character);
  const focusPointsRemaining = getMonkFocusPointsRemaining(character);

  if (usesRemaining <= 0 || focusPointsRemaining < handOfUltimateMercyFocusCost) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const rawUsesExpended = Number(monkState.warriorOfMercyHandOfUltimateMercyUsesExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.floor(rawUsesExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(
          totalFocusPoints,
          focusPointsExpended + handOfUltimateMercyFocusCost
        ),
        warriorOfMercyHandOfUltimateMercyUsesExpended: Math.min(
          handOfUltimateMercyUsesTotal,
          usesExpended + 1
        )
      }
    }
  };
}

export function restoreMonkWarriorOfMercyHandOfUltimateMercyOnLongRest(
  character: Character
): Character {
  if (!hasMonkWarriorOfMercyHandOfUltimateMercy(character)) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};

  if ((monkState.warriorOfMercyHandOfUltimateMercyUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfMercyHandOfUltimateMercyUsesExpended: 0
      }
    }
  };
}

export function restoreMonkWarriorOfMercyFlurryOfHealingAndHarmOnLongRest(
  character: Character
): Character {
  if (!hasMonkWarriorOfMercyFlurryOfHealingAndHarm(character)) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const usesExpended = monkState.warriorOfMercyFlurryOfHealingAndHarmUsesExpended ?? 0;

  if (usesExpended === 0 && monkState.warriorOfMercyFlurryOfHealingAndHarmActive !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfMercyFlurryOfHealingAndHarmUsesExpended: 0,
        warriorOfMercyFlurryOfHealingAndHarmActive: false
      }
    }
  };
}

function createImplementsOfMercySkillProficiencyEntry(
  skill: SkillName
): FeatureSkillProficiencyEntry | null {
  const proficiency = getSkillProficiencyForSkillName(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: implementsOfMercySource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

export function getMonkWarriorOfMercySkillProficiencyEntries(
  character: MonkWarriorOfMercyCharacter
): FeatureSkillProficiencyEntry[] {
  if (!hasMonkWarriorOfMercyImplementsOfMercy(character)) {
    return [];
  }

  return [SKILL.INSIGHT, SKILL.MEDICINE]
    .map((skill) => createImplementsOfMercySkillProficiencyEntry(skill))
    .filter((entry): entry is FeatureSkillProficiencyEntry => entry !== null);
}

export function collectMonkWarriorOfMercyContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return [];
  }

  const featureActions = getMonkWarriorOfMercyFeatureActions(character);

  return [
    {
      source: createSubclassContributionSource({
        id: `${warriorOfMercySubclassId}-hand-of-harm`,
        label: "Hand of Harm",
        entryId: CLASS_FEATURE.HAND_OF_HARM
      }),
      weaponActionTransforms: [
        {
          id: `${warriorOfMercySubclassId}-hand-of-harm-weapon-transform`,
          transform: (_character: Character, action: unknown) =>
            isMercyUnarmedStrikeAction(action as MercyWeaponAction)
              ? appendWeaponDescriptionSection(
                  character,
                  action as WeaponAction,
                  CLASS_FEATURE.HAND_OF_HARM,
                  "Hand of Harm",
                  handOfHarmDescription
                )
              : (action as WeaponAction)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${warriorOfMercySubclassId}-hand-of-healing`,
        label: handOfHealingSource,
        entryId: CLASS_FEATURE.HAND_OF_HEALING
      }),
      actions: getFeatureActionByKey(featureActions, monkHandOfHealingActionKey),
      featureActionTransforms: [
        {
          id: `${warriorOfMercySubclassId}-hand-of-healing-flurry-transform`,
          transform: (action) =>
            appendFeatureActionDescriptionEntries(
              character,
              action,
              monkFlurryOfBlowsActionKey,
              CLASS_FEATURE.HAND_OF_HEALING,
              handOfHealingSource,
              handOfHealingFlurryDescription
            )
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${warriorOfMercySubclassId}-implements-of-mercy`,
        label: implementsOfMercySource,
        entryId: CLASS_FEATURE.IMPLEMENTS_OF_MERCY
      }),
      skillProficiencyEntries: getMonkWarriorOfMercySkillProficiencyEntries(character)
    },
    ...(hasMonkWarriorOfMercyPhysiciansTouch(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${warriorOfMercySubclassId}-physicians-touch`,
              label: "Physician's Touch",
              entryId: CLASS_FEATURE.PHYSICIANS_TOUCH
            }),
            featureActionTransforms: [
              {
                id: `${warriorOfMercySubclassId}-physicians-touch-hand-of-healing-transform`,
                transform: (action: FeatureActionCard) =>
                  appendFeatureActionDescriptionEntries(
                    character,
                    action,
                    monkHandOfHealingActionKey,
                    CLASS_FEATURE.PHYSICIANS_TOUCH,
                    "Physician's Touch: Hand of Healing",
                    physiciansTouchHandOfHealingDescription
                  )
              }
            ],
            weaponActionTransforms: [
              {
                id: `${warriorOfMercySubclassId}-physicians-touch-hand-of-harm-transform`,
                transform: (_character: Character, action: unknown) =>
                  isMercyUnarmedStrikeAction(action as MercyWeaponAction)
                    ? appendWeaponDescriptionSection(
                        character,
                        action as WeaponAction,
                        CLASS_FEATURE.PHYSICIANS_TOUCH,
                        "Physician's Touch: Hand of Harm",
                        physiciansTouchHandOfHarmDescription
                      )
                    : (action as WeaponAction)
              }
            ]
          }
        ]
      : []),
    ...(hasMonkWarriorOfMercyFlurryOfHealingAndHarm(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${warriorOfMercySubclassId}-flurry-of-healing-and-harm`,
              label: flurryOfHealingAndHarmSource,
              entryId: CLASS_FEATURE.FLURRY_OF_HEALING_AND_HARM
            }),
            featureActionTransforms: [
              {
                id: `${warriorOfMercySubclassId}-flurry-of-healing-and-harm-transform`,
                transform: (action: FeatureActionCard) =>
                  appendFeatureActionDescriptionEntries(
                    character,
                    action,
                    monkFlurryOfBlowsActionKey,
                    CLASS_FEATURE.FLURRY_OF_HEALING_AND_HARM,
                    flurryOfHealingAndHarmSource,
                    flurryOfHealingAndHarmDescription
                  )
              }
            ]
          }
        ]
      : []),
    ...(hasMonkWarriorOfMercyHandOfUltimateMercy(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${warriorOfMercySubclassId}-hand-of-ultimate-mercy`,
              label: handOfUltimateJusticeActionName,
              entryId: CLASS_FEATURE.HAND_OF_ULTIMATE_MERCY
            }),
            actions: getFeatureActionByKey(featureActions, monkHandOfUltimateJusticeActionKey)
          }
        ]
      : [])
  ];
}

export const getMonkWarriorOfMercyDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectMonkWarriorOfMercyContributions(character)),
    {
      character: character as Character
    }
  );

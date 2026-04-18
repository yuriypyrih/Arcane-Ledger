import { CLASS_FEATURE, getSpellEntryByName } from "../../../../../codex/entries";
import type { Character, CharacterDruidFeatureState } from "../../../../../types";
import { STATUS_DURATION_KIND, STATUS_ENTRY_GROUP, STATUS_ENTRY_SOURCE_TYPE } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { FeatureActionCard, FeatureIndicator } from "../../types";
import type { WeaponAction } from "../../../gameplay";
import {
  createCharacterStatusEntry,
  hasExhaustionAttackRollDisadvantage,
  normalizeCharacterStatusEntries
} from "../../../traits";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import {
  deactivateDruidWildShape,
  druidStarsGuidingBoltActionKey,
  druidStarryFormActionKey,
  expendOneDruidWildShapeUse,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal,
  normalizeDruidFeatureState
} from "../druid";

export const circleOfTheStarsSubclassId = "druid-circle-of-the-stars";
export const druidStarryFormStatusSourceId = "feature-druid-starry-form";
export const druidStarryFormConstellations = ["archer", "chalice", "dragon"] as const;
export type DruidStarryFormConstellation = (typeof druidStarryFormConstellations)[number];

const guidanceSpellId = getSpellEntryByName("Guidance")?.id ?? null;
const guidingBoltSpellId = getSpellEntryByName("Guiding Bolt")?.id ?? null;
const exhaustionDisadvantageIndicator: FeatureIndicator = {
  label: "Disadvantage",
  tone: "disadvantage",
  source: "Exhaustion"
};
const defaultAbilities: Character["abilities"] = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10
};
const druidStarryFormLabels: Record<DruidStarryFormConstellation, string> = {
  archer: "Archer",
  chalice: "Chalice",
  dragon: "Dragon"
};

function resolveSpellIdsByName(names: readonly string[]): string[] {
  return names.flatMap((name) => {
    const spell = getSpellEntryByName(name);
    return spell ? [spell.id] : [];
  });
}

export function hasDruidStarMapFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level">> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheStarsSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level ?? 0))) >= 3
  );
}

export function hasDruidStarryFormFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasDruidStarMapFeature(character);
}

function getCircleOfTheStarsFeatureDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  feature: CLASS_FEATURE
) {
  return (
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      Math.max(1, character.level ?? 1),
      feature
    )?.description ?? []
  );
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function createRollFormula(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function createRollDisplay(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function toDruidStarsResourceCharacter(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "classFeatureState" | "abilities" | "statusEntries" | "subclassId">
    >
) {
  return {
    className: character.className,
    level: Math.max(1, character.level ?? 1),
    classFeatureState: character.classFeatureState ?? {},
    abilities: character.abilities ?? defaultAbilities,
    statusEntries: character.statusEntries ?? [],
    subclassId: character.subclassId
  };
}

export const circleOfTheStarsSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Guidance", "Guiding Bolt"])
} as const;

export function normalizeDruidCircleOfTheStarsFeatureState(
  value: Partial<CharacterDruidFeatureState>,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): Pick<CharacterDruidFeatureState, "starMapGuidingBoltUsesExpended"> {
  const starMapGuidingBoltUsesTotal = hasDruidStarMapFeature(character)
    ? Math.max(1, Math.floor((Math.max(1, Math.floor(character.abilities?.WIS ?? 10)) - 10) / 2))
    : 0;

  return {
    starMapGuidingBoltUsesExpended: hasDruidStarMapFeature(character)
      ? Math.max(
          0,
          Math.min(
            starMapGuidingBoltUsesTotal,
            Number.isFinite(Number(value.starMapGuidingBoltUsesExpended))
              ? Math.floor(Number(value.starMapGuidingBoltUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

export function getDruidStarryFormConstellationLabel(
  constellation: DruidStarryFormConstellation
): string {
  return druidStarryFormLabels[constellation];
}

function isDruidStarryFormConstellation(value: unknown): value is DruidStarryFormConstellation {
  return (
    typeof value === "string" &&
    (druidStarryFormConstellations as readonly string[]).includes(value)
  );
}

function createDruidStarryFormValue(constellation: DruidStarryFormConstellation): string {
  return `Starry Form (${getDruidStarryFormConstellationLabel(constellation)})`;
}

function parseDruidStarryFormConstellation(value: unknown): DruidStarryFormConstellation | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "starry form") {
    return null;
  }

  if (normalizedValue === "starry form (archer)") {
    return "archer";
  }

  if (normalizedValue === "starry form (chalice)") {
    return "chalice";
  }

  if (normalizedValue === "starry form (dragon)") {
    return "dragon";
  }

  return null;
}

export function pruneDruidStarryFormStatusEntries(
  statusEntries: Character["statusEntries"]
): ReturnType<typeof normalizeCharacterStatusEntries> {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== druidStarryFormStatusSourceId
  );
}

export function getDruidActiveStarryFormConstellation(
  character: Pick<Character, "statusEntries">
): DruidStarryFormConstellation | null {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    (entry) => entry.sourceId === druidStarryFormStatusSourceId
  );

  return activeEntry ? parseDruidStarryFormConstellation(activeEntry.value) : null;
}

export function getDruidStarMapGuidingBoltUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return hasDruidStarMapFeature(character) ? Math.max(1, getAbilityModifier(Math.max(1, Math.floor(character.abilities?.WIS ?? 10)))) : 0;
}

export function getDruidStarMapGuidingBoltUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  const totalUses = getDruidStarMapGuidingBoltUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const druidState = normalizeDruidCircleOfTheStarsFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  );

  return Math.max(0, totalUses - (druidState.starMapGuidingBoltUsesExpended ?? 0));
}

export function restoreDruidStarMapGuidingBoltOnLongRest(
  character: Character,
  druidState = normalizeDruidFeatureState(character.classFeatureState?.druid, character)
): Character {
  if (
    getDruidStarMapGuidingBoltUsesTotal(character) <= 0 ||
    (druidState.starMapGuidingBoltUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        starMapGuidingBoltUsesExpended: 0
      }
    }
  };
}

export function consumeDruidStarMapGuidingBoltUse(
  character: Character,
  druidState = normalizeDruidFeatureState(character.classFeatureState?.druid, character)
): Character {
  const usesRemaining = getDruidStarMapGuidingBoltUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        starMapGuidingBoltUsesExpended: Math.min(
          getDruidStarMapGuidingBoltUsesTotal(character),
          (druidState.starMapGuidingBoltUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function activateDruidStarryForm(
  character: Character,
  constellation: DruidStarryFormConstellation
): Character {
  if (
    !hasDruidStarryFormFeature(character) ||
    !isDruidStarryFormConstellation(constellation) ||
    getDruidWildShapeUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const baseCharacter = deactivateDruidWildShape(character);
  const nextCharacter = expendOneDruidWildShapeUse(baseCharacter);
  const nextStatusEntries = pruneDruidStarryFormStatusEntries(nextCharacter.statusEntries);

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: createDruidStarryFormValue(constellation),
        source: "Circle of the Stars",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: druidStarryFormStatusSourceId
      })
    ]
  };
}

export function getCircleOfTheStarsFeatureActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "abilities" | "subclassId">>
): FeatureActionCard[] {
  if (!hasDruidStarMapFeature(character)) {
    return [];
  }

  const resourceCharacter = toDruidStarsResourceCharacter(character);
  const guidingBoltUsesRemaining = getDruidStarMapGuidingBoltUsesRemaining(resourceCharacter);
  const guidingBoltUsesTotal = getDruidStarMapGuidingBoltUsesTotal(resourceCharacter);
  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(resourceCharacter);
  const wildShapeUsesTotal = getDruidWildShapeUsesTotal(resourceCharacter);
  const starMapDescription = getCircleOfTheStarsFeatureDescription(
    character,
    CLASS_FEATURE.STAR_MAP
  );
  const starryFormDescription = getCircleOfTheStarsFeatureDescription(
    character,
    CLASS_FEATURE.STARRY_FORM
  );

  return [
    ...(guidingBoltSpellId
      ? [
          {
            key: druidStarsGuidingBoltActionKey,
            name: "Druid's Guiding Bolt",
            summary: "Cast Guiding Bolt without expending a spell slot.",
            detail: "Spend 1 Star Map charge to cast Guiding Bolt without using a spell slot.",
            breakdown: "Free Guiding Bolt",
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            usesRemaining: guidingBoltUsesRemaining,
            usesTotal: guidingBoltUsesTotal,
            description: starMapDescription,
            resources: [
              {
                kind: "tracker",
                label: "Charges",
                current: guidingBoltUsesRemaining,
                total: guidingBoltUsesTotal,
                supplementary: "Long Rest"
              }
            ],
            drawer: {
              kind: "confirm",
              eyebrow: "Circle of the Stars",
              description: starMapDescription,
              confirmLabel: "Cast"
            },
            execute: {
              kind: "spell",
              spellSource: "fixed",
              effectKind: "druids-guiding-bolt",
              spellId: guidingBoltSpellId,
              label: "Cast",
              actionLabel: "Cast",
              actionConsumesSpellSlot: false,
              actionAvailabilityText: `${guidingBoltUsesRemaining}/${guidingBoltUsesTotal} Star Map charge${
                guidingBoltUsesTotal === 1 ? "" : "s"
              } available. Cast without expending a spell slot.`,
              actionContextText: "Using Star Map"
            },
            disabled: guidingBoltUsesRemaining <= 0,
            disabledReason:
              guidingBoltUsesRemaining <= 0 ? "No Star Map charges remaining." : undefined
          } satisfies FeatureActionCard
        ]
      : []),
    {
      key: druidStarryFormActionKey,
      name: "Starry Form",
      summary: "Expend 1 Wild Shape use to assume a stellar constellation.",
      detail: "Use 1 Wild Shape use to assume a starry constellation for 10 minutes.",
      breakdown: "Assume starry form",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining: wildShapeUsesRemaining,
      usesTotal: wildShapeUsesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw",
      description: starryFormDescription,
      resources: [
        {
          kind: "tracker",
          label: "Wild Shape",
          current: wildShapeUsesRemaining,
          total: wildShapeUsesTotal,
          icon: "paw",
          cost: 1
        }
      ],
      drawer: {
        kind: "custom-form",
        eyebrow: "Circle of the Stars",
        description: starryFormDescription,
        formKind: "starry-form",
        confirmLabel: "Assume Form"
      },
      execute: {
        kind: "custom-form",
        formKind: "starry-form",
        label: "Assume Form"
      },
      disabled: wildShapeUsesRemaining <= 0,
      disabledReason: wildShapeUsesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    }
  ];
}

export function getCircleOfTheStarsAlwaysPreparedSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string[] {
  if (!hasDruidStarMapFeature(character)) {
    return [];
  }

  return [
    ...(guidanceSpellId ? [guidanceSpellId] : []),
    ...(guidingBoltSpellId ? [guidingBoltSpellId] : [])
  ];
}

export function getCircleOfTheStarsWeaponActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "abilities" | "statusEntries">>
): WeaponAction[] {
  if (
    character.className !== "Druid" ||
    getDruidActiveStarryFormConstellation({
      statusEntries: character.statusEntries ?? []
    }) !== "archer"
  ) {
    return [];
  }

  const wisdomModifier = getAbilityModifier(
    Math.max(1, Math.floor(character.abilities?.WIS ?? 10))
  );
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const damageFormula = "1d8";

  return [
    {
      key: "druid-starry-form-luminous-arrow",
      name: "Luminous Arrow",
      attackKind: "weapon",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.ATTACK,
      damageLabel: "1d8 Radiant",
      damageFormula,
      rollDisplay: createRollDisplay(damageFormula, wisdomModifier),
      rollFormulaDisplay: createRollFormula(damageFormula, wisdomModifier),
      ability: "WIS",
      abilityModifier: wisdomModifier,
      damageAbility: "WIS",
      damageAbilityModifier: wisdomModifier,
      proficiencyLabel: "Spell attack",
      proficiencyBonus,
      totalModifier: wisdomModifier,
      indicators: hasExhaustionAttackRollDisadvantage(character.statusEntries)
        ? [exhaustionDisadvantageIndicator]
        : [],
      damageBonusEntries: [],
      rollFormula: createRollFormula(damageFormula, wisdomModifier),
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      hasBatteringRootsBonus: false,
      drawerEyebrow: "Circle of the Stars",
      description: [
        "Hurl a luminous arrow at a creature within 60 feet.",
        "On a hit, the arrow deals 1d8 Radiant damage plus your Wisdom modifier."
      ],
      details: [
        { label: "Type", value: "Ranged spell attack" },
        { label: "Range", value: "60 feet" },
        { label: "Damage Type", value: "Radiant" }
      ]
    }
  ];
}

export const getDruidCircleOfTheStarsDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasDruidStarMapFeature({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    abilities: character.abilities
  })
    ? {
        featureActions: getCircleOfTheStarsFeatureActions(character),
        weaponActions: getCircleOfTheStarsWeaponActions(character),
        alwaysPreparedSpellIds: getCircleOfTheStarsAlwaysPreparedSpellIds(character)
      }
    : {};

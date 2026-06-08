import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  WEAPON_COMBAT_TYPE,
  type ReactionEntry
} from "../../../../../codex/entries";
import type { Character, RogueScionOfTheThreeDreadAllegianceChoice } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { resolveSpellIdsByName } from "../../subclassRuntime";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureActionFact } from "../../types";
import type { WeaponAction } from "../../../gameplay";
import type { RogueSneakAttackEffectDefinition } from "../types";
import { rogueSneakAttackActionKey } from "../rogue";
import { formatCodexLabel } from "../../../../../utils/codex";

export const scionOfTheThreeSubclassId = "rogue-scion-of-the-three";
export const rogueScionOfTheThreeBloodthirstReactionId =
  "reaction-rogue-scion-of-the-three-bloodthirst";

const scionOfTheThreeSubclassEntry = getSubclassEntryById(scionOfTheThreeSubclassId);
const bloodthirstName = "Bloodthirst";
const bloodthirstSourceLabel = "Scion of the Three";
const dreadAllegianceSource = "Dread Allegiance";
const auraOfMalevolenceSource = "Aura of Malevolence";
const cutthroatSource = "Cutthroat";
const murderousIntentSource = "Murderous Intent";
const dreadAllegianceResistanceSourceIdPrefix =
  "feature-rogue-scion-of-the-three-dread-allegiance-resistance-";

type RogueScionOfTheThreeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>;

const dreadAllegianceChoices = [
  "bane",
  "bhaal",
  "myrkul"
] as const satisfies readonly RogueScionOfTheThreeDreadAllegianceChoice[];
const dreadAllegianceChoiceSet = new Set<RogueScionOfTheThreeDreadAllegianceChoice>(
  dreadAllegianceChoices
);
const dreadAllegianceChoiceConfig: Record<
  RogueScionOfTheThreeDreadAllegianceChoice,
  {
    damageType: DAMAGE_TYPE;
    alwaysPreparedSpellIds: string[];
  }
> = {
  bane: {
    damageType: DAMAGE_TYPE.PSYCHIC,
    alwaysPreparedSpellIds: resolveSpellIdsByName(["Minor Illusion"])
  },
  bhaal: {
    damageType: DAMAGE_TYPE.POISON,
    alwaysPreparedSpellIds: resolveSpellIdsByName(["Blade Ward"])
  },
  myrkul: {
    damageType: DAMAGE_TYPE.NECROTIC,
    alwaysPreparedSpellIds: resolveSpellIdsByName(["Chill Touch"])
  }
};

function getRogueScionOfTheThreeFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = scionOfTheThreeSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const bloodthirstDescription = getRogueScionOfTheThreeFeatureDescriptionEntries(
  CLASS_FEATURE.BLOODTHIRST
);
const strikeFearDescription = getRogueScionOfTheThreeFeatureDescriptionEntries(
  CLASS_FEATURE.STRIKE_FEAR
);
const auraOfMalevolenceDescription = getRogueScionOfTheThreeFeatureDescriptionEntries(
  CLASS_FEATURE.AURA_OF_MALEVOLENCE
);
const dreadIncarnateDescription = getRogueScionOfTheThreeFeatureDescriptionEntries(
  CLASS_FEATURE.DREAD_INCARNATE
);

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.startsWith(heading));

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

function stripFeatureDescriptionHeading(description: readonly string[], heading: string): string[] {
  const [firstEntry, ...remainingEntries] = description;

  if (!firstEntry) {
    return [];
  }

  const normalizedFirstEntry = firstEntry.replace(heading, "").trim();

  return [...(normalizedFirstEntry ? [normalizedFirstEntry] : []), ...remainingEntries];
}

const murderousIntentDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    dreadIncarnateDescription,
    `<strong>${murderousIntentSource}.</strong>`
  ),
  `<strong>${murderousIntentSource}.</strong>`
);
const cutthroatDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    dreadIncarnateDescription,
    `<strong>${cutthroatSource}.</strong>`
  ),
  `<strong>${cutthroatSource}.</strong>`
);

function hasRogueScionOfTheThreeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === scionOfTheThreeSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRogueScionOfTheThreeBloodthirstFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasRogueScionOfTheThreeFeature(character);
}

export function hasRogueScionOfTheThreeDreadAllegianceFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasRogueScionOfTheThreeFeature(character);
}

export function hasRogueScionOfTheThreeStrikeFearFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === scionOfTheThreeSubclassId &&
    (character.level ?? 0) >= 9
  );
}

export function hasRogueScionOfTheThreeAuraOfMalevolenceFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === scionOfTheThreeSubclassId &&
    (character.level ?? 0) >= 13
  );
}

export function hasRogueScionOfTheThreeDreadIncarnateFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === scionOfTheThreeSubclassId &&
    (character.level ?? 0) >= 17
  );
}

function getRogueScionOfTheThreeBloodthirstReactionDescription(
  character: RogueScionOfTheThreeCharacter
): ReactionEntry["description"] {
  return [
    ...bloodthirstDescription,
    ...(hasRogueScionOfTheThreeAuraOfMalevolenceFeature(character)
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.AURA_OF_MALEVOLENCE,
          auraOfMalevolenceDescription,
          auraOfMalevolenceSource
        )
      : []),
    ...(hasRogueScionOfTheThreeDreadIncarnateFeature(character)
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.DREAD_INCARNATE,
          cutthroatDescription,
          cutthroatSource
        )
      : [])
  ];
}

function getRogueScionOfTheThreeBloodthirstReactionEntry(
  character: RogueScionOfTheThreeCharacter
): ReactionEntry {
  return {
    id: rogueScionOfTheThreeBloodthirstReactionId,
    reaction: REACTION.BLOODTHIRST,
    name: bloodthirstName,
    sourceType: "feature",
    sourceFeature: CLASS_FEATURE.BLOODTHIRST,
    sourceLabel: bloodthirstSourceLabel,
    description: getRogueScionOfTheThreeBloodthirstReactionDescription(character)
  };
}

export function getRogueScionOfTheThreeSneakAttackEffectDefinitions(
  character: RogueScionOfTheThreeCharacter
): RogueSneakAttackEffectDefinition[] {
  if (!hasRogueScionOfTheThreeStrikeFearFeature(character)) {
    return [];
  }

  return [
    {
      key: "terrify",
      name: "Terrify",
      costDice: 1,
      referenceDescription: strikeFearDescription.slice(1).filter(Boolean)
    }
  ];
}

function appendFeatureActionDescriptionSection(
  character: RogueScionOfTheThreeCharacter,
  action: FeatureActionCard,
  actionKey: string,
  feature: CLASS_FEATURE,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(action, character, feature, descriptionEntries);
}

function transformRogueScionOfTheThreeFeatureAction(
  character: RogueScionOfTheThreeCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (!hasRogueScionOfTheThreeDreadIncarnateFeature(character)) {
    return action;
  }

  return appendFeatureActionDescriptionSection(
    character,
    action,
    rogueSneakAttackActionKey,
    CLASS_FEATURE.DREAD_INCARNATE,
    murderousIntentDescription
  );
}

function isBloodthirstMeleeAttackAction(
  action: Pick<WeaponAction, "actionCategory" | "attackKind" | "combatType" | "economyType">
): boolean {
  return (
    action.economyType === "action" &&
    action.actionCategory === "attack" &&
    (action.attackKind === "unarmed" ||
      (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE))
  );
}

function transformRogueScionOfTheThreeWeaponAction(
  character: RogueScionOfTheThreeCharacter,
  action: WeaponAction
): WeaponAction {
  const bloodthirstMeleeAttackCount =
    getRogueScionOfTheThreeBloodthirstMeleeAttackMultiCount(character);

  if (bloodthirstMeleeAttackCount <= 0 || !isBloodthirstMeleeAttackAction(action)) {
    return action;
  }

  return {
    ...action,
    economyMultiCount: (action.economyMultiCount ?? 0) + bloodthirstMeleeAttackCount
  };
}

export function normalizeRogueScionOfTheThreeDreadAllegianceChoice(
  value: unknown
): RogueScionOfTheThreeDreadAllegianceChoice | undefined {
  return typeof value === "string" &&
    dreadAllegianceChoiceSet.has(value as RogueScionOfTheThreeDreadAllegianceChoice)
    ? (value as RogueScionOfTheThreeDreadAllegianceChoice)
    : undefined;
}

export function getRogueScionOfTheThreeDreadAllegianceChoice(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RogueScionOfTheThreeDreadAllegianceChoice | null {
  if (!hasRogueScionOfTheThreeDreadAllegianceFeature(character)) {
    return null;
  }

  return (
    normalizeRogueScionOfTheThreeDreadAllegianceChoice(
      character.classFeatureState?.rogue?.dreadAllegianceChoice
    ) ?? null
  );
}

export function setRogueScionOfTheThreeDreadAllegianceChoice(
  character: Character,
  choice: RogueScionOfTheThreeDreadAllegianceChoice | null
): Character {
  if (!hasRogueScionOfTheThreeDreadAllegianceFeature(character)) {
    return character;
  }

  const normalizedChoice =
    choice === null ? undefined : normalizeRogueScionOfTheThreeDreadAllegianceChoice(choice);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...character.classFeatureState?.rogue,
        dreadAllegianceChoice: normalizedChoice
      }
    }
  };
}

function getRogueScionOfTheThreeDreadAllegianceConfig(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  const choice = getRogueScionOfTheThreeDreadAllegianceChoice(character);
  return choice ? dreadAllegianceChoiceConfig[choice] : null;
}

export function getRogueScionOfTheThreeAuraOfMalevolenceFormulaFact(
  character: RogueScionOfTheThreeCharacter
): FeatureActionFact | null {
  if (!hasRogueScionOfTheThreeAuraOfMalevolenceFeature(character)) {
    return null;
  }

  const config = getRogueScionOfTheThreeDreadAllegianceConfig(character);
  const intelligenceModifier = getAbilityModifierForCharacter(character, "INT");
  const damageTypeLabel = config
    ? formatCodexLabel(config.damageType)
    : "Dread Allegiance Damage Type";

  return {
    label: "Aura of Malevolence Formula",
    value: `${intelligenceModifier} Damage = ${intelligenceModifier} INT ${damageTypeLabel}`,
    fullWidth: true
  };
}

function getRogueScionOfTheThreeDreadAllegianceDerivedStatusEntries(
  character: Parameters<SubclassRuntimeResolver>[0]
): DerivedFeatureStatusEntry[] {
  const config = getRogueScionOfTheThreeDreadAllegianceConfig(character);

  if (!config) {
    return [];
  }

  return [
    {
      id: `${dreadAllegianceResistanceSourceIdPrefix}${config.damageType.toLowerCase()}`,
      sourceId: `${dreadAllegianceResistanceSourceIdPrefix}${config.damageType.toLowerCase()}`,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: config.damageType,
      source: dreadAllegianceSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function createRogueScionOfTheThreeLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource(input)
  };
}

function createRogueScionOfTheThreeBloodthirstContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-scion-of-the-three-bloodthirst",
      label: bloodthirstName,
      entryId: CLASS_FEATURE.BLOODTHIRST
    }),
    reactions: [getRogueScionOfTheThreeBloodthirstReactionEntry(character)],
    weaponActionTransforms: [
      {
        id: "rogue-scion-of-the-three-bloodthirst-weapon-transform",
        transform: (_character: Character, action: unknown) =>
          transformRogueScionOfTheThreeWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createRogueScionOfTheThreeDreadAllegianceContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  const dreadAllegianceConfig = getRogueScionOfTheThreeDreadAllegianceConfig(character);

  return {
    source: createSubclassContributionSource({
      id: "rogue-scion-of-the-three-dread-allegiance",
      label: dreadAllegianceSource,
      entryId: CLASS_FEATURE.DREAD_ALLEGIANCE
    }),
    alwaysPreparedSpellIds: dreadAllegianceConfig?.alwaysPreparedSpellIds ?? [],
    statuses: getRogueScionOfTheThreeDreadAllegianceDerivedStatusEntries(character)
  };
}

function createRogueScionOfTheThreeDreadIncarnateContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-scion-of-the-three-dread-incarnate",
      label: "Dread Incarnate",
      entryId: CLASS_FEATURE.DREAD_INCARNATE
    }),
    featureActionTransforms: [
      {
        id: "rogue-scion-of-the-three-dread-incarnate-feature-action-transform",
        transform: (action) => transformRogueScionOfTheThreeFeatureAction(character, action)
      }
    ]
  };
}

function collectRogueScionOfTheThreeFeatureContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasRogueScionOfTheThreeFeature(character)) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    createRogueScionOfTheThreeBloodthirstContribution(character),
    createRogueScionOfTheThreeDreadAllegianceContribution(character)
  ];

  if (hasRogueScionOfTheThreeStrikeFearFeature(character)) {
    contributions.push(
      createRogueScionOfTheThreeLocalHookContribution({
        id: "rogue-scion-of-the-three-strike-fear",
        label: "Strike Fear",
        entryId: CLASS_FEATURE.STRIKE_FEAR
      })
    );
  }

  if (hasRogueScionOfTheThreeAuraOfMalevolenceFeature(character)) {
    contributions.push(
      createRogueScionOfTheThreeLocalHookContribution({
        id: "rogue-scion-of-the-three-aura-of-malevolence",
        label: auraOfMalevolenceSource,
        entryId: CLASS_FEATURE.AURA_OF_MALEVOLENCE
      })
    );
  }

  if (hasRogueScionOfTheThreeDreadIncarnateFeature(character)) {
    contributions.push(createRogueScionOfTheThreeDreadIncarnateContribution(character));
  }

  return contributions;
}

export function getRogueScionOfTheThreeBloodthirstUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return hasRogueScionOfTheThreeBloodthirstFeature(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function getRogueScionOfTheThreeBloodthirstUsesRemaining(
  character: RogueScionOfTheThreeCharacter
): number {
  const totalUses = getRogueScionOfTheThreeBloodthirstUsesTotal(character);
  const usesExpended = character.classFeatureState?.rogue?.bloodthirstUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRogueScionOfTheThreeBloodthirstMeleeAttackMultiCount(
  character: RogueScionOfTheThreeCharacter
): number {
  if (!hasRogueScionOfTheThreeBloodthirstFeature(character)) {
    return 0;
  }

  const remaining = character.classFeatureState?.rogue?.bloodthirstMeleeAttacksRemainingThisTurn;

  return Number.isFinite(Number(remaining)) ? Math.max(0, Math.floor(Number(remaining))) : 0;
}

export function consumeRogueScionOfTheThreeBloodthirstUse(character: Character): Character {
  const totalUses = getRogueScionOfTheThreeBloodthirstUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const rogueState = character.classFeatureState?.rogue ?? {};
  const usesExpended = rogueState.bloodthirstUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        bloodthirstMeleeAttacksRemainingThisTurn:
          (rogueState.bloodthirstMeleeAttacksRemainingThisTurn ?? 0) + 1,
        bloodthirstUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRogueScionOfTheThreeBloodthirstMeleeAttack(character: Character): Character {
  const remaining = getRogueScionOfTheThreeBloodthirstMeleeAttackMultiCount(character);

  if (remaining <= 0) {
    return character;
  }

  const rogueState = character.classFeatureState?.rogue ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        bloodthirstMeleeAttacksRemainingThisTurn: remaining - 1
      }
    }
  };
}

export function restoreRogueScionOfTheThreeBloodthirstOnLongRest(character: Character): Character {
  if (getRogueScionOfTheThreeBloodthirstUsesTotal(character) <= 0) {
    return character;
  }

  const rogueState = character.classFeatureState?.rogue ?? {};

  if (
    (rogueState.bloodthirstUsesExpended ?? 0) === 0 &&
    (rogueState.bloodthirstMeleeAttacksRemainingThisTurn ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        bloodthirstMeleeAttacksRemainingThisTurn: 0,
        bloodthirstUsesExpended: 0
      }
    }
  };
}

export function restoreRogueScionOfTheThreeBloodthirstOnShortRest(character: Character): Character {
  if (
    !hasRogueScionOfTheThreeDreadIncarnateFeature(character) ||
    getRogueScionOfTheThreeBloodthirstUsesTotal(character) <= 0
  ) {
    return character;
  }

  const rogueState = character.classFeatureState?.rogue ?? {};
  const usesExpended = rogueState.bloodthirstUsesExpended ?? 0;

  if (usesExpended <= 0 && (rogueState.bloodthirstMeleeAttacksRemainingThisTurn ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        bloodthirstMeleeAttacksRemainingThisTurn: 0,
        bloodthirstUsesExpended: Math.max(0, usesExpended - 1)
      }
    }
  };
}

export const getRogueScionOfTheThreeDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectRogueScionOfTheThreeFeatureContributions(character)),
    {
      character: character as Character
    }
  );

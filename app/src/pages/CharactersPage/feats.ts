import type { FeatureMapEntry, FeatureTrackingState } from "../../codex/entries";
import { CLASS_FEATURE, FEAT_CATEGORY, FEATS } from "../../codex/entries";
import { ALL_SKILLS, TOOL_PROFICIENCY } from "../../types";
import type {
  AbilityKey,
  Character,
  CharacterFeatEntry,
  CharacterStatusEntry,
  SkillName
} from "../../types";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../types";
import type {
  AbilityScoreImprovementChoice,
  BoonOfIrresistibleOffenseChoice,
  CharacterFeatSource,
  EpicBoonAbilityChoice,
  SkilledChoice,
  SkilledFeatSelection
} from "../../types/feats";
import { formatCodexLabel } from "../../utils/codex";
import type {
  ArmorClassFeatureContext,
  FeatureAbilityScoreBonus,
  FeatureArmorClassBonus
} from "./classFeatures";
import { getToolProficiencyLabel } from "./proficiency";

export type FeatDefinition = FeatureMapEntry & {
  feat: FEATS;
  label: string;
  category: FEAT_CATEGORY;
  prerequisite?: string;
  repeatable?: boolean;
};

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const abilityKeySet = new Set<AbilityKey>(abilityKeys);
const skillNameSet = new Set<SkillName>(ALL_SKILLS);
const allEpicBoonAbilityOptions: AbilityKey[] = [...abilityKeys];
const spellRecallAbilityOptions: AbilityKey[] = ["INT", "WIS", "CHA"];
const epicBoonAbilityIncreaseFeatOptions = new Map<FEATS, AbilityKey[]>([
  [FEATS.BOON_OF_COMBAT_PROWESS, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_DIMENSIONAL_TRAVEL, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_FATE, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_THE_NIGHT_SPIRIT, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_SPELL_RECALL, spellRecallAbilityOptions],
  [FEATS.BOON_OF_TRUESIGHT, allEpicBoonAbilityOptions]
]);

export const featDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.ALERT,
    label: "Alert",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Initiative Proficiency.</strong> When you roll Initiative, you can add your Proficiency Bonus to the roll. <link:tracked>Tracked</link>",
      "<strong>Initiative Swap.</strong> Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can't make this swap if you or the ally has the Incapacitated condition. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.MAGIC_INITIATE,
    label: "Magic Initiate",
    category: FEAT_CATEGORY.ORIGIN,
    repeatable: true,
    description: [
      "You gain the following benefits.",
      "<strong>Two Cantrips.</strong> You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat).",
      "<strong>Level 1 Spell.</strong> Choose a level 1 spell from the same list you selected for this feat's cantrips. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have.",
      "<strong>Spell Change.</strong> Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list.",
      "<strong>Repeatable.</strong> You can take this feat more than once, but you must choose a different spell list each time."
    ],
    trackingState: "not-tracked"
  },
  {
    feat: FEATS.SAVAGE_ATTACKER,
    label: "Savage Attacker",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You've trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target."
    ],
    trackingState: "not-tracked"
  },
  {
    feat: FEATS.SKILLED,
    label: "Skilled",
    category: FEAT_CATEGORY.ORIGIN,
    repeatable: true,
    description: [
      "You gain proficiency in any combination of three skills or tools of your choice.",
      "<strong>Repeatable.</strong> You can take this feat more than once."
    ],
    trackingState: "tracked"
  },
  {
    feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
    label: "Ability Score Improvement",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    repeatable: true,
    description: [
      "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.",
      "This feat can't increase an ability score above 20.",
      "<strong>Repeatable.</strong> You can take this feat more than once."
    ],
    trackingState: "tracked"
  },
  {
    feat: FEATS.GRAPPLER,
    label: "Grappler",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "<strong>Punch and Grab.</strong> When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn.",
      "<strong>Attack Advantage.</strong> You have Advantage on attack rolls against a creature Grappled by you.",
      "<strong>Fast Wrestler.</strong> You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller."
    ],
    trackingState: "not-tracked"
  },
  {
    feat: FEATS.ARCHERY,
    label: "Archery",
    category: FEAT_CATEGORY.FIGHTING_STYLE,
    prerequisite: "Fighting Style Feature",
    description: [
      "You gain a +2 bonus to attack rolls you make with Ranged weapons."
    ],
    trackingState: "not-tracked"
  },
  {
    feat: FEATS.DEFENSE,
    label: "Defense",
    category: FEAT_CATEGORY.FIGHTING_STYLE,
    prerequisite: "Fighting Style Feature",
    description: [
      "While you're wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class."
    ],
    trackingState: "tracked"
  },
  {
    feat: FEATS.GREAT_WEAPON_FIGHTING,
    label: "Great Weapon Fighting",
    category: FEAT_CATEGORY.FIGHTING_STYLE,
    prerequisite: "Fighting Style Feature",
    description: [
      "When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3.",
      "The weapon must have the <link:Two-Handed>Two-Handed</link> or <link:Versatile>Versatile</link> property to gain this benefit."
    ],
    trackingState: "tracked"
  },
  {
    feat: FEATS.TWO_WEAPON_FIGHTING,
    label: "Two-Weapon Fighting",
    category: FEAT_CATEGORY.FIGHTING_STYLE,
    prerequisite: "Fighting Style Feature",
    description: [
      "When you make an extra attack as a result of using a weapon that has the <link:Light>Light</link> property, you can add your ability modifier to the damage of that attack if you aren't already adding it to the damage."
    ],
    trackingState: "not-tracked"
  },
  {
    feat: FEATS.BOON_OF_COMBAT_PROWESS,
    label: "Boon of Combat Prowess",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Peerless Aim.</strong> When you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    label: "Boon of Dimensional Travel",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Blink Steps.</strong> Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_FATE,
    label: "Boon of Fate",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Improve Fate.</strong> When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll. Once you use this benefit, you can't use it again until you roll Initiative or finish a Short Rest or Long Rest. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    label: "Boon of Irresistible Offense",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity score by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Overcome Defenses.</strong> The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance. <link:not-tracked>Not Tracked</link>",
      "<strong>Overwhelming Strike.</strong> When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage's type is the same as the attack's type. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_THE_NIGHT_SPIRIT,
    label: "Boon of the Night Spirit",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Merge with Shadows.</strong> While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction. <link:not-tracked>Not Tracked</link>",
      "<strong>Shadowy Form.</strong> While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_SPELL_RECALL,
    label: "Boon of Spell Recall",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+, Spellcasting Feature",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Free Casting.</strong> Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If the number you roll is the same as the slot's level, the slot isn't expended. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  {
    feat: FEATS.BOON_OF_TRUESIGHT,
    label: "Boon of Truesight",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Truesight.</strong> You have Truesight with a range of 60 feet."
    ],
    trackingState: "tracked"
  }
];

const featDefinitionsByFeat = new Map(featDefinitions.map((definition) => [definition.feat, definition]));

function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === "string" && abilityKeySet.has(value as AbilityKey);
}

function clampFeatLevel(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function normalizeCharacterFeatSource(value: unknown, takenAtLevel: number): CharacterFeatSource {
  if (!value || typeof value !== "object") {
    return {
      type: "manual"
    };
  }

  const record = value as Partial<CharacterFeatSource>;

  if (record.type !== "class-feature") {
    return {
      type: "manual"
    };
  }

  if (typeof record.feature !== "string") {
    return {
      type: "manual"
    };
  }

  return {
    type: "class-feature",
    feature: record.feature as CLASS_FEATURE,
    level: clampFeatLevel(record.level, takenAtLevel)
  };
}

function normalizeAbilityScoreImprovementChoice(
  value: unknown
): AbilityScoreImprovementChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<AbilityScoreImprovementChoice>;

  if (record.mode === "single" && isAbilityKey(record.primaryAbility)) {
    return {
      mode: "single",
      primaryAbility: record.primaryAbility
    };
  }

  if (
    record.mode === "split" &&
    isAbilityKey(record.primaryAbility) &&
    isAbilityKey(record.secondaryAbility) &&
    record.primaryAbility !== record.secondaryAbility
  ) {
    return {
      mode: "split",
      primaryAbility: record.primaryAbility,
      secondaryAbility: record.secondaryAbility
    };
  }

  return undefined;
}

function normalizeBoonOfIrresistibleOffenseChoice(
  value: unknown
): BoonOfIrresistibleOffenseChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BoonOfIrresistibleOffenseChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

function normalizeEpicBoonAbilityChoice(
  feat: FEATS,
  value: unknown
): EpicBoonAbilityChoice | undefined {
  const allowedAbilities = epicBoonAbilityIncreaseFeatOptions.get(feat);

  if (!allowedAbilities || !value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<EpicBoonAbilityChoice>;

  if (typeof record.ability !== "string") {
    return undefined;
  }

  const ability = record.ability as AbilityKey;

  if (!allowedAbilities.includes(ability)) {
    return undefined;
  }

  return {
    ability
  };
}

function isSkilledTool(value: unknown): value is TOOL_PROFICIENCY {
  return typeof value === "string" && Object.values(TOOL_PROFICIENCY).includes(value as TOOL_PROFICIENCY);
}

function normalizeSkilledSelection(value: unknown): SkilledFeatSelection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<SkilledFeatSelection>;

  if (
    record.kind === "skill" &&
    typeof record.skill === "string" &&
    skillNameSet.has(record.skill as SkillName)
  ) {
    return {
      kind: "skill",
      skill: record.skill as SkillName
    };
  }

  if (record.kind === "tool" && isSkilledTool(record.tool)) {
    return {
      kind: "tool",
      tool: record.tool
    };
  }

  return null;
}

function normalizeSkilledChoice(value: unknown): SkilledChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SkilledChoice>;

  if (!Array.isArray(record.selections) || record.selections.length !== 3) {
    return undefined;
  }

  const selections = record.selections
    .map((selection) => normalizeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return undefined;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

function createFeatEntryId(feat: FEATS): string {
  return `${feat}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCharacterFeats(value: unknown, currentLevel: number): CharacterFeatEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((rawEntry, index) => {
    if (!rawEntry || typeof rawEntry !== "object") {
      return [];
    }

    const record = rawEntry as Partial<CharacterFeatEntry>;

    if (typeof record.feat !== "string" || !featDefinitionsByFeat.has(record.feat as FEATS)) {
      return [];
    }

    const feat = record.feat as FEATS;
    const abilityScoreImprovement =
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT
        ? normalizeAbilityScoreImprovementChoice(record.abilityScoreImprovement)
        : undefined;
    const boonOfIrresistibleOffense =
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE
        ? normalizeBoonOfIrresistibleOffenseChoice(record.boonOfIrresistibleOffense)
        : undefined;
    const epicBoonAbilityChoice = epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? normalizeEpicBoonAbilityChoice(feat, record.epicBoonAbilityChoice)
      : undefined;
    const skilled = feat === FEATS.SKILLED ? normalizeSkilledChoice(record.skilled) : undefined;

    return [
      {
        id:
          typeof record.id === "string" && record.id.trim().length > 0
            ? record.id.trim()
            : `${createFeatEntryId(feat)}-${index}`,
        feat,
        takenAtLevel: clampFeatLevel(record.takenAtLevel, currentLevel),
        source: normalizeCharacterFeatSource(record.source, clampFeatLevel(record.takenAtLevel, currentLevel)),
        abilityScoreImprovement,
        boonOfIrresistibleOffense,
        epicBoonAbilityChoice,
        skilled
      }
    ];
  });
}

export function createCharacterFeatEntry(
  feat: FEATS,
  takenAtLevel: number,
  options?: {
    source?: CharacterFeatSource;
    abilityScoreImprovement?: AbilityScoreImprovementChoice;
    boonOfIrresistibleOffense?: BoonOfIrresistibleOffenseChoice;
    epicBoonAbilityChoice?: EpicBoonAbilityChoice;
    skilled?: SkilledChoice;
  }
): CharacterFeatEntry {
  return {
    id: createFeatEntryId(feat),
    feat,
    takenAtLevel: clampFeatLevel(takenAtLevel, takenAtLevel),
    source: options?.source ?? { type: "manual" },
    abilityScoreImprovement:
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT ? options?.abilityScoreImprovement : undefined,
    boonOfIrresistibleOffense:
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE
        ? options?.boonOfIrresistibleOffense
        : undefined,
    epicBoonAbilityChoice: epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? options?.epicBoonAbilityChoice
      : undefined,
    skilled: feat === FEATS.SKILLED ? options?.skilled : undefined
  };
}

export function getFeatDefinition(feat: FEATS): FeatDefinition | null {
  return featDefinitionsByFeat.get(feat) ?? null;
}

export function getFeatLabel(feat: FEATS): string {
  return getFeatDefinition(feat)?.label ?? formatCodexLabel(feat);
}

export function getFeatCategoryLabel(category: FEAT_CATEGORY): string {
  return formatCodexLabel(category);
}

export function getCharacterFeatSourceLabel(entry: CharacterFeatEntry): string {
  if (entry.source.type === "manual") {
    return "MANUAL";
  }

  if (entry.source.feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT) {
    return `Level ${entry.source.level}: ASI`;
  }

  return `Level ${entry.source.level}: ${formatCodexLabel(entry.source.feature)}`;
}

export function isFeatRepeatable(feat: FEATS): boolean {
  return Boolean(getFeatDefinition(feat)?.repeatable);
}

export function getFeatTrackingState(feat: FEATS): FeatureTrackingState {
  return getFeatDefinition(feat)?.trackingState ?? "not-tracked";
}

export function getAbilityScoreImprovementSummary(
  choice?: AbilityScoreImprovementChoice
): string | null {
  if (!choice) {
    return null;
  }

  if (choice.mode === "single") {
    return `${choice.primaryAbility} +2`;
  }

  return `${choice.primaryAbility} +1, ${choice.secondaryAbility} +1`;
}

export function getSkilledSelectionLabel(selection: SkilledFeatSelection): string {
  return selection.kind === "skill" ? selection.skill : getToolProficiencyLabel(selection.tool);
}

export function getSkilledChoiceSummary(choice?: SkilledChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.selections.map((selection) => getSkilledSelectionLabel(selection)).join(", ");
}

export function getEpicBoonAbilityChoiceSummary(choice?: EpicBoonAbilityChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getCharacterFeatSummary(entry: CharacterFeatEntry): string | null {
  if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
    return getAbilityScoreImprovementSummary(entry.abilityScoreImprovement);
  }

  if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    return entry.boonOfIrresistibleOffense ? `${entry.boonOfIrresistibleOffense.ability} +1` : null;
  }

  if (entry.epicBoonAbilityChoice) {
    return getEpicBoonAbilityChoiceSummary(entry.epicBoonAbilityChoice);
  }

  if (entry.feat === FEATS.SKILLED) {
    return getSkilledChoiceSummary(entry.skilled);
  }

  return null;
}

export function getFeatDefinitionsByCategory(): Record<FEAT_CATEGORY, FeatDefinition[]> {
  return featDefinitions.reduce<Record<FEAT_CATEGORY, FeatDefinition[]>>(
    (groups, definition) => {
      groups[definition.category].push(definition);
      return groups;
    },
    {
      [FEAT_CATEGORY.ORIGIN]: [],
      [FEAT_CATEGORY.GENERAL]: [],
      [FEAT_CATEGORY.FIGHTING_STYLE]: [],
      [FEAT_CATEGORY.EPIC_BOON]: []
    }
  );
}

export function getFeatAbilityScoreBonusesForCharacter(
  character: Pick<Character, "feats" | "level">
): FeatureAbilityScoreBonus[] {
  const feats = normalizeCharacterFeats(character.feats, character.level);

  return feats.flatMap((entry, index) => {
    const order = entry.takenAtLevel + index / 100;

    if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT && entry.abilityScoreImprovement) {
      if (entry.abilityScoreImprovement.mode === "single") {
        return [
          {
            ability: entry.abilityScoreImprovement.primaryAbility,
            label: "Ability Score Improvement",
            value: 2,
            maxScore: 20,
            order
          }
        ];
      }

      return [
        {
          ability: entry.abilityScoreImprovement.primaryAbility,
          label: "Ability Score Improvement",
          value: 1,
          maxScore: 20,
          order
        },
        {
          ability: entry.abilityScoreImprovement.secondaryAbility,
          label: "Ability Score Improvement",
          value: 1,
          maxScore: 20,
          order
        }
      ];
    }

    if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE && entry.boonOfIrresistibleOffense) {
      return [
        {
          ability: entry.boonOfIrresistibleOffense.ability,
          label: "Boon of Irresistible Offense",
          value: 1,
          maxScore: 30,
          order
        }
      ];
    }

    if (entry.epicBoonAbilityChoice) {
      return [
        {
          ability: entry.epicBoonAbilityChoice.ability,
          label: getFeatLabel(entry.feat),
          value: 1,
          maxScore: 30,
          order
        }
      ];
    }

    return [];
  });
}

export function getEpicBoonAbilityOptions(feat: FEATS): AbilityKey[] | null {
  const options = epicBoonAbilityIncreaseFeatOptions.get(feat);

  return options ? [...options] : null;
}

export function getFeatArmorClassBonusesForCharacter(
  character: Pick<Character, "feats" | "level">,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  if (!context.hasWornBodyArmor) {
    return [];
  }

  const feats = normalizeCharacterFeats(character.feats, character.level);

  if (!feats.some((entry) => entry.feat === FEATS.DEFENSE)) {
    return [];
  }

  return [
    {
      label: "Defense",
      value: 1
    }
  ];
}

export function getFeatDerivedStatusEntriesForCharacter(
  character: Pick<Character, "feats" | "level">
): CharacterStatusEntry[] {
  const feats = normalizeCharacterFeats(character.feats, character.level);

  return feats.flatMap((entry, index) => {
    if (entry.feat !== FEATS.BOON_OF_TRUESIGHT) {
      return [];
    }

    return [
      {
        id: `feat-boon-of-truesight-${index}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.TRUESIGHT,
        source: "Boon of Truesight",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        rangeFeet: 60
      }
    ];
  });
}

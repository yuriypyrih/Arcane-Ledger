import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { FEATS, type SpellEntry } from "../../../../codex/entries";
import {
  getBlessedWarriorCantripOptions,
  getBlessedWarriorChoiceSummary,
  getCharacterFeatSourceLabel,
  getCharacterFeatSummary,
  getDruidicWarriorCantripOptions,
  getDruidicWarriorChoiceSummary,
  getEpicBoonAbilityOptions,
  getMagicInitiateCantripOptions,
  getMagicInitiateChoiceSummary,
  getMagicInitiateLevelOneSpellOptions,
  getMusicianChoiceSummary,
  isMagicInitiateSpellList,
  magicInitiateSpellcastingAbilityOptions,
  getSkilledChoiceSummary
} from "../../../../pages/CharactersPage/feats";
import {
  getCrafterChoiceSummary,
  isCrafterFastCraftingTool
} from "../../../../pages/CharactersPage/crafterFeat";
import {
  skillsOptions,
  musicalInstrumentToolProficiencies,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiencyOptions";
import type {
  BlessedWarriorChoice,
  CharacterFeatEntry,
  CrafterChoice,
  DruidicWarriorChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkillName,
  SkilledChoice,
  SkilledFeatSelection
} from "../../../../types";
import type {
  PendingAbilityScoreImprovement,
  PendingBlessedWarriorChoice,
  PendingBoonOfIrresistibleOffense,
  PendingCrafterChoice,
  PendingDruidicWarriorChoice,
  PendingEpicBoonAbilityChoice,
  PendingFeatState,
  PendingMagicInitiateChoice,
  PendingMusicianChoice,
  PendingSkilledChoice
} from "./types";

const skilledSkillOptionSet = new Set<string>(skillsOptions);
const skilledToolOptionSet = new Set<string>(toolProficiencyOptions);

export const skilledNoneOptionValue = "none";
export const skilledSelectionIndices = [0, 1, 2] as const;
export const crafterNoneOptionValue = "none";
export const crafterSelectionIndices = [0, 1, 2] as const;
export const musicianNoneOptionValue = "none";
export const musicianSelectionIndices = [0, 1, 2] as const;
export const magicInitiateNoneOptionValue = "none";
export const magicInitiateCantripSelectionIndices = [0, 1] as const;
const musicianToolOptionSet = new Set<ToolProficiency>(musicalInstrumentToolProficiencies);

function createDefaultPendingCantripChoice(
  options: SpellEntry[],
  recommendedSpellNames: [string, string]
): [string, string] {
  const optionMap = new Map(options.map((spell) => [spell.name, spell.id] as const));
  const firstRecommendedChoice = optionMap.get(recommendedSpellNames[0]);
  const secondRecommendedChoice = optionMap.get(recommendedSpellNames[1]);
  const allOptionIds = options.map((spell) => spell.id);
  const firstChoice = firstRecommendedChoice ?? allOptionIds[0] ?? "";
  const secondChoice =
    secondRecommendedChoice && secondRecommendedChoice !== firstChoice
      ? secondRecommendedChoice
      : (allOptionIds.find((spellId) => spellId !== firstChoice) ?? "");

  return [firstChoice, secondChoice];
}

function decodeSkilledSelection(value: string): SkilledFeatSelection | null {
  if (value === skilledNoneOptionValue) {
    return null;
  }

  if (value.startsWith("skill:")) {
    const skill = value.slice("skill:".length) as SkillName;

    if (skilledSkillOptionSet.has(skill)) {
      return {
        kind: "skill",
        skill
      };
    }

    return null;
  }

  if (value.startsWith("tool:")) {
    const tool = value.slice("tool:".length) as ToolProficiency;

    if (skilledToolOptionSet.has(tool)) {
      return {
        kind: "tool",
        tool
      };
    }
  }

  return null;
}

function decodePendingCantripChoice<TChoice extends BlessedWarriorChoice | DruidicWarriorChoice>(
  choice: { cantripIds: [string, string] },
  options: SpellEntry[]
): TChoice | null {
  const cantripIds = [...new Set(choice.cantripIds.filter((spellId) => spellId.length > 0))];

  if (cantripIds.length !== 2) {
    return null;
  }

  const optionIds = new Set(options.map((spell) => spell.id));

  if (!cantripIds.every((spellId) => optionIds.has(spellId))) {
    return null;
  }

  return {
    cantripIds: cantripIds as TChoice["cantripIds"]
  } as TChoice;
}

export function createEmptyPendingFeatState(): PendingFeatState {
  return {
    abilityScoreImprovement: null,
    boonOfIrresistibleOffense: null,
    blessedWarriorChoice: null,
    crafterChoice: null,
    druidicWarriorChoice: null,
    magicInitiateChoice: null,
    musicianChoice: null,
    epicBoonAbilityChoice: null,
    skilledChoice: null
  };
}

export function createDefaultPendingAbilityScoreImprovement(): PendingAbilityScoreImprovement {
  return {
    mode: "single",
    primaryAbility: "STR",
    secondaryAbility: "DEX"
  };
}

export function createDefaultPendingBoonOfIrresistibleOffense(): PendingBoonOfIrresistibleOffense {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingBlessedWarriorChoice(): PendingBlessedWarriorChoice {
  return {
    cantripIds: createDefaultPendingCantripChoice(getBlessedWarriorCantripOptions(), [
      "Guidance",
      "Sacred Flame"
    ])
  };
}

export function createDefaultPendingDruidicWarriorChoice(): PendingDruidicWarriorChoice {
  return {
    cantripIds: createDefaultPendingCantripChoice(getDruidicWarriorCantripOptions(), [
      "Guidance",
      "Starry Wisp"
    ])
  };
}

export function createDefaultPendingCrafterChoice(): PendingCrafterChoice {
  return {
    toolProficiencies: [
      crafterNoneOptionValue,
      crafterNoneOptionValue,
      crafterNoneOptionValue
    ]
  };
}

export function createDefaultPendingMagicInitiateChoice(): PendingMagicInitiateChoice {
  return {
    spellList: magicInitiateNoneOptionValue,
    cantripIds: ["", ""],
    levelOneSpellId: "",
    spellcastingAbility: magicInitiateNoneOptionValue
  };
}

export function createDefaultPendingMusicianChoice(): PendingMusicianChoice {
  return {
    toolProficiencies: [
      musicianNoneOptionValue,
      musicianNoneOptionValue,
      musicianNoneOptionValue
    ]
  };
}

export function createDefaultPendingEpicBoonAbilityChoice(
  feat: FEATS
): PendingEpicBoonAbilityChoice | null {
  const abilityOptions = getEpicBoonAbilityOptions(feat);

  if (!abilityOptions || abilityOptions.length === 0) {
    return null;
  }

  return {
    feat,
    ability: abilityOptions[0]
  };
}

export function createDefaultPendingSkilledChoice(): PendingSkilledChoice {
  return {
    selections: [skilledNoneOptionValue, skilledNoneOptionValue, skilledNoneOptionValue]
  };
}

export function createPendingFeatStateForFeat(feat: FEATS): PendingFeatState | null {
  if (feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
    return {
      ...createEmptyPendingFeatState(),
      abilityScoreImprovement: createDefaultPendingAbilityScoreImprovement()
    };
  }

  if (feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    return {
      ...createEmptyPendingFeatState(),
      boonOfIrresistibleOffense: createDefaultPendingBoonOfIrresistibleOffense()
    };
  }

  if (feat === FEATS.BLESSED_WARRIOR) {
    return {
      ...createEmptyPendingFeatState(),
      blessedWarriorChoice: createDefaultPendingBlessedWarriorChoice()
    };
  }

  if (feat === FEATS.DRUIDIC_WARRIOR) {
    return {
      ...createEmptyPendingFeatState(),
      druidicWarriorChoice: createDefaultPendingDruidicWarriorChoice()
    };
  }

  if (feat === FEATS.CRAFTER) {
    return {
      ...createEmptyPendingFeatState(),
      crafterChoice: createDefaultPendingCrafterChoice()
    };
  }

  if (feat === FEATS.MAGIC_INITIATE) {
    return {
      ...createEmptyPendingFeatState(),
      magicInitiateChoice: createDefaultPendingMagicInitiateChoice()
    };
  }

  if (feat === FEATS.MUSICIAN) {
    return {
      ...createEmptyPendingFeatState(),
      musicianChoice: createDefaultPendingMusicianChoice()
    };
  }

  const epicBoonAbilityChoice = createDefaultPendingEpicBoonAbilityChoice(feat);

  if (epicBoonAbilityChoice) {
    return {
      ...createEmptyPendingFeatState(),
      epicBoonAbilityChoice
    };
  }

  if (feat === FEATS.SKILLED) {
    return {
      ...createEmptyPendingFeatState(),
      skilledChoice: createDefaultPendingSkilledChoice()
    };
  }

  return null;
}

export function decodePendingBlessedWarriorChoice(
  choice: PendingBlessedWarriorChoice
): BlessedWarriorChoice | null {
  return decodePendingCantripChoice<BlessedWarriorChoice>(
    choice,
    getBlessedWarriorCantripOptions()
  );
}

export function isPendingBlessedWarriorChoiceValid(choice: PendingBlessedWarriorChoice): boolean {
  return decodePendingBlessedWarriorChoice(choice) !== null;
}

export function getPendingBlessedWarriorChoiceSummary(
  choice: PendingBlessedWarriorChoice
): string | null {
  return getBlessedWarriorChoiceSummary(decodePendingBlessedWarriorChoice(choice) ?? undefined);
}

export function decodePendingDruidicWarriorChoice(
  choice: PendingDruidicWarriorChoice
): DruidicWarriorChoice | null {
  return decodePendingCantripChoice<DruidicWarriorChoice>(choice, getDruidicWarriorCantripOptions());
}

export function decodePendingMagicInitiateChoice(
  choice: PendingMagicInitiateChoice
): MagicInitiateChoice | null {
  if (!isMagicInitiateSpellList(choice.spellList)) {
    return null;
  }

  const cantripIds = [...new Set(choice.cantripIds.filter((spellId) => spellId.length > 0))];
  const cantripOptionIds = new Set(
    getMagicInitiateCantripOptions(choice.spellList).map((spell) => spell.id)
  );

  if (cantripIds.length !== 2 || !cantripIds.every((spellId) => cantripOptionIds.has(spellId))) {
    return null;
  }

  const levelOneSpellOptionIds = new Set(
    getMagicInitiateLevelOneSpellOptions(choice.spellList).map((spell) => spell.id)
  );

  if (!levelOneSpellOptionIds.has(choice.levelOneSpellId)) {
    return null;
  }

  if (
    !magicInitiateSpellcastingAbilityOptions.includes(
      choice.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"]
    )
  ) {
    return null;
  }

  return {
    spellList: choice.spellList,
    cantripIds: cantripIds as MagicInitiateChoice["cantripIds"],
    levelOneSpellId: choice.levelOneSpellId,
    spellcastingAbility: choice.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"]
  };
}

export function decodePendingCrafterChoice(choice: PendingCrafterChoice): CrafterChoice | null {
  const toolProficiencies = choice.toolProficiencies.filter(isCrafterFastCraftingTool);
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return null;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as CrafterChoice["toolProficiencies"]
  };
}

export function isPendingCrafterChoiceValid(choice: PendingCrafterChoice): boolean {
  return (
    new Set(choice.toolProficiencies).size === choice.toolProficiencies.length &&
    decodePendingCrafterChoice(choice) !== null
  );
}

export function getPendingCrafterChoiceSummary(choice: PendingCrafterChoice): string | null {
  return getCrafterChoiceSummary(decodePendingCrafterChoice(choice) ?? undefined);
}

export function decodePendingMusicianChoice(choice: PendingMusicianChoice): MusicianChoice | null {
  const toolProficiencies = choice.toolProficiencies.filter(
    (tool): tool is ToolProficiency => musicianToolOptionSet.has(tool as ToolProficiency)
  );
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return null;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as MusicianChoice["toolProficiencies"]
  };
}

export function isPendingMusicianChoiceValid(choice: PendingMusicianChoice): boolean {
  return (
    new Set(choice.toolProficiencies).size === choice.toolProficiencies.length &&
    decodePendingMusicianChoice(choice) !== null
  );
}

export function getPendingMusicianChoiceSummary(choice: PendingMusicianChoice): string | null {
  return getMusicianChoiceSummary(decodePendingMusicianChoice(choice) ?? undefined);
}

export function isPendingDruidicWarriorChoiceValid(choice: PendingDruidicWarriorChoice): boolean {
  return decodePendingDruidicWarriorChoice(choice) !== null;
}

export function getPendingDruidicWarriorChoiceSummary(
  choice: PendingDruidicWarriorChoice
): string | null {
  return getDruidicWarriorChoiceSummary(decodePendingDruidicWarriorChoice(choice) ?? undefined);
}

export function isPendingMagicInitiateChoiceValid(choice: PendingMagicInitiateChoice): boolean {
  return decodePendingMagicInitiateChoice(choice) !== null;
}

export function getPendingMagicInitiateChoiceSummary(
  choice: PendingMagicInitiateChoice
): string | null {
  return getMagicInitiateChoiceSummary(decodePendingMagicInitiateChoice(choice) ?? undefined);
}

export function decodePendingSkilledChoice(choice: PendingSkilledChoice): SkilledChoice | null {
  const selections = choice.selections
    .map((selection) => decodeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return null;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

export function isPendingSkilledChoiceValid(choice: PendingSkilledChoice): boolean {
  return (
    new Set(choice.selections).size === choice.selections.length &&
    decodePendingSkilledChoice(choice) !== null
  );
}

export function getPendingSkilledChoiceSummary(choice: PendingSkilledChoice): string | null {
  return getSkilledChoiceSummary(decodePendingSkilledChoice(choice) ?? undefined);
}

export function splitSkilledSelections(choice?: SkilledChoice): {
  skills: SkillName[];
  tools: ToolProficiency[];
} {
  return (choice?.selections ?? []).reduce<{
    skills: SkillName[];
    tools: ToolProficiency[];
  }>(
    (result, selection) => {
      if (selection.kind === "skill") {
        result.skills.push(selection.skill);
      } else {
        result.tools.push(selection.tool);
      }

      return result;
    },
    {
      skills: [],
      tools: []
    }
  );
}

export function getCrafterToolSelections(choice?: CrafterChoice): ToolProficiency[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

export function getMusicianToolSelections(choice?: MusicianChoice): ToolProficiency[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

export function groupFeatEntriesByFeat(feats: CharacterFeatEntry[]): Array<{
  feat: FEATS;
  entries: CharacterFeatEntry[];
}> {
  return feats.reduce<Array<{ feat: FEATS; entries: CharacterFeatEntry[] }>>((groups, entry) => {
    const existingGroup = groups.find((group) => group.feat === entry.feat);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({
      feat: entry.feat,
      entries: [entry]
    });
    return groups;
  }, []);
}

export function getRepeatableFeatEntrySummary(entry: CharacterFeatEntry): string {
  const summary = getCharacterFeatSummary(entry);

  return summary
    ? `Picked: ${summary} • ${getCharacterFeatSourceLabel(entry)}`
    : `Picked • ${getCharacterFeatSourceLabel(entry)}`;
}

export function triggerActionOnEnterOrSpace(
  event: ReactKeyboardEvent<HTMLElement>,
  action: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

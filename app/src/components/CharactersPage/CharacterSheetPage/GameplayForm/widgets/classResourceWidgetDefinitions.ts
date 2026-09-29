import { Flame, Brain, Wind, Hexagon, Pentagon, PawPrint, Music, Sparkles } from "lucide-react";
import type { CharacterSheetSectionProfilerId } from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetSectionProfiler";
import type { Character } from "../../../../../types";
import type { ResourceCountWidgetIcon } from "./ResourceCountWidget";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";
import {
  expendBarbarianRageUseForCharacter,
  getBarbarianRageUsesRemainingForCharacter,
  getBarbarianRageUsesTotalForCharacter,
  restoreAllBarbarianRageUsesForCharacter,
  restoreBarbarianRageUseForCharacter,
  expendMonkFocusPointForCharacter,
  getMonkFocusPointsRemainingForCharacter,
  getMonkFocusPointsTotalForCharacter,
  restoreAllMonkFocusPointsForCharacter,
  restoreMonkFocusPointForCharacter,
  consumeFighterSecondWindUseForCharacter,
  getFighterSecondWindUsesRemainingForCharacter,
  getFighterSecondWindUsesTotalForCharacter,
  restoreFighterSecondWindOnLongRestForCharacter,
  restoreFighterSecondWindOnShortRestForCharacter,
  expendFighterPsiWarriorEnergyDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  restoreAllFighterPsiWarriorEnergyDiceForCharacter,
  restoreFighterPsiWarriorEnergyDieForCharacter,
  expendRogueSoulknifePsionicDieForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter,
  restoreAllRogueSoulknifePsionicDiceForCharacter,
  restoreRogueSoulknifePsionicDieForCharacter,
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  restoreAllFighterBattleMasterSuperiorityDiceForCharacter,
  restoreFighterBattleMasterSuperiorityDieForCharacter,
  expendDruidWildShapeUseForCharacter,
  getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotalForCharacter,
  restoreAllDruidWildShapeUsesForCharacter,
  restoreDruidWildShapeUseForCharacter,
  expendBardicInspirationUseForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  restoreAllBardicInspirationUsesForCharacter,
  restoreBardicInspirationUseForCharacter,
  expendSorceryPointForCharacter,
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter,
  restoreAllSorceryPointsForCharacter,
  restoreSorceryPointForCharacter,
  expendChannelDivinityUseForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  restoreAllChannelDivinityUsesForCharacter,
  restoreChannelDivinityUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";

export type ClassResourceWidgetDefinition = {
  id: CharacterSheetSectionProfilerId;
  label: string;
  icon: ResourceCountWidgetIcon;
  total: (character: Character) => number;
  remaining: (character: Character) => number;
  die?: (character: Character) => string | null | undefined;
  restoreOne: (character: Character) => Character;
  spendOne: (character: Character) => Character;
  restoreAll: (character: Character) => Character;
};

// Presentation and runtime adapters only. Capacity, spending, and recovery belong to the class runtime.
export const classResourceWidgets: ClassResourceWidgetDefinition[] = [
  {
    id: "gameplay-rage",
    label: "Rage",
    icon: { kind: "lucide", icon: Flame },
    total: getBarbarianRageUsesTotalForCharacter,
    remaining: getBarbarianRageUsesRemainingForCharacter,
    restoreOne: restoreBarbarianRageUseForCharacter,
    spendOne: expendBarbarianRageUseForCharacter,
    restoreAll: restoreAllBarbarianRageUsesForCharacter
  },
  {
    id: "gameplay-focus",
    label: "Focus Points",
    icon: { kind: "lucide", icon: Brain },
    total: getMonkFocusPointsTotalForCharacter,
    remaining: getMonkFocusPointsRemainingForCharacter,
    restoreOne: restoreMonkFocusPointForCharacter,
    spendOne: expendMonkFocusPointForCharacter,
    restoreAll: restoreAllMonkFocusPointsForCharacter
  },
  {
    id: "gameplay-fighter-second-wind",
    label: "Second Wind",
    icon: { kind: "lucide", icon: Wind },
    total: getFighterSecondWindUsesTotalForCharacter,
    remaining: getFighterSecondWindUsesRemainingForCharacter,
    restoreOne: restoreFighterSecondWindOnShortRestForCharacter,
    spendOne: consumeFighterSecondWindUseForCharacter,
    restoreAll: restoreFighterSecondWindOnLongRestForCharacter
  },
  {
    id: "gameplay-psi-energy",
    label: "Psi Energy Dice",
    icon: { kind: "lucide", icon: Hexagon },
    total: getFighterPsiWarriorEnergyDiceTotalForCharacter,
    remaining: getFighterPsiWarriorEnergyDiceRemainingForCharacter,
    die: getFighterPsiWarriorEnergyDieForCharacter,
    restoreOne: restoreFighterPsiWarriorEnergyDieForCharacter,
    spendOne: expendFighterPsiWarriorEnergyDieForCharacter,
    restoreAll: restoreAllFighterPsiWarriorEnergyDiceForCharacter
  },
  {
    id: "gameplay-soulknife-psionic-dice",
    label: "Psionic Dice",
    icon: { kind: "lucide", icon: Hexagon },
    total: getRogueSoulknifePsionicDiceTotalForCharacter,
    remaining: getRogueSoulknifePsionicDiceRemainingForCharacter,
    die: getRogueSoulknifePsionicDieForCharacter,
    restoreOne: restoreRogueSoulknifePsionicDieForCharacter,
    spendOne: expendRogueSoulknifePsionicDieForCharacter,
    restoreAll: restoreAllRogueSoulknifePsionicDiceForCharacter
  },
  {
    id: "gameplay-superiority-dice",
    label: "Superiority Dice",
    icon: { kind: "lucide", icon: Pentagon },
    total: getFighterBattleMasterSuperiorityDiceTotalForCharacter,
    remaining: getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
    die: getFighterBattleMasterSuperiorityDieForCharacter,
    restoreOne: restoreFighterBattleMasterSuperiorityDieForCharacter,
    spendOne: expendFighterBattleMasterSuperiorityDieForCharacter,
    restoreAll: restoreAllFighterBattleMasterSuperiorityDiceForCharacter
  },
  {
    id: "gameplay-wild-shape",
    label: "Wild Shape",
    icon: { kind: "lucide", icon: PawPrint },
    total: getDruidWildShapeUsesTotalForCharacter,
    remaining: getDruidWildShapeUsesRemainingForCharacter,
    restoreOne: restoreDruidWildShapeUseForCharacter,
    spendOne: expendDruidWildShapeUseForCharacter,
    restoreAll: restoreAllDruidWildShapeUsesForCharacter
  },
  {
    id: "gameplay-bardic-inspiration",
    label: "Bardic Inspiration",
    icon: { kind: "lucide", icon: Music },
    total: getBardicInspirationUsesTotalForCharacter,
    remaining: getBardicInspirationUsesRemainingForCharacter,
    restoreOne: restoreBardicInspirationUseForCharacter,
    spendOne: expendBardicInspirationUseForCharacter,
    restoreAll: restoreAllBardicInspirationUsesForCharacter
  },
  {
    id: "gameplay-sorcery",
    label: "Sorcery Points",
    icon: { kind: "lucide", icon: Sparkles },
    total: getSorceryPointsTotalForCharacter,
    remaining: getSorceryPointsRemainingForCharacter,
    restoreOne: restoreSorceryPointForCharacter,
    spendOne: expendSorceryPointForCharacter,
    restoreAll: restoreAllSorceryPointsForCharacter
  },
  {
    id: "gameplay-divinity",
    label: "Channel Divinity",
    icon: { kind: "image", src: pyromancyIcon },
    total: getChannelDivinityUsesTotalForCharacter,
    remaining: getChannelDivinityUsesRemainingForCharacter,
    restoreOne: restoreChannelDivinityUseForCharacter,
    spendOne: expendChannelDivinityUseForCharacter,
    restoreAll: restoreAllChannelDivinityUsesForCharacter
  }
];

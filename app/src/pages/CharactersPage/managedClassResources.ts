import {
  consumeFighterSecondWindUse as consumeFighterSecondWindUseForCharacter,
  expendFighterBattleMasterSuperiorityDieForCharacter,
  expendFighterPsiWarriorEnergyDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  getFighterSecondWindUsesRemaining as getFighterSecondWindUsesRemainingForCharacter,
  getFighterSecondWindUsesTotal as getFighterSecondWindUsesTotalForCharacter,
  restoreAllFighterBattleMasterSuperiorityDiceForCharacter,
  restoreAllFighterPsiWarriorEnergyDiceForCharacter,
  restoreFighterBattleMasterSuperiorityDieForCharacter,
  restoreFighterPsiWarriorEnergyDieForCharacter,
  restoreFighterSecondWindOnLongRest as restoreFighterSecondWindOnLongRestForCharacter,
  restoreFighterSecondWindOnShortRest as restoreFighterSecondWindOnShortRestForCharacter
} from "./classFeatures/fighter/fighter";
import {
  expendBarbarianRageUse as expendBarbarianRageUseForCharacter,
  getBarbarianRageUsesRemaining as getBarbarianRageUsesRemainingForCharacter,
  getBarbarianRageUsesTotal as getBarbarianRageUsesTotalForCharacter,
  restoreAllBarbarianRageUses as restoreAllBarbarianRageUsesForCharacter,
  restoreBarbarianRageUse as restoreBarbarianRageUseForCharacter
} from "./classFeatures/barbarian/barbarian";
import {
  expendBardicInspirationUse as expendBardicInspirationUseForCharacter,
  getBardicInspirationUsesRemaining as getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotal as getBardicInspirationUsesTotalForCharacter,
  restoreAllBardicInspirationUses as restoreAllBardicInspirationUsesForCharacter,
  restoreBardicInspirationUse as restoreBardicInspirationUseForCharacter
} from "./classFeatures/bard/bard";
import {
  expendOneDruidWildShapeUse as expendDruidWildShapeUseForCharacter,
  getDruidWildShapeUsesRemaining as getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotal as getDruidWildShapeUsesTotalForCharacter,
  restoreAllDruidWildShapeUses as restoreAllDruidWildShapeUsesForCharacter,
  restoreOneDruidWildShapeUse as restoreDruidWildShapeUseForCharacter
} from "./classFeatures/druid/druid";
import {
  expendMonkFocusPoint as expendMonkFocusPointForCharacter,
  getMonkFocusPointsRemaining as getMonkFocusPointsRemainingForCharacter,
  getMonkFocusPointsTotal as getMonkFocusPointsTotalForCharacter,
  restoreAllMonkFocusPoints as restoreAllMonkFocusPointsForCharacter,
  restoreOneMonkFocusPoint as restoreMonkFocusPointForCharacter
} from "./classFeatures/monk/monk";
import {
  expendRogueSoulknifePsionicDie as expendRogueSoulknifePsionicDieForCharacter,
  getRogueSoulknifePsionicDiceRemaining as getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotal as getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDie as getRogueSoulknifePsionicDieForCharacter,
  restoreAllRogueSoulknifePsionicDice as restoreAllRogueSoulknifePsionicDiceForCharacter,
  restoreRogueSoulknifePsionicDie as restoreRogueSoulknifePsionicDieForCharacter
} from "./classFeatures/rogue/subclasses/rogueSoulknife";
import {
  expendOneSorceryPoint as expendSorceryPointForCharacter,
  getSorceryPointsRemaining as getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotal as getSorceryPointsTotalForCharacter,
  restoreAllSorceryPoints as restoreAllSorceryPointsForCharacter,
  restoreOneSorceryPoint as restoreSorceryPointForCharacter
} from "./classFeatures/sorcerer/sorcerer";
import { getChannelDivinityResource } from "./classFeatures/channelDivinityResource";
import {
  gainPhantomSoulTrinket,
  getPhantomSoulTrinketsMaximum,
  getPhantomSoulTrinketsRemaining,
  restoreAllPhantomSoulTrinkets,
  spendPhantomSoulTrinket
} from "./classFeatures/rogue/subclasses/roguePhantomTokens";

import type { CounterResourceTarget } from "./resourceManagement";

export const namedResources = {
  "soul-trinkets": {
    kind: "counter",
    id: "gameplay-soul-trinkets",
    label: "Soul Trinket",
    total: getPhantomSoulTrinketsMaximum,
    remaining: getPhantomSoulTrinketsRemaining,
    restoreOne: gainPhantomSoulTrinket,
    spendOne: spendPhantomSoulTrinket,
    restoreAll: restoreAllPhantomSoulTrinkets
  },
  rage: {
    kind: "counter",
    id: "gameplay-rage",
    label: "Rage",
    total: getBarbarianRageUsesTotalForCharacter,
    remaining: getBarbarianRageUsesRemainingForCharacter,
    restoreOne: restoreBarbarianRageUseForCharacter,
    spendOne: expendBarbarianRageUseForCharacter,
    restoreAll: restoreAllBarbarianRageUsesForCharacter
  },
  focus: {
    kind: "counter",
    id: "gameplay-focus",
    label: "Focus Points",
    total: getMonkFocusPointsTotalForCharacter,
    remaining: getMonkFocusPointsRemainingForCharacter,
    restoreOne: restoreMonkFocusPointForCharacter,
    spendOne: expendMonkFocusPointForCharacter,
    restoreAll: restoreAllMonkFocusPointsForCharacter
  },
  "second-wind": {
    kind: "counter",
    id: "gameplay-fighter-second-wind",
    label: "Second Wind",
    total: getFighterSecondWindUsesTotalForCharacter,
    remaining: getFighterSecondWindUsesRemainingForCharacter,
    restoreOne: restoreFighterSecondWindOnShortRestForCharacter,
    spendOne: consumeFighterSecondWindUseForCharacter,
    restoreAll: restoreFighterSecondWindOnLongRestForCharacter
  },
  "psi-energy": {
    kind: "counter",
    id: "gameplay-psi-energy",
    label: "Psi Energy Dice",
    total: getFighterPsiWarriorEnergyDiceTotalForCharacter,
    remaining: getFighterPsiWarriorEnergyDiceRemainingForCharacter,
    die: getFighterPsiWarriorEnergyDieForCharacter,
    restoreOne: restoreFighterPsiWarriorEnergyDieForCharacter,
    spendOne: expendFighterPsiWarriorEnergyDieForCharacter,
    restoreAll: restoreAllFighterPsiWarriorEnergyDiceForCharacter
  },
  "psionic-dice": {
    kind: "counter",
    id: "gameplay-soulknife-psionic-dice",
    label: "Psionic Dice",
    total: getRogueSoulknifePsionicDiceTotalForCharacter,
    remaining: getRogueSoulknifePsionicDiceRemainingForCharacter,
    die: getRogueSoulknifePsionicDieForCharacter,
    restoreOne: restoreRogueSoulknifePsionicDieForCharacter,
    spendOne: expendRogueSoulknifePsionicDieForCharacter,
    restoreAll: restoreAllRogueSoulknifePsionicDiceForCharacter
  },
  "superiority-dice": {
    kind: "counter",
    id: "gameplay-superiority-dice",
    label: "Superiority Dice",
    total: getFighterBattleMasterSuperiorityDiceTotalForCharacter,
    remaining: getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
    die: getFighterBattleMasterSuperiorityDieForCharacter,
    restoreOne: restoreFighterBattleMasterSuperiorityDieForCharacter,
    spendOne: expendFighterBattleMasterSuperiorityDieForCharacter,
    restoreAll: restoreAllFighterBattleMasterSuperiorityDiceForCharacter
  },
  "wild-shape": {
    kind: "counter",
    id: "gameplay-wild-shape",
    label: "Wild Shape",
    total: getDruidWildShapeUsesTotalForCharacter,
    remaining: getDruidWildShapeUsesRemainingForCharacter,
    restoreOne: restoreDruidWildShapeUseForCharacter,
    spendOne: expendDruidWildShapeUseForCharacter,
    restoreAll: restoreAllDruidWildShapeUsesForCharacter
  },
  "bardic-inspiration": {
    kind: "counter",
    id: "gameplay-bardic-inspiration",
    label: "Bardic Inspiration",
    total: getBardicInspirationUsesTotalForCharacter,
    remaining: getBardicInspirationUsesRemainingForCharacter,
    restoreOne: restoreBardicInspirationUseForCharacter,
    spendOne: expendBardicInspirationUseForCharacter,
    restoreAll: restoreAllBardicInspirationUsesForCharacter
  },
  sorcery: {
    kind: "counter",
    id: "gameplay-sorcery",
    label: "Sorcery Points",
    total: getSorceryPointsTotalForCharacter,
    remaining: getSorceryPointsRemainingForCharacter,
    restoreOne: restoreSorceryPointForCharacter,
    spendOne: expendSorceryPointForCharacter,
    restoreAll: restoreAllSorceryPointsForCharacter
  },
  divinity: {
    kind: "counter",
    id: "gameplay-divinity",
    label: "Channel Divinity",
    total: (character) => getChannelDivinityResource(character).total(character),
    remaining: (character) => getChannelDivinityResource(character).remaining(character),
    restoreOne: (character) => getChannelDivinityResource(character).restoreOne(character),
    spendOne: (character) => getChannelDivinityResource(character).spendOne(character),
    restoreAll: (character) => getChannelDivinityResource(character).restoreAll(character)
  }
} satisfies Record<string, CounterResourceTarget>;

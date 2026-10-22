import { classCounterResource, type CounterResourceTarget } from "../../../resourceManagement";
import { getUndeadThrallsUsesRemaining, hasUndeadThralls } from "./wizardNecromancerUndeadThralls";
import {
  getWondrousAlterationUsesRemaining,
  hasWondrousAlteration
} from "./wizardTransmuterWondrousAlteration";
import {
  getSplinteredSummonsUsesRemaining,
  hasSplinteredSummons
} from "./wizardConjurerSplinteredSummons";
import {
  getBenignTranspositionUsesRemaining,
  getBenignTranspositionUsesTotal
} from "./wizardConjurerBenignTransposition";
import {
  getSplitEnchantmentUsesRemaining,
  getSplitEnchantmentUsesTotal
} from "./wizardEnchanterSplitEnchantment";
import {
  getInstinctiveCharmUsesRemaining,
  hasInstinctiveCharm
} from "./wizardEnchanterInstinctiveCharm";
import {
  getHypnoticPresenceUsesRemaining,
  getHypnoticPresenceUsesTotal
} from "./wizardEnchanterHypnoticPresence";
import {
  getEmpoweredTransmutationUsesRemaining,
  getEmpoweredTransmutationUsesTotal
} from "./wizardTransmuterEmpoweredTransmutation";
import { getShapeShifterUsesRemaining, hasShapeShifter } from "./wizardTransmuterShapeShifter";
import { getWizardBladesongUsesRemaining, getWizardBladesongUsesTotal } from "./wizardBladesinger";
import {
  getWizardDivinerPortentRolls,
  getWizardDivinerPortentUsesRemaining,
  getWizardDivinerPortentUsesTotal,
  setWizardDivinerPortentRolls
} from "./wizardDivinerPortent";
import {
  getWizardIllusionistPhantasmalCreaturesUsesRemaining,
  getWizardIllusionistPhantasmalCreaturesUsesTotal
} from "./wizardIllusionist";

export const wizardSubclassResources = {
  undeadThrallsUsesExpended: classCounterResource(
    "wizard",
    "undeadThrallsUsesExpended",
    "Undead Thralls",
    (character) => Number(hasUndeadThralls(character)),
    getUndeadThrallsUsesRemaining
  ),
  wondrousAlterationUsesExpended: classCounterResource(
    "wizard",
    "wondrousAlterationUsesExpended",
    "Wondrous Alteration",
    (character) => Number(hasWondrousAlteration(character)),
    getWondrousAlterationUsesRemaining
  ),
  splinteredSummonsUsesExpended: classCounterResource(
    "wizard",
    "splinteredSummonsUsesExpended",
    "Splintered Summons",
    (character) => (hasSplinteredSummons(character) ? 1 : 0),
    getSplinteredSummonsUsesRemaining
  ),
  benignTranspositionUsesExpended: classCounterResource(
    "wizard",
    "benignTranspositionUsesExpended",
    "Benign Transposition",
    getBenignTranspositionUsesTotal,
    getBenignTranspositionUsesRemaining
  ),
  splitEnchantmentUsesExpended: classCounterResource(
    "wizard",
    "splitEnchantmentUsesExpended",
    "Split Enchantment",
    getSplitEnchantmentUsesTotal,
    getSplitEnchantmentUsesRemaining
  ),
  instinctiveCharmUsesExpended: classCounterResource(
    "wizard",
    "instinctiveCharmUsesExpended",
    "Instinctive Charm",
    (character) => (hasInstinctiveCharm(character) ? 1 : 0),
    getInstinctiveCharmUsesRemaining
  ),
  hypnoticPresenceUsesExpended: classCounterResource(
    "wizard",
    "hypnoticPresenceUsesExpended",
    "Hypnotic Presence",
    getHypnoticPresenceUsesTotal,
    getHypnoticPresenceUsesRemaining
  ),
  empoweredTransmutationUsesExpended: classCounterResource(
    "wizard",
    "empoweredTransmutationUsesExpended",
    "Empowered Transmutation",
    getEmpoweredTransmutationUsesTotal,
    getEmpoweredTransmutationUsesRemaining
  ),
  shapeShifterUsesExpended: classCounterResource(
    "wizard",
    "shapeShifterUsesExpended",
    "Shape-shifter",
    (character) => (hasShapeShifter(character) ? 1 : 0),
    getShapeShifterUsesRemaining
  ),
  portent: {
    kind: "counter",
    id: "wizard:portentRolls",
    label: "Portent",
    total: getWizardDivinerPortentUsesTotal,
    remaining: getWizardDivinerPortentUsesRemaining,
    spendOne: (character) => {
      const rolls = getWizardDivinerPortentRolls(character);
      const index = rolls.findIndex((roll) => !roll.used);
      return setWizardDivinerPortentRolls(
        character,
        rolls.map((roll, i) => (i === index ? { ...roll, used: true } : roll))
      );
    },
    restoreOne: (character) => {
      const rolls = getWizardDivinerPortentRolls(character);
      const index = rolls.findIndex((roll) => roll.used);
      return setWizardDivinerPortentRolls(
        character,
        rolls.map((roll, i) => (i === index ? { ...roll, used: false } : roll))
      );
    },
    restoreAll: (character) =>
      setWizardDivinerPortentRolls(
        character,
        getWizardDivinerPortentRolls(character).map((roll) => ({ ...roll, used: false }))
      )
  } satisfies CounterResourceTarget,
  bladesongUsesExpended: classCounterResource(
    "wizard",
    "bladesongUsesExpended",
    "Bladesong",
    getWizardBladesongUsesTotal,
    getWizardBladesongUsesRemaining
  ),
  phantasmalCreaturesUsesExpended: classCounterResource(
    "wizard",
    "phantasmalCreaturesUsesExpended",
    "Phantasmal Creatures",
    getWizardIllusionistPhantasmalCreaturesUsesTotal,
    getWizardIllusionistPhantasmalCreaturesUsesRemaining
  )
};

import { classCounterResource, type CounterResourceTarget } from "../../../resourceManagement";
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

import { classCounterResource } from "../../../resourceManagement";
import {
  getWarlockArchfeyPatronStepsOfTheFeyUsesRemaining,
  getWarlockArchfeyPatronStepsOfTheFeyUsesTotal
} from "./warlockArchfeyPatron";
import {
  getWarlockCelestialPatronHealingLightDiceRemaining,
  getWarlockCelestialPatronHealingLightDiceTotal
} from "./warlockCelestialPatron";
import {
  getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining,
  getWarlockFiendPatronDarkOnesOwnLuckUsesTotal,
  getWarlockFiendPatronHurlThroughHellUsesRemaining,
  getWarlockFiendPatronHurlThroughHellUsesTotal
} from "./warlockFiendPatron";
import { getSemblanceOfLifeUsesRemaining, hasSemblanceOfLife } from "./warlockSemblanceOfLife";
import { getFormOfDreadUsesRemaining, getFormOfDreadUsesTotal } from "./warlockUndeadPatron";
import { getVestigeRecoveryUsesRemaining, hasVestigeRecovery } from "./warlockVestigeRecovery";

export const warlockSubclassResources = {
  stepsOfTheFeyUsesExpended: classCounterResource(
    "warlock",
    "stepsOfTheFeyUsesExpended",
    "Steps of the Fey",
    getWarlockArchfeyPatronStepsOfTheFeyUsesTotal,
    getWarlockArchfeyPatronStepsOfTheFeyUsesRemaining
  ),
  healingLightDiceExpended: classCounterResource(
    "warlock",
    "healingLightDiceExpended",
    "Healing Light",
    getWarlockCelestialPatronHealingLightDiceTotal,
    getWarlockCelestialPatronHealingLightDiceRemaining
  ),
  darkOnesOwnLuckUsesExpended: classCounterResource(
    "warlock",
    "darkOnesOwnLuckUsesExpended",
    "Dark One's Own Luck",
    getWarlockFiendPatronDarkOnesOwnLuckUsesTotal,
    getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining
  ),
  hurlThroughHellUsesExpended: classCounterResource(
    "warlock",
    "hurlThroughHellUsesExpended",
    "Hurl Through Hell",
    getWarlockFiendPatronHurlThroughHellUsesTotal,
    getWarlockFiendPatronHurlThroughHellUsesRemaining
  ),
  formOfDreadUsesExpended: classCounterResource(
    "warlock",
    "formOfDreadUsesExpended",
    "Form of Dread",
    getFormOfDreadUsesTotal,
    getFormOfDreadUsesRemaining
  ),
  vestigeRecoveryUsesExpended: classCounterResource(
    "warlock",
    "vestigeRecoveryUsesExpended",
    "Vestige Recovery",
    (character) => Number(hasVestigeRecovery(character)),
    getVestigeRecoveryUsesRemaining
  ),
  semblanceOfLifeUsesExpended: classCounterResource(
    "warlock",
    "semblanceOfLifeUsesExpended",
    "Semblance of Life",
    (character) => Number(hasSemblanceOfLife(character)),
    getSemblanceOfLifeUsesRemaining
  )
};

import { classCounterResource } from "../../../resourceManagement";
import { getArcaneShotUsage } from "./fighterArcaneShot";
import {
  getFighterBattleMasterKnowYourEnemyUsesRemaining,
  getFighterBattleMasterKnowYourEnemyUsesTotal
} from "./fighterBattleMaster";
import {
  getMagicalAmmunitionUsesRemaining,
  hasMagicalAmmunition
} from "./fighterMagicalAmmunition";
import {
  getFighterPsiWarriorBulwarkOfForceUsesRemaining,
  getFighterPsiWarriorBulwarkOfForceUsesTotal,
  getFighterPsiWarriorPsiPoweredLeapUsesRemaining,
  getFighterPsiWarriorPsiPoweredLeapUsesTotal,
  getFighterPsiWarriorTelekineticMasterUsesRemaining,
  getFighterPsiWarriorTelekineticMasterUsesTotal,
  getFighterPsiWarriorTelekineticMovementUsesRemaining,
  getFighterPsiWarriorTelekineticMovementUsesTotal
} from "./fighterPsiWarrior";

export const fighterSubclassResources = {
  arcaneShotUsesExpended: classCounterResource(
    "fighter",
    "arcaneShotUsesExpended",
    "Arcane Shot",
    (character) => getArcaneShotUsage(character).usesTotal,
    (character) => getArcaneShotUsage(character).usesRemaining
  ),
  magicalAmmunitionUsesExpended: classCounterResource(
    "fighter",
    "magicalAmmunitionUsesExpended",
    "Magical Ammunition",
    (character) => Number(hasMagicalAmmunition(character)),
    getMagicalAmmunitionUsesRemaining
  ),
  battleMasterKnowYourEnemyUsesExpended: classCounterResource(
    "fighter",
    "battleMasterKnowYourEnemyUsesExpended",
    "Battle Master Know Your Enemy",
    getFighterBattleMasterKnowYourEnemyUsesTotal,
    getFighterBattleMasterKnowYourEnemyUsesRemaining
  ),
  psiWarriorPsiPoweredLeapUsesExpended: classCounterResource(
    "fighter",
    "psiWarriorPsiPoweredLeapUsesExpended",
    "Psi Warrior Psi Powered Leap",
    getFighterPsiWarriorPsiPoweredLeapUsesTotal,
    getFighterPsiWarriorPsiPoweredLeapUsesRemaining
  ),
  psiWarriorTelekineticMovementUsesExpended: classCounterResource(
    "fighter",
    "psiWarriorTelekineticMovementUsesExpended",
    "Psi Warrior Telekinetic Movement",
    getFighterPsiWarriorTelekineticMovementUsesTotal,
    getFighterPsiWarriorTelekineticMovementUsesRemaining
  ),
  psiWarriorBulwarkOfForceUsesExpended: classCounterResource(
    "fighter",
    "psiWarriorBulwarkOfForceUsesExpended",
    "Psi Warrior Bulwark of Force",
    getFighterPsiWarriorBulwarkOfForceUsesTotal,
    getFighterPsiWarriorBulwarkOfForceUsesRemaining
  ),
  psiWarriorTelekineticMasterUsesExpended: classCounterResource(
    "fighter",
    "psiWarriorTelekineticMasterUsesExpended",
    "Psi Warrior Telekinetic Master",
    getFighterPsiWarriorTelekineticMasterUsesTotal,
    getFighterPsiWarriorTelekineticMasterUsesRemaining
  )
};

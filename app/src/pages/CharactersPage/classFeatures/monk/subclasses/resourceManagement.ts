import { classCounterResource } from "../../../resourceManagement";
import {
  getMonkWarriorOfMercyHandOfUltimateMercyUsesRemaining,
  getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal
} from "./monkWarriorOfMercy";
import {
  getMonkWarriorOfTheOpenHandWholenessOfBodyUsesRemaining,
  getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal
} from "./monkWarriorOfTheOpenHand";

export const monkSubclassResources = {
  warriorOfMercyHandOfUltimateMercyUsesExpended: classCounterResource(
    "monk",
    "warriorOfMercyHandOfUltimateMercyUsesExpended",
    "Hand of Ultimate Justice",
    getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal,
    getMonkWarriorOfMercyHandOfUltimateMercyUsesRemaining
  ),
  warriorOfTheOpenHandWholenessOfBodyUsesExpended: classCounterResource(
    "monk",
    "warriorOfTheOpenHandWholenessOfBodyUsesExpended",
    "Warrior of the Open Hand Wholeness of Body",
    getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal,
    getMonkWarriorOfTheOpenHandWholenessOfBodyUsesRemaining
  )
};

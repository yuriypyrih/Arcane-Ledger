import { classCounterResource } from "../../../resourceManagement";
import {
  getBarbarianIntimidatingPresenceUsesRemaining,
  getBarbarianWarriorOfTheGodsUsesRemaining,
  getBarbarianZealousPresenceUsesRemaining
} from "../barbarian";
import { getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesTotal } from "./barbarianPathOfTheBerserker";
import {
  getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal,
  getBarbarianPathOfTheZealotZealousPresenceUsesTotal
} from "./barbarianPathOfTheZealot";

export const barbarianSubclassResources = {
  intimidatingPresenceUsesExpended: classCounterResource(
    "rage",
    "intimidatingPresenceUsesExpended",
    "Intimidating Presence",
    getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesTotal,
    getBarbarianIntimidatingPresenceUsesRemaining
  ),
  warriorOfTheGodsUsesExpended: classCounterResource(
    "rage",
    "warriorOfTheGodsUsesExpended",
    "Warrior of the Gods",
    getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal,
    getBarbarianWarriorOfTheGodsUsesRemaining
  ),
  zealousPresenceUsesExpended: classCounterResource(
    "rage",
    "zealousPresenceUsesExpended",
    "Zealous Presence",
    getBarbarianPathOfTheZealotZealousPresenceUsesTotal,
    getBarbarianZealousPresenceUsesRemaining
  )
};

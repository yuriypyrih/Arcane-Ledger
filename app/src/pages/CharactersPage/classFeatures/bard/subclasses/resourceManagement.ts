import { classCounterResource } from "../../../resourceManagement";
import {
  getBardCollegeOfGlamourBeguilingMagicUsesRemaining,
  getBardCollegeOfGlamourBeguilingMagicUsesTotal,
  getBardCollegeOfGlamourMantleOfMajestyUsesRemaining,
  getBardCollegeOfGlamourMantleOfMajestyUsesTotal,
  getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining,
  getBardCollegeOfGlamourUnbreakableMajestyUsesTotal
} from "./bardCollegeOfGlamour";
import {
  getBardCollegeOfTheMoonBlessingOfMoonlightUsesRemaining,
  getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal
} from "./bardCollegeOfTheMoon";

export const bardSubclassResources = {
  beguilingMagicUsesExpended: classCounterResource(
    "bard",
    "beguilingMagicUsesExpended",
    "Beguiling Magic",
    getBardCollegeOfGlamourBeguilingMagicUsesTotal,
    getBardCollegeOfGlamourBeguilingMagicUsesRemaining
  ),
  mantleOfMajestyUsesExpended: classCounterResource(
    "bard",
    "mantleOfMajestyUsesExpended",
    "Mantle of Majesty",
    getBardCollegeOfGlamourMantleOfMajestyUsesTotal,
    getBardCollegeOfGlamourMantleOfMajestyUsesRemaining
  ),
  unbreakableMajestyUsesExpended: classCounterResource(
    "bard",
    "unbreakableMajestyUsesExpended",
    "Unbreakable Majesty",
    getBardCollegeOfGlamourUnbreakableMajestyUsesTotal,
    getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining
  ),
  blessingOfMoonlightUsesExpended: classCounterResource(
    "bard",
    "blessingOfMoonlightUsesExpended",
    "Blessing of Moonlight",
    getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal,
    getBardCollegeOfTheMoonBlessingOfMoonlightUsesRemaining
  )
};

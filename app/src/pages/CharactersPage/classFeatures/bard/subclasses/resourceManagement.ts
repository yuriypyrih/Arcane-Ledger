import { classCounterResource } from "../../../resourceManagement";
import { getSpiritualManifestationRemaining } from "./bardCollegeOfSpiritsEmpowered";
import { hasBardSpirits } from "./bardCollegeOfSpiritsState";
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
  spiritualManifestationUsesExpended: classCounterResource(
    "bard",
    "spiritualManifestationUsesExpended",
    "Spiritual Manifestation: Free cast",
    (character) => Number(hasBardSpirits(character, 6)),
    (character) => getSpiritualManifestationRemaining(character)
  ),
  spiritualManifestationCoverUsesExpended: classCounterResource(
    "bard",
    "spiritualManifestationCoverUsesExpended",
    "Spiritual Manifestation: Half Cover",
    (character) => Number(hasBardSpirits(character, 6)),
    (character) => getSpiritualManifestationRemaining(character, true)
  ),
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

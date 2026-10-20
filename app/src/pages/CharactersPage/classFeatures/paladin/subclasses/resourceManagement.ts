import { classCounterResource } from "../../../resourceManagement";
import {
  getPaladinOathOfDevotionHolyNimbusUsesRemaining,
  getPaladinOathOfDevotionHolyNimbusUsesTotal
} from "./paladinOathOfDevotion";
import {
  getPaladinOathOfGloryLivingLegendUsesRemaining,
  getPaladinOathOfGloryLivingLegendUsesTotal
} from "./paladinOathOfGlory";
import {
  getPaladinOathOfTheAncientsElderChampionUsesRemaining,
  getPaladinOathOfTheAncientsElderChampionUsesTotal
} from "./paladinOathOfTheAncients";
import {
  getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining,
  getPaladinOathOfTheNobleGeniesNobleScionUsesTotal
} from "./paladinOathOfTheNobleGenies";
import {
  getPaladinOathOfVengeanceAvengingAngelUsesRemaining,
  getPaladinOathOfVengeanceAvengingAngelUsesTotal
} from "./paladinOathOfVengeance";

export const paladinSubclassResources = {
  holyNimbusUsesExpended: classCounterResource(
    "paladin",
    "holyNimbusUsesExpended",
    "Holy Nimbus",
    getPaladinOathOfDevotionHolyNimbusUsesTotal,
    getPaladinOathOfDevotionHolyNimbusUsesRemaining
  ),
  livingLegendUsesExpended: classCounterResource(
    "paladin",
    "livingLegendUsesExpended",
    "Living Legend",
    getPaladinOathOfGloryLivingLegendUsesTotal,
    getPaladinOathOfGloryLivingLegendUsesRemaining
  ),
  elderChampionUsesExpended: classCounterResource(
    "paladin",
    "elderChampionUsesExpended",
    "Elder Champion",
    getPaladinOathOfTheAncientsElderChampionUsesTotal,
    getPaladinOathOfTheAncientsElderChampionUsesRemaining
  ),
  nobleScionUsesExpended: classCounterResource(
    "paladin",
    "nobleScionUsesExpended",
    "Noble Scion",
    getPaladinOathOfTheNobleGeniesNobleScionUsesTotal,
    getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining
  ),
  avengingAngelUsesExpended: classCounterResource(
    "paladin",
    "avengingAngelUsesExpended",
    "Avenging Angel",
    getPaladinOathOfVengeanceAvengingAngelUsesTotal,
    getPaladinOathOfVengeanceAvengingAngelUsesRemaining
  )
};

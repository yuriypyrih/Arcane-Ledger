import { classCounterResource } from "../../../resourceManagement";
import { getKeeperOfSoulsRemaining, hasGraveDomain } from "./clericGraveDomain";
import {
  getDivineForeknowledgeUsesRemaining,
  getDivineForeknowledgeUsesTotal
} from "./clericKnowledgeDomain";
import {
  getClericLightDomainCoronaOfLightUsesRemaining,
  getClericLightDomainCoronaOfLightUsesTotal
} from "./clericLightDomain";
import { getClericWarPriestUsesRemaining, getClericWarPriestUsesTotal } from "./clericWarDomain";

export const clericSubclassResources = {
  divineForeknowledgeUsesExpended: classCounterResource(
    "cleric",
    "divineForeknowledgeUsesExpended",
    "Divine Foreknowledge",
    getDivineForeknowledgeUsesTotal,
    getDivineForeknowledgeUsesRemaining
  ),
  coronaOfLightUsesExpended: classCounterResource(
    "cleric",
    "coronaOfLightUsesExpended",
    "Corona of Light",
    getClericLightDomainCoronaOfLightUsesTotal,
    getClericLightDomainCoronaOfLightUsesRemaining
  ),
  warPriestUsesExpended: classCounterResource(
    "cleric",
    "warPriestUsesExpended",
    "War Priest",
    getClericWarPriestUsesTotal,
    getClericWarPriestUsesRemaining
  ),
  keeperOfSoulsUsesExpended: classCounterResource(
    "cleric",
    "keeperOfSoulsUsesExpended",
    "Keeper of Souls",
    (character) => Number(hasGraveDomain(character, 17)),
    getKeeperOfSoulsRemaining
  )
};

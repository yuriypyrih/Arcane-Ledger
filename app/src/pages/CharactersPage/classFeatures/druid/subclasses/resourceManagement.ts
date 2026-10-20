import { classCounterResource } from "../../../resourceManagement";
import {
  getDruidNaturalRecoveryUsesRemaining,
  getDruidNaturalRecoveryUsesTotal
} from "./druidCircleOfTheLand";
import {
  getDruidMoonlightStepUsesRemaining,
  getDruidMoonlightStepUsesTotal
} from "./druidCircleOfTheMoon";
import {
  getDruidStarMapGuidingBoltUsesRemaining,
  getDruidStarMapGuidingBoltUsesTotal
} from "./druidCircleOfTheStars";

export const druidSubclassResources = {
  naturalRecoveryUsesExpended: classCounterResource(
    "druid",
    "naturalRecoveryUsesExpended",
    "Natural Recovery",
    getDruidNaturalRecoveryUsesTotal,
    getDruidNaturalRecoveryUsesRemaining
  ),
  moonlightStepUsesExpended: classCounterResource(
    "druid",
    "moonlightStepUsesExpended",
    "Moonlight Step",
    getDruidMoonlightStepUsesTotal,
    getDruidMoonlightStepUsesRemaining
  ),
  starMapGuidingBoltUsesExpended: classCounterResource(
    "druid",
    "starMapGuidingBoltUsesExpended",
    "Star Map Guiding Bolt",
    getDruidStarMapGuidingBoltUsesTotal,
    getDruidStarMapGuidingBoltUsesRemaining
  )
};

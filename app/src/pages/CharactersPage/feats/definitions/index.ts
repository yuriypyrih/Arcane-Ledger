import { epicBoonFeatDefinitions } from "./epicBoon";
import { fightingStyleFeatDefinitions } from "./fightingStyle";
import {
  frhofEpicBoonFeatDefinitions,
  frhofGeneralFeatDefinitions,
  frhofOriginFeatDefinitions
} from "./frhof";
import { generalFeatDefinitions } from "./general";
import { originFeatDefinitions } from "./origin";
import type { FeatDefinition } from "../types";

export const featDefinitions: FeatDefinition[] = [
  ...originFeatDefinitions,
  ...frhofOriginFeatDefinitions,
  ...generalFeatDefinitions,
  ...frhofGeneralFeatDefinitions,
  ...fightingStyleFeatDefinitions,
  ...epicBoonFeatDefinitions,
  ...frhofEpicBoonFeatDefinitions
];

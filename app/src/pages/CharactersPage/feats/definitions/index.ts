import { epicBoonFeatDefinitions } from "./epicBoon";
import { auFeatDefinitions } from "./au";
import { fightingStyleFeatDefinitions } from "./fightingStyle";
import {
  frhofEpicBoonFeatDefinitions,
  frhofGeneralFeatDefinitions,
  frhofOriginFeatDefinitions
} from "./frhof";
import { generalFeatDefinitions } from "./general";
import { originFeatDefinitions } from "./origin";
import { rhwFeatDefinitions } from "./rhw";
import type { FeatDefinition } from "../types";

export const featDefinitions: FeatDefinition[] = [
  ...originFeatDefinitions,
  ...frhofOriginFeatDefinitions,
  ...generalFeatDefinitions,
  ...frhofGeneralFeatDefinitions,
  ...fightingStyleFeatDefinitions,
  ...epicBoonFeatDefinitions,
  ...frhofEpicBoonFeatDefinitions,
  ...auFeatDefinitions,
  ...rhwFeatDefinitions
];

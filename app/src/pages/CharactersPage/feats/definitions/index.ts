import { epicBoonFeatDefinitions } from "./epicBoon";
import { fightingStyleFeatDefinitions } from "./fightingStyle";
import { generalFeatDefinitions } from "./general";
import { originFeatDefinitions } from "./origin";
import type { FeatDefinition } from "../types";

export const featDefinitions: FeatDefinition[] = [
  ...originFeatDefinitions,
  ...generalFeatDefinitions,
  ...fightingStyleFeatDefinitions,
  ...epicBoonFeatDefinitions
];

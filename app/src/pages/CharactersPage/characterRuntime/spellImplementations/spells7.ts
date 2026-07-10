import { compileSpellImplementationContributions } from "./contributions";
import { crownOfStarsSpellImplementationSpec } from "./crownOfStars";
import { draconicTransformationSpellImplementationSpec } from "./draconicTransformation";

export const spellImplementations7 = compileSpellImplementationContributions([
  crownOfStarsSpellImplementationSpec,
  draconicTransformationSpellImplementationSpec
]);

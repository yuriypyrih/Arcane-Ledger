import { compileSpellImplementationContributions } from "./contributions";
import { elminstersEffulgentSpheresSpellImplementationSpec } from "./elminstersEffulgentSpheres";
import { investitureSpellImplementationSpecs } from "./investitures";
import { tensersTransformationSpellImplementationSpec } from "./tensersTransformation";
import { tashasOtherworldlyGuiseSpellImplementationSpec } from "./tashasOtherworldlyGuise";

export const spellImplementations6 = compileSpellImplementationContributions([
  elminstersEffulgentSpheresSpellImplementationSpec,
  ...investitureSpellImplementationSpecs,
  tensersTransformationSpellImplementationSpec,
  tashasOtherworldlyGuiseSpellImplementationSpec
]);

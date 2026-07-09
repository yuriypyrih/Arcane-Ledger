import { compileSpellImplementationContributions } from "./contributions";
import { tensersTransformationSpellImplementationSpec } from "./tensersTransformation";
import { tashasOtherworldlyGuiseSpellImplementationSpec } from "./tashasOtherworldlyGuise";

export const spellImplementations6 = compileSpellImplementationContributions([
  tensersTransformationSpellImplementationSpec,
  tashasOtherworldlyGuiseSpellImplementationSpec
]);

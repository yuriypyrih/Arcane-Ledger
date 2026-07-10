import { compileSpellImplementationContributions } from "./contributions";
import { fountOfMoonlightSpellImplementationSpec } from "./fountOfMoonlight";
import { guardianOfNatureSpellImplementationSpec } from "./guardianOfNature";

export const spellImplementations4 = compileSpellImplementationContributions([
  fountOfMoonlightSpellImplementationSpec,
  guardianOfNatureSpellImplementationSpec
]);

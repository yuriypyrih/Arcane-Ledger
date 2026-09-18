import { FEATS, SPELL_LIST_CLASS } from "../../src/codex/entries/enums";
import type { CharacterFeatEntry } from "../../src/types";

export function skillExpertFeat(): CharacterFeatEntry {
  return {
    id: "skill-expert",
    feat: FEATS.SKILL_EXPERT,
    takenAtLevel: 4,
    source: { type: "manual" },
    skillExpert: { ability: "INT", skillProficiency: "Arcana", skillExpertise: "Arcana" }
  };
}
export function magicInitiateFeat(): CharacterFeatEntry {
  return {
    id: "magic-initiate",
    feat: FEATS.MAGIC_INITIATE,
    takenAtLevel: 1,
    source: { type: "manual" },
    magicInitiate: {
      spellList: SPELL_LIST_CLASS.WIZARD,
      cantripIds: ["spell-fire-bolt", "spell-mage-hand"],
      levelOneSpellId: "spell-shield",
      spellcastingAbility: "INT"
    }
  };
}

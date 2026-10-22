import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { alterMemoriesSpellIds } from "../../../../../codex/subclasses/wizardAlterMemories";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export function transformAlterMemoriesSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!alterMemoriesSpellIds.has(spell.id)) return spell;
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.ALTER_MEMORIES
  );
  return feature
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.ALTER_MEMORIES,
        feature.description
      )
    : spell;
}

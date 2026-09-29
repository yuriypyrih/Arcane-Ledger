import type { SpellSourceMetadata } from "../entries/types";

export const legacySpellSource: SpellSourceMetadata = {
  documentKey: "legacy-local",
  documentName: "Legacy / Expanded Local",
  ruleset: "legacy-local"
};

export function srdSpellSource(open5eKey: string): SpellSourceMetadata {
  return {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey,
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  };
}

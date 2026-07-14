import type { SpellDescriptionEntry } from "../../codex/entries";

export type PatchNote = {
  version: `v${number}.${number}.${number}`;
  title: string;
  date: string;
  description: SpellDescriptionEntry[];
};

export const patchNotes: PatchNote[] = [
  {
    version: "v1.0.1",
    title: "The Adventure Begins",
    date: "2026-07-14",
    description: [
      "Welcome to the first Arcane Ledger patch notes. This release brings together the tools adventurers and GMs need to build characters, explore the available material, and run campaigns.",
      "<strong>Overview</strong>",
      {
        type: "list",
        style: "bullet",
        items: [
          "13 classes (including Artificer), each with 4–5 subclasses",
          "More than 2,700 items and 3,200 monsters",
          "About 600 spells (with the ability to add custom ones if needed)",
          "A broad collection of 37 backgrounds, 20 species, and 100+ feats"
        ]
      },
      "<strong>Built for Player and Game Master</strong>",
      {
        type: "list",
        style: "bullet",
        items: [
          "Character creation and full character sheets support",
          "A searchable compendium for quickly finding game content",
          "Campaign management, Initiative Tracker and other GM tools",
          "User accounts with character syncing across devices",
          "Custom content, combat tools, companions, dice rolling, and much more"
        ]
      },
      "This is only a small overview of what Arcane Ledger already supports and the ledger will keep growing."
    ]
  }
];

export const latestPatchNote = patchNotes[0]!;

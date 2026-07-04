import { BODY_SIZE, SPECIES_TYPES, TRACKER } from "./enums";
import { createSpeciesEntry } from "./speciesEntryFactory";
import type { SpeciesEntry } from "./types";

export const mpmmSpeciesEntries: SpeciesEntry[] = [
  createSpeciesEntry({
    id: "species-genasi-mpmm",
    name: "Genasi",
    source: "MPMM",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    size: [BODY_SIZE.SMALL, BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM,
      recommendedGenasiLineage: "water",
      recommendedGenasiSpellcastingAbility: "CHA"
    },
    summary: "",
    rulesDescription: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Genasi Lineage.</strong> Choose Water, Fire, Earth, or Air when you select this species. Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with your lineage traits (choose the ability when you select this species).",
      "<strong>Water Genasi.</strong> You have a Swim Speed equal to your walking Speed, Resistance to Acid damage, and you can breathe air and water. You know the Acid Splash cantrip. Starting at character level 3, you can cast Create or Destroy Water with this trait. Starting at character level 5, you can cast Water Walk with this trait without requiring a material component. Once you cast Create or Destroy Water or Water Walk with this trait, you can't cast that spell with it again until you finish a Long Rest. You can also cast either spell using any spell slots you have of the appropriate level.",
      "<strong>Fire Genasi.</strong> You have Resistance to Fire damage. You know the Produce Flame cantrip. Starting at character level 3, you can cast Burning Hands with this trait. Starting at character level 5, you can cast Flame Blade with this trait without requiring a material component. Once you cast Burning Hands or Flame Blade with this trait, you can't cast that spell with it again until you finish a Long Rest. You can also cast either spell using any spell slots you have of the appropriate level.",
      "<strong>Earth Genasi.</strong> You can move across difficult terrain without expending extra movement if you are using your walking Speed on the ground or a floor. You know the Blade Ward cantrip. You can cast it as normal, and you can also cast it as a Bonus Action a number of times equal to your Proficiency Bonus, regaining all expended uses when you finish a Long Rest. Starting at character level 5, you can cast Pass without Trace with this trait without requiring a material component. Once you cast Pass without Trace with this trait, you can't do so again until you finish a Long Rest. You can also cast it using any spell slots you have of 2nd level or higher.",
      "<strong>Air Genasi.</strong> Your walking Speed is 35 feet. You can hold your breath indefinitely while you're not Incapacitated, and you have Resistance to Lightning damage. You know the Shocking Grasp cantrip. Starting at character level 3, you can cast Feather Fall with this trait without requiring a material component. Starting at character level 5, you can cast Levitate with this trait without requiring a material component. Once you cast Feather Fall or Levitate with this trait, you can't cast that spell with it again until you finish a Long Rest. You can also cast either spell using any spell slots you have of the appropriate level."
    ]
  })
];

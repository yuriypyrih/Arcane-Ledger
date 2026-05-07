import { BODY_SIZE, ENTRY_CATEGORIES, SPECIES_TYPES, TRACKER } from "./enums";
import type { SpeciesEntry } from "./types";

function createSpeciesEntry(
  entry: Pick<
    SpeciesEntry,
    | "id"
    | "name"
    | "speed"
    | "size"
    | "trackingState"
    | "starterPack"
    | "tags"
    | "summary"
    | "description"
  >
): SpeciesEntry {
  return {
    ...entry,
    category: ENTRY_CATEGORIES.SPECIES,
    abilityBonuses: {},
    innateProficiencies: [],
    grantedSkillProficiencies: [],
    grantedToolProficiencies: []
  };
}

export const speciesEntries: SpeciesEntry[] = [
  createSpeciesEntry({
    id: "species-aasimar-2024",
    name: "Aasimar",
    tags: [SPECIES_TYPES.HUMANOID],
    speed: 30,
    size: [BODY_SIZE.SMALL, BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Celestial Resistance.</strong> You have Resistance to Necrotic damage and Radiant damage.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Healing Hands.</strong> As a Magic action, you touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains a number of Hit Points equal to the total rolled. Once you use this trait, you can't use it again until you finish a Long Rest.",
      "<strong>Light Bearer.</strong> You know the Light cantrip. Charisma is your spellcasting ability for it.",
      "<strong>Celestial Revelation.</strong> When you reach character level 3, you can transform as a Bonus Action using one of the options below (choose the option each time you transform). The transformation lasts for 1 minute or until you end it (no action required). Once you transform, you can't do so again until you finish a Long Rest.",
      "Once on each of your turns before the transformation ends, you can deal extra damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your Proficiency Bonus, and the extra damage's type is either Necrotic for Necrotic Shroud or Radiant for Heavenly Wings and Inner Radiance.",
      "Here are the transformation options:",
      "<strong>Heavenly Wings.</strong> Two spectral wings sprout from your back temporarily. Until the transformation ends, you have a Fly Speed equal to your Speed.",
      "<strong>Inner Radiance.</strong> Searing light temporarily radiates from your eyes and mouth. For the duration, you shed Bright Light in a 10-foot radius and Dim Light for an additional 10 feet, and at the end of each of your turns, each creature within 10 feet of you takes Radiant damage equal to your Proficiency Bonus.",
      "<strong>Necrotic Shroud.</strong> Your eyes briefly become pools of darkness, and flightless wings sprout from your back temporarily. Creatures other than your allies within 10 feet of you must succeed on a Charisma saving throw (DC 8 plus your Charisma modifier and Proficiency Bonus) or have the Frightened condition until the end of your next turn."
    ]
  }),
  createSpeciesEntry({
    id: "species-dragonborn-2024",
    name: "Dragonborn",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.DRACONIC_LINEAGE],
    speed: 30,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM,
      recommendedDraconicAncestry: "black"
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 5-7 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Draconic Ancestry.</strong> Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits as well as your appearance.",
      "<strong>Draconic Ancestors.</strong> Black: Acid; Blue: Lightning; Brass: Fire; Bronze: Lightning; Copper: Acid; Gold: Fire; Green: Poison; Red: Fire; Silver: Cold; White: Cold.",
      "<strong>Breath Weapon.</strong> When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide (choose the shape each time). Each creature in that area must make a Dexterity saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus). On a failed save, a creature takes 1d10 damage of the type determined by your Draconic Ancestry trait. On a successful save, a creature takes half as much damage. This damage increases by 1d10 when you reach character levels 5 (2d10), 11 (3d10), and 17 (4d10).",
      "You can use this Breath Weapon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "<strong>Damage Resistance.</strong> You have Resistance to the damage type determined by your Draconic Ancestry trait.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Draconic Flight.</strong> When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings on your back that last for 10 minutes or until you retract the wings (no action required) or have the Incapacitated condition. During that time, you have a Fly Speed equal to your Speed. Your wings appear to be made of the same energy as your Breath Weapon. Once you use this trait, you can't use it again until you finish a Long Rest."
    ]
  }),
  createSpeciesEntry({
    id: "species-dwarf-2024",
    name: "Dwarf",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.HARDY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.SEMI_TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-5 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 120 feet.",
      "<strong>Dwarven Resilience.</strong> You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.",
      "<strong>Dwarven Toughness.</strong> Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.",
      "<strong>Stonecunning.</strong> As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked.",
      "You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
    ]
  }),
  createSpeciesEntry({
    id: "species-elf-2024",
    name: "Elf",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.FEY_ANCESTRY, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 5-6 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Elven Lineage.</strong> You are part of a lineage that grants you supernatural abilities. Choose a lineage from the Elven Lineages table. You gain the level 1 benefit of that lineage.",
      "When you reach character levels 3 and 5, you learn a higher-level spell, as shown on the table. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level.",
      "Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the lineage).",
      "<strong>Elven Lineages.</strong> Drow: Level 1 - The range of your Darkvision increases to 120 feet. You also know the Dancing Lights cantrip; Level 3 - Faerie Fire; Level 5 - Darkness. High Elf: Level 1 - You know the Prestidigitation cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Wizard spell list; Level 3 - Detect Magic; Level 5 - Misty Step. Wood Elf: Level 1 - Your Speed increases to 35 feet. You also know the Druidcraft cantrip; Level 3 - Longstrider; Level 5 - Pass without Trace.",
      "<strong>Fey Ancestry.</strong> You have Advantage on saving throws you make to avoid or end the Charmed condition.",
      "<strong>Keen Senses.</strong> You have proficiency in the Insight, Perception, or Survival skill.",
      "<strong>Trance.</strong> You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness."
    ]
  }),
  createSpeciesEntry({
    id: "species-gnome-2024",
    name: "Gnome",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    size: [BODY_SIZE.SMALL],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.SMALL
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Small (about 3-4 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Gnomish Cunning.</strong> You have Advantage on Intelligence, Wisdom, and Charisma saving throws.",
      "<strong>Gnomish Lineage.</strong> You are part of a lineage that grants you supernatural abilities. Choose one of the following options; whichever one you choose, Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the lineage):",
      "<strong>Forest Gnome.</strong> You know the Minor Illusion cantrip. You also always have the Speak with Animals spell prepared. You can cast it without a spell slot a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest. You can also use any spell slots you have to cast the spell.",
      "<strong>Rock Gnome.</strong> You know the Mending and Prestidigitation cantrips. In addition, you can spend 10 minutes casting Prestidigitation to create a Tiny clockwork device (AC 5, 1 HP), such as a toy, fire starter, or music box. When you create the device, you determine its function by choosing one effect from Prestidigitation; the device produces that effect whenever you or another creature takes a Bonus Action to activate it with a touch. If the chosen effect has options within it, you choose one of those options for the device when you create it. For example, if you choose the spell's ignite-extinguish effect, you determine whether the device ignites or extinguishes fire; the device doesn't do both. You can have three such devices in existence at a time, and each falls apart 8 hours after its creation or when you dismantle it with a touch as a Utilize action."
    ]
  }),
  createSpeciesEntry({
    id: "species-goliath-2024",
    name: "Goliath",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.HARDY],
    speed: 35,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM,
      recommendedGiantAncestry: "cloud"
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 7-8 feet tall).",
      "<strong>Speed.</strong> 35 feet.",
      "<strong>Giant Ancestry.</strong> You are descended from Giants. Choose one of the following benefits, a supernatural boon from your ancestry; you can use the chosen benefit a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest:",
      "<strong>Cloud's Jaunt (Cloud Giant).</strong> As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see.",
      "<strong>Fire's Burn (Fire Giant).</strong> When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target.",
      "<strong>Frost's Chill (Frost Giant).</strong> When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn.",
      "<strong>Hill's Tumble (Hill Giant).</strong> When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition.",
      "<strong>Stone's Endurance (Stone Giant).</strong> When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total.",
      "<strong>Storm's Thunder (Storm Giant).</strong> When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature.",
      "<strong>Large Form.</strong> Starting at character level 5, you can change your size to Large as a Bonus Action if you're in a big enough space. This transformation lasts for 10 minutes or until you end it (no action required). For that duration, you have Advantage on Strength checks, and your Speed increases by 10 feet. Once you use this trait, you can't use it again until you finish a Long Rest.",
      "<strong>Powerful Build.</strong> You have Advantage on any ability check you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity."
    ]
  }),
  createSpeciesEntry({
    id: "species-halfling-2024",
    name: "Halfling",
    tags: [SPECIES_TYPES.HUMANOID],
    speed: 30,
    size: [BODY_SIZE.SMALL],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.SMALL
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Small (about 2-3 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Brave.</strong> You have Advantage on saving throws you make to avoid or end the Frightened condition.",
      "<strong>Halfling Nimbleness.</strong> You can move through the space of any creature that is a size larger than you, but you can't stop in the same space.",
      "<strong>Luck.</strong> When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.",
      "<strong>Naturally Stealthy.</strong> You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you."
    ]
  }),
  createSpeciesEntry({
    id: "species-human-2024",
    name: "Human",
    tags: [SPECIES_TYPES.HUMANOID],
    speed: 30,
    size: [BODY_SIZE.SMALL, BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Resourceful.</strong> You gain Heroic Inspiration whenever you finish a Long Rest.",
      "<strong>Skillful.</strong> You gain proficiency in one skill of your choice.",
      "<strong>Versatile.</strong> You gain an Origin feat of your choice."
    ]
  }),
  createSpeciesEntry({
    id: "species-orc-2024",
    name: "Orc",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.HARDY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 6-7 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Adrenaline Rush.</strong> You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus.",
      "You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 120 feet.",
      "<strong>Relentless Endurance.</strong> When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can't do so again until you finish a Long Rest."
    ]
  }),
  createSpeciesEntry({
    id: "species-tiefling-2024",
    name: "Tiefling",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    size: [BODY_SIZE.SMALL, BODY_SIZE.MEDIUM],
    trackingState: TRACKER.SEMI_TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM,
      recommendedTieflingLegacy: "infernal",
      recommendedTieflingSpellcastingAbility: "CHA"
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 3-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Fiendish Legacy.</strong> You are the recipient of a legacy that grants you supernatural abilities. Choose a legacy from the Fiendish Legacies table. You gain the level 1 benefit of the chosen legacy.",
      "When you reach character levels 3 and 5, you learn a higher-level spell, as shown on the table. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level. Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the legacy).",
      "<strong>Fiendish Legacies.</strong> Abyssal: Level 1 - You have Resistance to Poison damage. You also know the Poison Spray cantrip; Level 3 - Ray of Sickness; Level 5 - Hold Person. Chthonic: Level 1 - You have Resistance to Necrotic damage. You also know the Chill Touch cantrip; Level 3 - False Life; Level 5 - Ray of Enfeeblement. Infernal: Level 1 - You have Resistance to Fire damage. You also know the Fire Bolt cantrip; Level 3 - Hellish Rebuke; Level 5 - Darkness.",
      "<strong>Otherworldly Presence.</strong> You know the Thaumaturgy cantrip. When you cast it with this trait, the spell uses the same spellcasting ability you use for your Fiendish Legacy Trait."
    ]
  })
];

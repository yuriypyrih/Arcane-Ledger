import { BODY_SIZE, SPECIES_TYPES, TRACKER } from "./enums";
import { createSpeciesEntry } from "./speciesEntryFactory";
import type { SpeciesEntry } from "./types";

export const efaSpeciesEntries: SpeciesEntry[] = [
  createSpeciesEntry({
    id: "species-warforged-efa",
    name: "Warforged",
    source: "EFA",
    tags: [SPECIES_TYPES.CONSTRUCT],
    speed: 30,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Construct.",
      "<strong>Size.</strong> Medium (about 6-8 feet tall) or Small (about 3-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Construct Resilience.</strong> You have Resistance to Poison damage. You also have Advantage on saving throws to avoid or end the Poisoned condition.",
      "<strong>Integrated Protection.</strong> You gain a +1 bonus to your Armor Class. In addition, armor you have donned can't be removed against your will while you're alive.",
      "<strong>Sentry's Rest.</strong> You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 6 hours if you spend those hours in an inactive, motionless state. During this time, you appear inert but remain conscious.",
      "<strong>Specialized Design.</strong> You gain one skill proficiency and one tool proficiency of your choice.",
      "<strong>Tireless.</strong> You don't gain Exhaustion levels from dehydration, malnutrition, or suffocation."
    ]
  }),
  createSpeciesEntry({
    id: "species-shifter-efa",
    name: "Shifter",
    source: "EFA",
    tags: [SPECIES_TYPES.HUMANOID],
    speed: 30,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Bestial Instincts.</strong> Channeling the beast within, you gain proficiency in one of the following skills of your choice: Acrobatics, Athletics, Intimidation, or Survival.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Shifting.</strong> As a Bonus Action, you can shape-shift to assume a more bestial appearance. This transformation lasts for 1 minute or until you revert to your normal appearance as a Bonus Action. When you shift, you gain Temporary Hit Points equal to 2 times your Proficiency Bonus. You can shift a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "Whenever you shift, you gain the benefit of one of the following options (choose when you select this species).",
      "<strong>Beasthide.</strong> You gain 1d6 additional Temporary Hit Points. While shifted, you have a +1 bonus to your Armor Class.",
      "<strong>Longtooth.</strong> When you shift and as a Bonus Action on your other turns while shifted, you can use your elongated fangs to make an Unarmed Strike. If you hit with this Unarmed Strike and deal damage, you can deal Piercing damage equal to 1d6 plus your Strength modifier, instead of the normal damage of an Unarmed Strike.",
      "<strong>Swiftstride.</strong> While you are shifted, your Speed increases by 10 feet. Additionally, you can move up to 10 feet as a Reaction when a creature ends its turn within 5 feet of you. This reactive movement doesn't provoke Opportunity Attacks.",
      "<strong>Wildhunt.</strong> While shifted, you have Advantage on Wisdom checks. Additionally, no creature within 30 feet of you can have Advantage on an attack roll against you unless you have the Incapacitated condition."
    ]
  }),
  createSpeciesEntry({
    id: "species-khoravar-efa",
    name: "Khoravar",
    source: "EFA",
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.FEY_ANCESTRY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "The Fey Ancestry and Lethargy Resilience are not being tracked. Keep that in mind.",
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-6 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Fey Ancestry.</strong> You have Advantage on saving throws you make to avoid or end the Charmed condition.",
      "<strong>Fey Gift.</strong> You know the Friends cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for it (choose the ability when you select this species).",
      "<strong>Lethargy Resilience.</strong> When you fail a saving throw to avoid or end the Unconscious condition, you can succeed instead. Once you use this trait, you can't do so again until you finish 1d4 Long Rests.",
      "<strong>Skill Versatility.</strong> You gain proficiency in one skill or with one tool of your choice. Whenever you finish a Long Rest, you can replace it with another skill or tool proficiency."
    ]
  }),
  createSpeciesEntry({
    id: "species-kalashtar-efa",
    name: "Kalashtar",
    source: "EFA",
    tags: [SPECIES_TYPES.ABERRATION],
    speed: 30,
    size: [BODY_SIZE.MEDIUM],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "The Mind Link is not being tracked. You can create a custom action or trait if you want to.",
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Aberration.",
      "<strong>Size.</strong> Medium (about 6-7 feet tall).",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Dual Mind.</strong> You have Advantage on Wisdom and Charisma saving throws.",
      "<strong>Mental Discipline.</strong> You have Resistance to Psychic damage.",
      "<strong>Mind Link.</strong> You have telepathy with a range in feet equal to 10 times your level. When you're using this trait to speak telepathically to a creature, you can take a Magic action to give that creature the ability to speak telepathically with you for 1 hour or until you take another Magic action to end this effect.",
      "<strong>Severed from Dreams.</strong> You can't be the target of the Dream spell. In addition, when you finish a Long Rest, you gain proficiency in one skill of your choice. This proficiency lasts until you finish another Long Rest."
    ]
  }),
  createSpeciesEntry({
    id: "species-changeling-efa",
    name: "Changeling",
    source: "EFA",
    tags: [SPECIES_TYPES.FEY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Fey.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Changeling Instincts.</strong> Thanks to your connection to the fey realm, you gain proficiency in two of the following skills of your choice: Deception, Insight, Intimidation, Performance, or Persuasion.",
      "<strong>Shape-Shifter.</strong> As an action, you can shape-shift to change your appearance and your voice. You determine the specifics of the changes, including your coloration, hair length, and sex. You can also adjust your height and weight and can change your size between Medium and Small. You can make yourself appear as a member of another playable species, though none of your game statistics change. You can't duplicate the appearance of an individual you've never seen, and you must adopt a form that has the same basic arrangement of limbs that you have. This trait doesn't change your clothing and equipment.",
      "While shape-shifted with this trait, you have Advantage on Charisma checks.",
      "You stay in the new form until you take an action to revert to your true form."
    ]
  })
];

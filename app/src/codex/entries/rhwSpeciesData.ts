import { BODY_SIZE, SPECIES_TYPES, TRACKER } from "./enums";
import { createSpeciesEntry } from "./speciesEntryFactory";
import type { SpeciesEntry } from "./types";

export const rhwSpeciesEntries: SpeciesEntry[] = [
  createSpeciesEntry({
    id: "species-reborn-rhw",
    name: "Reborn",
    source: "RHW",
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
      "<strong>Escaped Death.</strong> You have Advantage on Death Saving Throws.",
      "<strong>Everlasting.</strong> You don't gain Exhaustion levels from dehydration, malnutrition, or suffocation. You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in an inactive, motionless state, during which you retain consciousness.",
      "<strong>Knowledge from a Past Life.</strong> You gain proficiency in one skill of your choice.",
      "In addition, you can temporarily peer into the past to aid you in the present. When you fail an ability check, you can roll 1d6 and add the number rolled to the d20, potentially turning the failure into a success. You can do this a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "<strong>Strange Endurance.</strong> You have Resistance to one of the following damage types of your choice: Cold, Necrotic, or Poison."
    ]
  }),
  createSpeciesEntry({
    id: "species-lupin-rhw",
    name: "Lupin",
    source: "RHW",
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
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Feral Pounce.</strong> Your Unarmed Strikes deal Slashing damage instead of Bludgeoning damage. In addition, when you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Shove options. You can use this benefit only once per turn.",
      "<strong>Howl.</strong> As a Bonus Action, you let out an unearthly howl. Each creature of your choice within 15 feet of you must succeed on a Wisdom saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus) or have Disadvantage on attack rolls and saving throws until the start of your next turn.",
      "You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "<strong>Werewolf Instincts.</strong> You have proficiency in the Perception, Stealth, or Survival skill."
    ]
  }),
  createSpeciesEntry({
    id: "species-hexblood-rhw",
    name: "Hexblood",
    source: "RHW",
    tags: [SPECIES_TYPES.FEY],
    speed: 30,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "The Distant Message and Remote Viewing is like part of the Eerie Token. They do not have a separate action for those.",
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Fey.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 30 feet.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Eerie Token.</strong> As a Bonus Action, you can create a magical token by harmlessly removing a lock of hair, detaching a nail, or using some other method. While the token exists, you gain the following benefits:",
      "<strong>Distant Message.</strong> As a Magic action, you can send a telepathic message of 25 words or fewer to a creature holding or carrying the token, as long as you are within 10 miles of it.",
      "<strong>Remote Viewing.</strong> If you are within 10 miles of the token, you can take a Magic action to extend your senses through the token for 1 minute, until you have the Incapacitated condition, or until you end this state (no action required). During this state, you can see and hear from the token as if you were located where it is. When this state ends, the token is harmlessly destroyed.",
      "Unless the token is destroyed early, it lasts until you finish a Long Rest. Once you create a token using this feature, you can't do so again until you finish a Long Rest.",
      "<strong>Hex Magic.</strong> You always have the Disguise Self and Hex spells prepared. You can cast each spell once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level. Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select this species)."
    ]
  }),
  createSpeciesEntry({
    id: "species-dhampir-rhw",
    name: "Dhampir",
    source: "RHW",
    tags: [SPECIES_TYPES.HUMANOID],
    speed: 35,
    size: [BODY_SIZE.MEDIUM, BODY_SIZE.SMALL],
    trackingState: TRACKER.NOT_TRACKED,
    starterPack: {
      recommendedBodySize: BODY_SIZE.MEDIUM
    },
    summary: "",
    description: [
      "<strong>Creature Type.</strong> Humanoid.",
      "<strong>Size.</strong> Medium (about 4-7 feet tall) or Small (about 2-4 feet tall), chosen when you select this species.",
      "<strong>Speed.</strong> 35 feet, Climb equal to your walking speed.",
      "<strong>Darkvision.</strong> You have Darkvision with a range of 60 feet.",
      "<strong>Spider Climb.</strong> You have a Climb Speed equal to your Speed. When you reach character level 3, you can move up, down, and across vertical surfaces and along ceilings while leaving your hands free.",
      "<strong>Trace of Undeath.</strong> You have Resistance to Necrotic damage.",
      "<strong>Vampiric Bite.</strong> When you use your Unarmed Strike and deal damage, you can choose to bite with your fangs. You deal Piercing damage equal to 1d4 plus your Constitution modifier instead of the normal damage of an Unarmed Strike.",
      "In addition, when you deal this damage to a creature that isn't a Construct or an Undead, you can empower yourself in one of the following ways:",
      "<strong>Drain.</strong> You regain Hit Points equal to the Piercing damage dealt.",
      "<strong>Strengthen.</strong> You gain a bonus to the next ability check or attack roll you make within the next minute; the bonus is equal to the Piercing damage dealt.",
      "You can empower yourself with this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
    ]
  })
];

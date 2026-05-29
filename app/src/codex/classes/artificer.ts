import { CLASS_FEATURE, SPELL_LIST_CLASS, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type ArtificerSpellSlotProgression = [number, number, number, number, number];

export type ArtificerFeatureClassObj = FeatureClassObj & {
  plansKnown: number | null;
  magicItems: number | null;
  cantrips: number;
  preparedSpells: number;
  spellSlots: ArtificerSpellSlotProgression;
};

export const artificerFeatures: ArtificerFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.SPELLCASTING, CLASS_FEATURE.TINKERS_MAGIC],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "You have learned how to channel magical energy through objects.",
          "<strong>Tools Required.</strong> You produce your Artificer spells through tools. You can use Thieves' Tools, Tinker's Tools, or another kind of Artisan's Tools with which you have proficiency as a Spellcasting Focus, and you must have one of those focuses in hand when you cast an Artificer spell, meaning the spell has a Material component when you cast it.",
          "<strong>Cantrips.</strong> You know two Artificer cantrips of your choice. <spell:Acid Splash>Acid Splash</spell> and <spell:Prestidigitation>Prestidigitation</spell> are recommended. Whenever you finish a <link:long-rest>Long Rest</link>, you can replace one of your cantrips from this feature with another Artificer cantrip of your choice.",
          "When you reach Artificer levels 10 and 14, you learn another Artificer cantrip of your choice, as shown in the Cantrips column of the Artificer Features table.",
          "<strong>Spell Slots.</strong> The Artificer Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended spell slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Artificer spells. <spell:Cure Wounds>Cure Wounds</spell> and <spell:Grease>Grease</spell> are recommended.",
          "The number of spells on your list increases as you gain Artificer levels, as shown in the Prepared Spells column of the Artificer Features table. Whenever that number increases, choose additional Artificer spells until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 5 Artificer, your list of prepared spells can include six Artificer spells of levels 1 and 2 in any combination.",
          "If another Artificer feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Artificer spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can change your list of prepared spells, replacing any of the spells there with other Artificer spells for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> <link:Intelligence>Intelligence</link> is your spellcasting ability for your Artificer spells."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    plansKnown: null,
    magicItems: null,
    cantrips: 2,
    preparedSpells: 2,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.REPLICATE_MAGIC_ITEM],
    plansKnown: 4,
    magicItems: 2,
    cantrips: 2,
    preparedSpells: 3,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    plansKnown: 4,
    magicItems: 2,
    cantrips: 2,
    preparedSpells: 4,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    plansKnown: 4,
    magicItems: 2,
    cantrips: 2,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [],
    plansKnown: 4,
    magicItems: 2,
    cantrips: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.MAGIC_ITEM_TINKER],
    plansKnown: 5,
    magicItems: 3,
    cantrips: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.FLASH_OF_GENIUS],
    plansKnown: 5,
    magicItems: 3,
    cantrips: 2,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    plansKnown: 5,
    magicItems: 3,
    cantrips: 2,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [],
    plansKnown: 5,
    magicItems: 3,
    cantrips: 2,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.MAGIC_ITEM_ADEPT],
    plansKnown: 6,
    magicItems: 4,
    cantrips: 3,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.SPELL_STORING_ITEM],
    plansKnown: 6,
    magicItems: 4,
    cantrips: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    plansKnown: 6,
    magicItems: 4,
    cantrips: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    plansKnown: 6,
    magicItems: 4,
    cantrips: 3,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.ADVANCED_ARTIFICE],
    plansKnown: 7,
    magicItems: 5,
    cantrips: 4,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 15,
    classFeatures: [],
    plansKnown: 7,
    magicItems: 5,
    cantrips: 4,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    plansKnown: 7,
    magicItems: 5,
    cantrips: 4,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 17,
    classFeatures: [],
    plansKnown: 7,
    magicItems: 5,
    cantrips: 4,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.MAGIC_ITEM_MASTER],
    plansKnown: 8,
    magicItems: 6,
    cantrips: 4,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1]
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "<feat:BOON_OF_ENERGY_RESISTANCE>Boon of Energy Resistance</feat> is recommended."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    plansKnown: 8,
    magicItems: 6,
    cantrips: 4,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.SOUL_OF_ARTIFICE],
    plansKnown: 8,
    magicItems: 6,
    cantrips: 4,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  }
];

export const artificerFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.TINKERS_MAGIC]: {
    description: [
      "You know the <spell:Mending>Mending</spell> cantrip.",
      "As a Magic action while holding Tinker's Tools, you can create one item in an unoccupied space within 5 feet of yourself, choosing from the following list.",
      "<strong>Item Options.</strong> Ball Bearings, Basket, Bedroll, Bell, Blanket, Block and Tackle, Bottle (Glass), Bucket, Caltrops, Candle, Crowbar, Flask, Grappling Hook, Hunting Trap, Jug, Lamp, Manacles, Net, Oil, Paper, Parchment, Pole, Pouch, Rope, Sack, Shovel, Spikes (Iron), String, Tinderbox, Torch, and Vial.",
      "See the item's rules in the Player's Handbook. The item lasts until you finish a <link:long-rest>Long Rest</link>, at which point it vanishes.",
      "You can use this feature a number of times equal to your <link:Intelligence>Intelligence</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.REPLICATE_MAGIC_ITEM]: {
    description: [
      "You have learned arcane plans that you use to make magic items.",
      "<strong>Plans Known.</strong> When you gain this feature, choose four plans to learn from the Magic Item Plans (Artificer Level 2+) table. Bag of Holding, Cap of Water Breathing, Sending Stones, and Wand of the War Mage are recommended. Whenever you gain an Artificer level, you can replace one of the plans you know with a new plan for which you qualify.",
      "You learn another plan of your choice when you reach certain Artificer levels, as shown in the Plans Known column of the Artificer Features table. When you choose a plan to learn, choose it from any Magic Item Plans table for which you qualify; your qualification is based on your Artificer level.",
      "<strong>Creating an Item.</strong> When you finish a <link:long-rest>Long Rest</link>, you can create one or two different magic items if you have Tinker's Tools in hand. Each item is based on one of the plans you know for this feature.",
      "If a created item requires Attunement, you can attune yourself to it the instant you create it. If you decide to attune to the item later, you must do so using the normal rules for Attunement.",
      "When you reach certain Artificer levels specified in the Magic Items column of the Artificer Features table, the number of magic items you can create at the end of a Long Rest increases. Each item you create must be based on a different plan you know.",
      "You can't have more magic items from this feature than the number shown in the Magic Items column of the Artificer Features table for your level. If you try to exceed that maximum, the oldest item vanishes and then the new item appears.",
      "<strong>Duration.</strong> A magic item created by this feature functions as the normal magic item, except its magic isn't permanent. When you die, the magic item vanishes after <strong>1d4</strong> days.",
      "If you replace a plan you know with a new plan, any magic item created with the replaced plan immediately vanishes. If a created item is a container, such as a Bag of Holding, and it vanishes, its contents harmlessly appear in and around its space.",
      "<strong>Spellcasting Focus.</strong> You can use any Wand or Weapon created by this feature as a Spellcasting Focus in place of Artisan's Tools.",
      "<strong>Magic Item Plans (Artificer Level 2+).</strong> Alchemy Jug, Bag of Holding, Cap of Water Breathing, Common magic item that isn't a Potion, a Scroll, or cursed, Goggles of Night, Manifold Tool, Repeating Shot, Returning Weapon, Rope of Climbing, Sending Stones, Shield +1, Wand of Magic Detection, Wand of Secrets, Wand of the War Mage +1, Weapon +1, and Wraps of Unarmed Power +1.",
      "You can learn the common magic item option multiple times, selecting a different item each time; each selected item counts as a different plan.",
      "<strong>Magic Item Plans (Artificer Level 6+).</strong> Armor +1, Boots of Elvenkind, Boots of the Winding Path, Cloak of Elvenkind, Cloak of the Manta Ray, Dazzling Weapon, Eyes of Charming, Eyes of Minute Seeing, Gloves of Thievery, Helm of Awareness, Lantern of Revealing, Mind Sharpener, Necklace of Adaptation, Pipes of Haunting, Repulsion Shield, Ring of Swimming, Ring of Water Walking, Sentinel Shield, Spell-Refueling Ring, Wand of Magic Missiles, Wand of Web, and Weapon of Warning.",
      "<strong>Magic Item Plans (Artificer Level 10+).</strong> Armor of Resistance, Dagger of Venom, Elven Chain, Ring of Feather Falling, Ring of Jumping, Ring of Mind Shielding, Shield +2, Uncommon Wondrous Item that isn't cursed, Wand of the War Mage +2, Weapon +2, and Wraps of Unarmed Power +2.",
      "You can learn the uncommon wondrous item option multiple times, selecting a different item each time; each selected item counts as a different plan.",
      "<strong>Magic Item Plans (Artificer Level 14+).</strong> Armor +2, Arrow-Catching Shield, Flame Tongue, Rare Wondrous Item that isn't cursed, Ring of Free Action, Ring of Protection, and Ring of the Ram.",
      "You can learn the rare wondrous item option multiple times, selecting a different item each time; each selected item counts as a different plan.",
      "<strong>Crafting More Magic Items.</strong> The Game Master's Guide provides rules for crafting magic items with the normal crafting system. Artificers can craft certain items faster through their subclasses, but those crafted items aren't treated as items created by this feature."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MAGIC_ITEM_TINKER]: {
    description: [
      "Your Replicate Magic Item feature gains the following options.",
      "<strong>Charge Magic Item.</strong> As a Bonus Action, you can touch a magic item within 5 feet of yourself that you created with Replicate Magic Item and that uses charges. You expend a level 1+ spell slot and recharge the item. The number of charges the item regains equals the level of the spell slot expended.",
      "<strong>Drain Magic Item.</strong> As a Bonus Action, you can touch a magic item within 5 feet of yourself that you created with Replicate Magic Item and cause it to vanish, converting its magical energy into a spell slot. The slot is level 1 if the item is Common or level 2 if the item is Uncommon or Rare. Once you use this option, you can't do so again until you finish a <link:long-rest>Long Rest</link>. Any spell slot you create with this feature vanishes when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Transmute Magic Item.</strong> As a Magic action, you can touch one magic item within 5 feet of yourself that you created with Replicate Magic Item and transform it into a different magic item. The resulting item must be based on a magic item plan you know. Once you use this option, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.FLASH_OF_GENIUS]: {
    description: [
      "When you or a creature you can see within 30 feet of you fails an ability check or a saving throw, you can take a Reaction to add a bonus to the roll, potentially causing it to succeed.",
      "The bonus equals your <link:Intelligence>Intelligence</link> modifier, minimum of +1.",
      "You can use this Reaction a number of times equal to your Intelligence modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MAGIC_ITEM_ADEPT]: {
    description: ["You can now attune to up to four magic items at once."],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SPELL_STORING_ITEM]: {
    description: [
      "Whenever you finish a <link:long-rest>Long Rest</link>, you can touch one Simple or Martial weapon or one item that you can use as a Spellcasting Focus and store a spell in it, choosing a level 1, 2, or 3 Artificer spell that has a casting time of an action and doesn't require a Material component that is consumed by the spell. You needn't have the spell prepared. (You have to craft it yourself using MODS)",
      "While holding the object, a creature can take a Magic action to produce the spell's effect from it, using your spellcasting ability modifier.",
      "If the spell requires <link:Concentration>Concentration</link>, the creature must concentrate. Once a creature has used the object to produce the spell's effect, the object can't be used this way again until the start of that creature's next turn.",
      "The spell stays in the object until it has been used a number of times equal to twice your Intelligence modifier, minimum of twice, or until you use this feature again to store a spell in an object."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.ADVANCED_ARTIFICE]: {
    description: [
      "You gain the following benefits.",
      "<strong>Magic Item Savant.</strong> You can now attune to up to five magic items at once.",
      "<strong>Refreshed Genius.</strong> When you finish a <link:short-rest>Short Rest</link>, you regain one expended use of your Flash of Genius feature."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MAGIC_ITEM_MASTER]: {
    description: ["You can now attune to up to six magic items at once."],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SOUL_OF_ARTIFICE]: {
    description: [
      "You have developed a mystical connection to your magic items, which you can draw on for aid. You gain the following benefits.",
      "<strong>Cheat Death.</strong> If you're reduced to 0 Hit Points but not killed outright, you can disintegrate any number of Uncommon or Rare magic items created by your Replicate Magic Item feature. If you do so, your Hit Points instead change to 20 times the number of magic items disintegrated.",
      "<strong>Magical Guidance.</strong> When you finish a <link:short-rest>Short Rest</link>, you regain all expended uses of Flash of Genius if you have Attunement to at least one magic item."
    ],
    trackingState: TRACKER.NOT_TRACKED
  }
};

export const useArtificerSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.ARTIFICER
);

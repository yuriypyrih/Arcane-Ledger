import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_5: 5,
  LEVEL_9: 9,
  LEVEL_15: 15
} as const;

function createSubclassFeatureRow(
  level: SubclassFeatureLevel,
  feature: CLASS_FEATURE,
  details: FeatureMapEntry
): SubclassFeatureClassObj {
  return {
    level,
    classFeatures: [feature],
    featureOverrides: {
      [feature]: details
    }
  };
}

function createDescription(description: string[]): FeatureMapEntry {
  return {
    description,
    trackingState: TRACKER.NOT_TRACKED
  };
}

export const artificerSubclassEntries: SubclassEntry[] = [
  {
    id: "artificer-alchemist",
    name: "Alchemist",
    className: "Artificer",
    tagline: "Craft Magic Elixirs and Potions",
    summary:
      "An Alchemist is an expert at combining reagents to produce magical effects. Alchemists use their creations to give life and to leech it away.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.TOOLS_OF_THE_TRADE, {
        description: [
          "You gain the following benefits.",
          "<strong>Tool Proficiency.</strong> You gain proficiency with Alchemist's Supplies and the Herbalism Kit. If you already have one of these proficiencies, you gain proficiency with one other type of Artisan's Tools of your choice, or with two other types if you have both.",
          "<strong>Potion Crafting.</strong> When you brew a potion using the crafting rules in the Dungeon Master's Guide, the amount of time required to craft it is halved."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ALCHEMIST_SPELLS,
        createDescription([
          "When you reach an Artificer level specified in the Alchemist Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Healing Word>Healing Word</spell>, <spell:Ray of Sickness>Ray of Sickness</spell>",
          "<strong>Level 5.</strong> <spell:Flaming Sphere>Flaming Sphere</spell>, <spell:Acid Arrow>Melf's Acid Arrow</spell>",
          "<strong>Level 9.</strong> <spell:Gaseous Form>Gaseous Form</spell>, <spell:Mass Healing Word>Mass Healing Word</spell>",
          "<strong>Level 13.</strong> <spell:Death Ward>Death Ward</spell>, <spell:Vitriolic Sphere>Vitriolic Sphere</spell>",
          "<strong>Level 17.</strong> <spell:Cloudkill>Cloudkill</spell>, <spell:Raise Dead>Raise Dead</spell>"
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.EXPERIMENTAL_ELIXIR,
        createDescription([
          "Whenever you finish a <link:long-rest>Long Rest</link> while holding Alchemist's Supplies, you can use that tool to magically produce two elixirs. For each elixir, roll on the Experimental Elixir table for the elixir's effect, which is triggered when someone drinks the elixir.",
          "The elixir appears in a vial, and the vial vanishes when the elixir is drunk or poured out. If any elixir remains when you finish a Long Rest, the elixir and its vial vanish.",
          "<strong>Drinking an Elixir.</strong> As a Bonus Action, a creature can drink the elixir or administer it to another creature within 5 feet of itself.",
          "<strong>Creating Additional Elixirs.</strong> As a Magic action while holding Alchemist's Supplies, you can expend one spell slot to create another elixir. When you do so, you choose its effect from the Experimental Elixir table rather than rolling.",
          "When you reach certain Artificer levels, you can make an additional elixir at the end of each Long Rest: a total of three at level 5, four at level 9, and five at level 15.",
          "<strong>Healing.</strong> The drinker regains <strong>2d8</strong> plus your <link:Intelligence>Intelligence</link> modifier Hit Points. The healing increases to <strong>3d8</strong> at Artificer level 9 and <strong>4d8</strong> at Artificer level 15.",
          "<strong>Swiftness.</strong> The drinker's <link:Speed>Speed</link> increases by 10 feet for 1 hour. This bonus increases to 15 feet at Artificer level 9 and 20 feet at Artificer level 15.",
          "<strong>Resilience.</strong> The drinker gains a +1 bonus to <link:Armor Class>AC</link> for 10 minutes. The duration increases to 1 hour at Artificer level 9 and 8 hours at Artificer level 15.",
          "<strong>Boldness.</strong> The drinker can roll <strong>1d4</strong> and add the number rolled to every attack roll and saving throw they make for the next minute. The duration increases to 10 minutes at Artificer level 9 and 1 hour at Artificer level 15.",
          "<strong>Flight.</strong> The drinker gains a Fly Speed of 10 feet for 10 minutes. The Fly Speed increases to 20 feet at Artificer level 9 and 30 feet at Artificer level 15.",
          "<strong>Choice.</strong> On a roll of 6, you determine the elixir's effect by choosing one of the other rows in the table."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_5,
        CLASS_FEATURE.ALCHEMICAL_SAVANT,
        createDescription([
          "Whenever you cast a spell using your Alchemist's Supplies as the Spellcasting Focus, you gain a bonus to one roll of the spell.",
          "That roll must restore Hit Points or be a damage roll that deals <link:Acid>Acid</link>, <link:Fire>Fire</link>, or <link:Poison>Poison</link> damage.",
          "The bonus equals your <link:Intelligence>Intelligence</link> modifier, minimum bonus of +1."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.RESTORATIVE_REAGENTS,
        createDescription([
          "You can cast <spell:Lesser Restoration>Lesser Restoration</spell> without expending a spell slot and without preparing the spell, provided you use Alchemist's Supplies as the Spellcasting Focus.",
          "You can do so a number of times equal to your <link:Intelligence>Intelligence</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.CHEMICAL_MASTERY,
        createDescription([
          "You gain the following benefits.",
          "<strong>Alchemical Eruption.</strong> When you cast an Artificer spell that deals <link:Acid>Acid</link>, <link:Fire>Fire</link>, or <link:Poison>Poison</link> damage to a target, you can also deal <strong>2d8</strong> <link:Force>Force</link> damage to that target. You can use this benefit only once on each of your turns.",
          "<strong>Chemical Resistance.</strong> You gain <link:Resistance>Resistance</link> to Acid damage and Poison damage. You also gain <link:Immunity>Immunity</link> to the <link:Poisoned>Poisoned</link> condition.",
          "<strong>Conjured Cauldron.</strong> You can cast Tasha's Bubbling Cauldron without expending a spell slot, without preparing the spell, and without Material components, provided you use Alchemist's Supplies as the Spellcasting Focus. Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
        ])
      )
    ]
  },
  {
    id: "artificer-armorer",
    name: "Armorer",
    className: "Artificer",
    tagline: "Craft Magic Armor to Enhance Your Abilities",
    summary:
      "An Armorer modifies armor to function almost like a second skin. The armor is enhanced to hone the Armorer's magic, unleash potent attacks, and generate a formidable defense.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TOOLS_OF_THE_TRADE,
        createDescription([
          "You gain the following benefits.",
          "<strong>Armor Training.</strong> You gain training with Heavy armor.",
          "<strong>Tool Proficiency.</strong> You gain proficiency with Smith's Tools. If you already have this tool proficiency, you gain proficiency with one other type of Artisan's Tools of your choice.",
          "<strong>Armor Crafting.</strong> When you craft nonmagical or magic armor, the amount of time required to craft it is halved."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ARMORER_SPELLS,
        createDescription([
          "When you reach an Artificer level specified in the Armorer Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Magic Missile>Magic Missile</spell>, <spell:Thunderwave>Thunderwave</spell>",
          "<strong>Level 5.</strong> <spell:Mirror Image>Mirror Image</spell>, <spell:Shatter>Shatter</spell>",
          "<strong>Level 9.</strong> <spell:Hypnotic Pattern>Hypnotic Pattern</spell>, <spell:Lightning Bolt>Lightning Bolt</spell>",
          "<strong>Level 13.</strong> <spell:Fire Shield>Fire Shield</spell>, <spell:Greater Invisibility>Greater Invisibility</spell>",
          "<strong>Level 17.</strong> <spell:Passwall>Passwall</spell>, <spell:Wall of Force>Wall of Force</spell>"
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ARCANE_ARMOR,
        createDescription([
          "As a Magic action while you have Smith's Tools in hand, you can turn a suit of armor you are wearing into Arcane Armor. The armor continues to be Arcane Armor until you don another suit of armor or you die.",
          "You gain the following benefits while wearing your Arcane Armor.",
          "<strong>No Strength Requirement.</strong> If the armor normally has a Strength requirement, the Arcane Armor lacks this requirement for you.",
          "<strong>Quick Don and Doff.</strong> You can don or doff the armor as a Utilize action. The armor can't be removed against your will.",
          "<strong>Spellcasting Focus.</strong> You can use the Arcane Armor as a Spellcasting Focus for your Artificer spells."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ARMOR_MODEL,
        createDescription([
          "You can customize your Arcane Armor. When you do so, choose one of the following armor models: Dreadnaught, Guardian, or Infiltrator. The model you choose gives you special benefits while you wear it.",
          "Each model includes a special weapon. When you attack with that weapon, you can add your <link:Intelligence>Intelligence</link> modifier, instead of your <link:Strength>Strength</link> or <link:Dexterity>Dexterity</link> modifier, to the attack and damage rolls.",
          "You can change the armor's model whenever you finish a <link:short-rest>Short</link> or <link:long-rest>Long Rest</link> if you have Smith's Tools in hand.",
          "<strong>Dreadnaught: Force Demolisher.</strong> An arcane wrecking ball or sledgehammer projects from your armor. The demolisher counts as a Simple Melee weapon with the Reach property, and it deals <strong>1d10</strong> <link:Force>Force</link> damage on a hit. If you hit a creature that is at least one size smaller than you with the demolisher, you can push the creature up to 10 feet straight away from yourself or pull the creature up to 10 feet toward yourself.",
          "<strong>Dreadnaught: Giant Stature.</strong> As a Bonus Action, you transform and enlarge your armor for 1 minute. For the duration, your reach increases by 5 feet, and if you are smaller than Large, you become Large, along with anything you are wearing. If there isn't enough room for you to increase your size, your size doesn't change. You can use this Bonus Action a number of times equal to your Intelligence modifier, minimum of once, and you regain all expended uses when you finish a Long Rest.",
          "<strong>Guardian: Thunder Pulse.</strong> You can discharge concussive blasts with strikes from your armor. The pulse counts as a Simple Melee weapon and deals <strong>1d8</strong> <link:Thunder>Thunder</link> damage on a hit. A creature hit by the pulse has <link:Disadvantage>Disadvantage</link> on attack rolls against targets other than you until the start of your next turn.",
          "<strong>Guardian: Defensive Field.</strong> While Bloodied, you can take a Bonus Action to gain <link:Temporary Hit Points>Temporary Hit Points</link> equal to your Artificer level. You lose these Temporary Hit Points if you doff the armor.",
          "<strong>Infiltrator: Lightning Launcher.</strong> A gemlike node appears on your armor, from which you can shoot bolts of lightning. The launcher counts as a Simple Ranged weapon with a normal range of 90 feet and a long range of 300 feet, and it deals <strong>1d6</strong> <link:Lightning>Lightning</link> damage on a hit. Once on each of your turns when you hit a creature with the launcher, you can deal an extra <strong>1d6</strong> Lightning damage to that target.",
          "<strong>Infiltrator: Powered Steps.</strong> Your <link:Speed>Speed</link> increases by 5 feet.",
          "<strong>Infiltrator: Dampening Field.</strong> You have <link:Advantage>Advantage</link> on <link:Dexterity>Dexterity</link> (<link:Stealth>Stealth</link>) checks. If the armor imposes Disadvantage on such checks, the Advantage and Disadvantage cancel each other, as normal."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_5,
        CLASS_FEATURE.EXTRA_ATTACK,
        createDescription([
          "You can attack twice instead of once whenever you take the Attack action on your turn."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.IMPROVED_ARMORER,
        createDescription([
          "You gain the following benefits.",
          "<strong>Armor Replication.</strong> You learn an additional plan for your Replicate Magic Item feature, and it must be in the Armor category. If you replace that plan, you must replace it with another Armor plan.",
          "In addition, you can create an additional item with that feature, and the item must also be in the Armor category.",
          "<strong>Improved Arsenal.</strong> You gain a +1 bonus to attack and damage rolls made with the special weapon of your Arcane Armor model."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.PERFECTED_ARMOR,
        createDescription([
          "Your Arcane Armor gains additional benefits based on its model.",
          "<strong>Dreadnaught.</strong> The damage die of your Force Demolisher increases to <strong>2d6</strong> <link:Force>Force</link> damage. In addition, when you use your Giant Stature, your reach increases by 10 feet, your size can increase to Large or Huge, your choice, and you have <link:Advantage>Advantage</link> on <link:Strength>Strength</link> checks and Strength saving throws for the duration.",
          "<strong>Guardian.</strong> The damage die of your Thunder Pulse increases to <strong>1d10</strong> <link:Thunder>Thunder</link> damage. In addition, when a Huge or smaller creature you can see ends its turn within 30 feet of you, you can take a Reaction to magically force that creature to make a <link:Strength Saving Throw>Strength saving throw</link> against your spell save DC. On a failed save, you pull the creature up to 25 feet directly toward you to an unoccupied space. If you pull the target to a space within 5 feet of yourself, you can make a melee weapon attack against it as part of this Reaction. You can take this Reaction a number of times equal to your Intelligence modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Infiltrator.</strong> The damage die of your Lightning Launcher increases to <strong>2d6</strong> <link:Lightning>Lightning</link> damage. Any creature that takes Lightning damage from your Lightning Launcher glimmers with magical light until the start of your next turn. The glimmering creature sheds Dim Light in a 5-foot radius, and it has <link:Disadvantage>Disadvantage</link> on attack rolls against you, as the light jolts it if it attacks you.",
          "Additionally, as a Bonus Action, you can gain a Fly Speed equal to twice your Speed until the end of the current turn. You can take this Bonus Action a number of times equal to your Intelligence modifier, minimum of once, and you regain all expended uses when you finish a Long Rest."
        ])
      )
    ]
  },
  {
    id: "artificer-artillerist",
    name: "Artillerist",
    className: "Artificer",
    tagline: "Wield Destructive Power from Afar",
    summary:
      "An Artillerist specializes in using magic to hurl energy, projectiles, and explosions on a battlefield.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TOOLS_OF_THE_TRADE,
        createDescription([
          "You gain the following benefits.",
          "<strong>Ranged Weaponry.</strong> You gain proficiency with Martial Ranged weapons.",
          "<strong>Tool Proficiency.</strong> You gain proficiency with Woodcarver's Tools. If you already have this proficiency, you gain proficiency with one other type of Artisan's Tools of your choice.",
          "<strong>Wand Crafting.</strong> When you craft a magic Wand, the amount of time required to craft it is halved."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ARTILLERIST_SPELLS,
        createDescription([
          "When you reach an Artificer level specified in the Artillerist Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Shield>Shield</spell>, <spell:Thunderwave>Thunderwave</spell>",
          "<strong>Level 5.</strong> <spell:Scorching Ray>Scorching Ray</spell>, <spell:Shatter>Shatter</spell>",
          "<strong>Level 9.</strong> <spell:Fireball>Fireball</spell>, <spell:Wind Wall>Wind Wall</spell>",
          "<strong>Level 13.</strong> <spell:Ice Storm>Ice Storm</spell>, <spell:Wall of Fire>Wall of Fire</spell>",
          "<strong>Level 17.</strong> <spell:Cone of Cold>Cone of Cold</spell>, <spell:Wall of Force>Wall of Force</spell>"
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ELDRITCH_CANNON,
        createDescription([
          "Using Smith's Tools or Woodcarver's Tools, you can take a Magic action to create a Small or Tiny Eldritch Cannon in an unoccupied space on a horizontal surface within 5 feet of yourself.",
          "You determine its appearance, including whether you carry it or not, and your choice of legs or wheels if it moves on its own. It disappears if it is reduced to 0 Hit Points or after 1 hour. You can dismiss it early as a Magic action.",
          "Once you create a cannon, you can't do so again until you finish a <link:long-rest>Long Rest</link> or expend a spell slot to create one.",
          "You can have only one cannon at a time and can't create one while you already have one."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_5,
        CLASS_FEATURE.ARCANE_FIREARM,
        createDescription([
          "When you finish a <link:long-rest>Long Rest</link>, you can use Woodcarver's Tools to carve special sigils into a Rod, Staff, Wand, or Martial Ranged weapon and thereby turn it into your Arcane Firearm.",
          "The sigils disappear from the object if you later carve them on a different item. The sigils otherwise last indefinitely.",
          "You can use your Arcane Firearm as a Spellcasting Focus for your Artificer spells.",
          "When you cast an Artificer spell through the firearm, roll <strong>1d8</strong>, and you gain a bonus to one of the spell's damage rolls equal to the number rolled."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.EXPLOSIVE_CANNON,
        createDescription([
          "Every Eldritch Cannon you create is now more destructive. You gain the following benefits.",
          "<strong>Detonate.</strong> When your cannon takes damage, you can take a Reaction to command the cannon to detonate if you are within 60 feet of it. Doing so destroys the cannon and forces each creature within 20 feet of it to make a <link:Dexterity Saving Throw>Dexterity saving throw</link> against your spell save DC, taking <strong>3d10</strong> <link:Force>Force</link> damage on a failed save or half as much damage on a successful one.",
          "<strong>Firepower.</strong> The cannon's damage rolls and the number of Temporary Hit Points granted by Protector increase by <strong>1d8</strong>."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.FORTIFIED_POSITION,
        createDescription([
          "You're a master at forming well-defended emplacements using your Eldritch Cannon. You gain the following benefits.",
          "<strong>Double Firepower.</strong> You can now have two cannons at the same time, and you can create two with the same Magic action. If you expend a spell slot to create the first cannon, you must expend another spell slot to create the second.",
          "You can activate both of them with the same Bonus Action, ordering them to use the same activation option or different ones. You can't create a third cannon while you have two.",
          "<strong>Shimmering Field Projection.</strong> You and your allies have Half Cover while within 10 feet of your Eldritch Cannon."
        ])
      )
    ]
  },
  {
    id: "artificer-battle-smith",
    name: "Battle Smith",
    className: "Artificer",
    tagline: "Command a Construct Guardian",
    summary:
      "A Battle Smith is a combination of protector and medic, an expert at defending others and repairing both materiel and personnel. To aid in their work, Battle Smiths are accompanied by a Steel Defender, a protective companion of their own creation.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TOOLS_OF_THE_TRADE,
        createDescription([
          "You gain the following benefits.",
          "<strong>Tool Proficiency.</strong> You gain proficiency with Smith's Tools. If you already have this proficiency, you gain proficiency with one other type of Artisan's Tools of your choice.",
          "<strong>Weapon Crafting.</strong> When you craft a nonmagical or magic weapon, the amount of time required to craft it is halved."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.BATTLE_SMITH_SPELLS,
        createDescription([
          "When you reach an Artificer level specified in the Battle Smith Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Heroism>Heroism</spell>, <spell:Shield>Shield</spell>",
          "<strong>Level 5.</strong> <spell:Shining Smite>Shining Smite</spell>, <spell:Warding Bond>Warding Bond</spell>",
          "<strong>Level 9.</strong> <spell:Aura of Vitality>Aura of Vitality</spell>, <spell:Conjure Barrage>Conjure Barrage</spell>",
          "<strong>Level 13.</strong> <spell:Aura of Purity>Aura of Purity</spell>, <spell:Fire Shield>Fire Shield</spell>",
          "<strong>Level 17.</strong> <spell:Banishing Smite>Banishing Smite</spell>, <spell:Mass Cure Wounds>Mass Cure Wounds</spell>"
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.BATTLE_READY,
        createDescription([
          "Your combat training and your experiments with magic have paid off in two ways.",
          "<strong>Arcane Empowerment.</strong> When you attack with a magic weapon, you can use your <link:Intelligence>Intelligence</link> modifier, instead of your <link:Strength>Strength</link> or <link:Dexterity>Dexterity</link> modifier, for the attack and damage rolls.",
          "<strong>Weapon Knowledge.</strong> You gain proficiency with Martial weapons. You can use a weapon with which you have proficiency as a Spellcasting Focus for your Artificer spells."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.STEEL_DEFENDER,
        createDescription([
          "Your tinkering has borne you a companion, a Steel Defender. You determine the defender's appearance and whether it has two legs or four; your choices don't affect the defender's game statistics.",
          "The defender is Friendly to you and your allies and obeys you. It vanishes if you die.",
          "<strong>The Defender in Combat.</strong> In combat, the defender acts during your turn. It can move and take its Reaction on its own, but the only action it takes is the Dodge action unless you take a Bonus Action to command it to take an action.",
          "If you have the <link:Incapacitated>Incapacitated</link> condition, the defender acts on its own and isn't limited to the Dodge action.",
          "<strong>Restoring or Replacing the Defender.</strong> If the defender has died within the last hour, you can take a Magic action to touch it and expend a spell slot. The defender returns to life after 1 minute with all its Hit Points restored.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, you can create a new defender if you have Smith's Tools in hand. If you already have a defender from this feature, the first one vanishes."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_5,
        CLASS_FEATURE.EXTRA_ATTACK,
        createDescription([
          "You can attack twice instead of once whenever you take the Attack action on your turn.",
          "You can forgo one of your attacks when you take the Attack action to command your Steel Defender to take the Force-Empowered Rend action."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.ARCANE_JOLT,
        createDescription([
          "When either you hit a target with an attack roll using a magic weapon or your Steel Defender hits a target, you can channel magical energy through the strike to create one of the following effects.",
          "<strong>Destructive Energy.</strong> The target takes an extra <strong>2d6</strong> <link:Force>Force</link> damage.",
          "<strong>Restorative Energy.</strong> Choose one creature or object you can see within 30 feet of the target. Healing energy flows into the chosen recipient, restoring <strong>2d6</strong> Hit Points to it.",
          "You can use this energy a number of times equal to your <link:Intelligence>Intelligence</link> modifier, minimum of once, but you can do so no more than once per turn. You regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.IMPROVED_DEFENDER,
        createDescription([
          "Your Arcane Jolt and Steel Defender have become more powerful, granting these benefits.",
          "<strong>Improved Jolt.</strong> The extra damage and healing of your Arcane Jolt both increase to <strong>4d6</strong>.",
          "<strong>Improved Deflection.</strong> Whenever your Steel Defender uses its Deflect Attack, the attacker takes <link:Force>Force</link> damage equal to <strong>1d4</strong> plus your <link:Intelligence>Intelligence</link> modifier."
        ])
      )
    ]
  },
  {
    id: "artificer-cartographer",
    name: "Cartographer",
    className: "Artificer",
    tagline: "Chart Advantageous Courses through Turmoil",
    summary:
      "Cartographers are the premier navigators and reconnaissance agents. Using their creations, Cartographers can highlight threats, safeguard allies, and carve portals to distant locations.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TOOLS_OF_THE_TRADE,
        createDescription([
          "You gain the following benefits.",
          "<strong>Tool Proficiency.</strong> You gain proficiency with Calligrapher's Supplies and Cartographer's Tools. If you already have one of these proficiencies, you gain proficiency with one other type of Artisan's Tools of your choice, or with two other types if you have both.",
          "<strong>Scroll Crafting.</strong> When you scribe a Spell Scroll using the crafting rules in the Player's Handbook, the amount of time required to craft it is halved."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.CARTOGRAPHER_SPELLS,
        createDescription([
          "When you reach an Artificer level specified in the Cartographer Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Faerie Fire>Faerie Fire</spell>, <spell:Guiding Bolt>Guiding Bolt</spell>, <spell:Healing Word>Healing Word</spell>",
          "<strong>Level 5.</strong> <spell:Locate Object>Locate Object</spell>, <spell:Mind Spike>Mind Spike</spell>",
          "<strong>Level 9.</strong> <spell:Call Lightning>Call Lightning</spell>, <spell:Clairvoyance>Clairvoyance</spell>",
          "<strong>Level 13.</strong> <spell:Banishment>Banishment</spell>, <spell:Locate Creature>Locate Creature</spell>",
          "<strong>Level 17.</strong> <spell:Scrying>Scrying</spell>, <spell:Teleportation Circle>Teleportation Circle</spell>"
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ADVENTURERS_ATLAS,
        createDescription([
          "Whenever you finish a <link:long-rest>Long Rest</link> while holding Cartographer's Tools, you can use that tool to create a set of magical maps by touching at least two creatures, one of whom can be yourself, up to a maximum number of creatures equal to 1 plus your <link:Intelligence>Intelligence</link> modifier, minimum of two creatures.",
          "Each target receives a magical map, which constantly updates to show the relative position of all the map holders but is illegible to all others.",
          "The maps last until you die or until you use this feature again, at which point any existing maps created by this feature immediately vanish.",
          "While carrying the map, a target gains the following benefits.",
          "<strong>Awareness.</strong> The target adds <strong>1d4</strong> to its <link:Initiative>Initiative</link> rolls.",
          "<strong>Positioning.</strong> The target knows the location of all other map holders that are on the same plane of existence as itself. When casting a spell or creating another effect that requires being able to see the effect's target, a map holder can target another map holder regardless of sight or cover, so long as the other map holder is still within the effect's range."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.MAPPING_MAGIC,
        createDescription([
          "You gain the following benefits.",
          "<strong>Illuminated Cartography.</strong> You can cast <spell:Faerie Fire>Faerie Fire</spell> without expending a spell slot, outlining the affected creatures as if in ink. You can do so a number of times equal to your <link:Intelligence>Intelligence</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Portal Jump.</strong> On your turn, you can spend an amount of movement equal to half your <link:Speed>Speed</link>, round down, to teleport to an unoccupied space you can see within 10 feet of yourself or within 5 feet of a creature that is within 30 feet of you and holding one of your Adventurer's Atlas maps. You can't use this benefit if your Speed is 0."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_5,
        CLASS_FEATURE.GUIDED_PRECISION,
        createDescription([
          "Once per turn, whenever you cast a spell from your Cartographer Spells list or hit a creature affected by your <spell:Faerie Fire>Faerie Fire</spell> with an attack roll, you can add your <link:Intelligence>Intelligence</link> modifier to one damage roll of the spell or attack.",
          "In addition, taking damage can't cause you to lose <link:Concentration>Concentration</link> on <spell:Faerie Fire>Faerie Fire</spell>."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.INGENIOUS_MOVEMENT,
        createDescription([
          "When you use your Flash of Genius, you or a willing creature of your choice that you can see within 30 feet of yourself can teleport up to 30 feet to an unoccupied space you can see as part of that same Reaction."
        ])
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.SUPERIOR_ATLAS,
        createDescription([
          "Your Adventurer's Atlas improves, gaining the following benefits.",
          "<strong>Safe Haven.</strong> When a map holder would be reduced to 0 Hit Points but not killed outright, that creature can destroy its map. The creature's Hit Points instead change to a number equal to twice your Artificer level, and the creature is teleported to an unoccupied space within 5 feet of you or another map holder of its choice.",
          "<strong>Unerring Path.</strong> If you are one of the map holders for your Adventurer's Atlas, you can cast <spell:Find the Path>Find the Path</spell> without expending a spell slot, without preparing the spell, and without needing spell components. Once you use this benefit, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
        ])
      )
    ]
  }
];

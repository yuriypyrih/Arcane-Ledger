export type ArtificerReplicateMagicItemPlanLevel = 2 | 6 | 10 | 14;

export type ArtificerReplicateMagicItemPlanOption = {
  level: ArtificerReplicateMagicItemPlanLevel;
  key: string;
  label: string;
};

export type ArtificerReplicateMagicItemPlanGroup = {
  level: ArtificerReplicateMagicItemPlanLevel;
  label: string;
  options: ArtificerReplicateMagicItemPlanOption[];
};

export const artificerReplicateMagicItemPlanGroups: ArtificerReplicateMagicItemPlanGroup[] = [
  {
    level: 2,
    label: "Artificer Plan Level 2+",
    options: [
      { level: 2, key: "alchemy-jug", label: "Alchemy Jug" },
      { level: 2, key: "bag-of-holding", label: "Bag of Holding" },
      { level: 2, key: "cap-of-water-breathing", label: "Cap of Water Breathing" },
      {
        level: 2,
        key: "common-magic-item",
        label: "Common magic item that isn't a Potion, a Scroll, or cursed"
      },
      { level: 2, key: "goggles-of-night", label: "Goggles of Night" },
      { level: 2, key: "manifold-tool", label: "Manifold Tool" },
      { level: 2, key: "repeating-shot", label: "Repeating Shot" },
      { level: 2, key: "returning-weapon", label: "Returning Weapon" },
      { level: 2, key: "rope-of-climbing", label: "Rope of Climbing" },
      { level: 2, key: "sending-stones", label: "Sending Stones" },
      { level: 2, key: "shield-plus-1", label: "Shield +1" },
      { level: 2, key: "wand-of-magic-detection", label: "Wand of Magic Detection" },
      { level: 2, key: "wand-of-secrets", label: "Wand of Secrets" },
      { level: 2, key: "wand-of-the-war-mage-plus-1", label: "Wand of the War Mage +1" },
      { level: 2, key: "weapon-plus-1", label: "Weapon +1" },
      { level: 2, key: "wraps-of-unarmed-power-plus-1", label: "+1 Wraps of Unarmed Power" }
    ]
  },
  {
    level: 6,
    label: "Artificer Plan Level 6+",
    options: [
      { level: 6, key: "armor-plus-1", label: "Armor +1" },
      { level: 6, key: "boots-of-elvenkind", label: "Boots of Elvenkind" },
      { level: 6, key: "boots-of-the-winding-path", label: "Boots of the Winding Path" },
      { level: 6, key: "cloak-of-elvenkind", label: "Cloak of Elvenkind" },
      { level: 6, key: "cloak-of-the-manta-ray", label: "Cloak of the Manta Ray" },
      { level: 6, key: "dazzling-weapon", label: "Dazzling Weapon" },
      { level: 6, key: "eyes-of-charming", label: "Eyes of Charming" },
      { level: 6, key: "eyes-of-minute-seeing", label: "Eyes of Minute Seeing" },
      { level: 6, key: "gloves-of-thievery", label: "Gloves of Thievery" },
      { level: 6, key: "helm-of-awareness", label: "Helm of Awareness" },
      { level: 6, key: "lantern-of-revealing", label: "Lantern of Revealing" },
      { level: 6, key: "mind-sharpener", label: "Mind Sharpener" },
      { level: 6, key: "necklace-of-adaptation", label: "Necklace of Adaptation" },
      { level: 6, key: "pipes-of-haunting", label: "Pipes of Haunting" },
      { level: 6, key: "repulsion-shield", label: "Repulsion Shield" },
      { level: 6, key: "ring-of-swimming", label: "Ring of Swimming" },
      { level: 6, key: "ring-of-water-walking", label: "Ring of Water Walking" },
      { level: 6, key: "sentinel-shield", label: "Sentinel Shield" },
      { level: 6, key: "spell-refueling-ring", label: "Spell-Refueling Ring" },
      { level: 6, key: "wand-of-magic-missiles", label: "Wand of Magic Missiles" },
      { level: 6, key: "wand-of-web", label: "Wand of Web" },
      { level: 6, key: "weapon-of-warning", label: "Weapon of Warning" }
    ]
  },
  {
    level: 10,
    label: "Artificer Plan Level 10+",
    options: [
      { level: 10, key: "armor-of-resistance", label: "Armor of Resistance" },
      { level: 10, key: "dagger-of-venom", label: "Dagger of Venom" },
      { level: 10, key: "elven-chain", label: "Elven Chain" },
      { level: 10, key: "ring-of-feather-falling", label: "Ring of Feather Falling" },
      { level: 10, key: "ring-of-jumping", label: "Ring of Jumping" },
      { level: 10, key: "ring-of-mind-shielding", label: "Ring of Mind Shielding" },
      { level: 10, key: "shield-plus-2", label: "Shield +2" },
      {
        level: 10,
        key: "uncommon-wondrous-item",
        label: "Uncommon Wondrous Item that isn't cursed"
      },
      { level: 10, key: "wand-of-the-war-mage-plus-2", label: "Wand of the War Mage +2" },
      { level: 10, key: "weapon-plus-2", label: "Weapon +2" },
      { level: 10, key: "wraps-of-unarmed-power-plus-2", label: "+2 Wraps of Unarmed Power" }
    ]
  },
  {
    level: 14,
    label: "Artificer Plan Level 14+",
    options: [
      { level: 14, key: "armor-plus-2", label: "Armor +2" },
      { level: 14, key: "arrow-catching-shield", label: "Arrow-Catching Shield" },
      { level: 14, key: "flame-tongue", label: "Flame Tongue" },
      {
        level: 14,
        key: "rare-wondrous-item",
        label: "Rare Wondrous Item that isn't cursed"
      },
      { level: 14, key: "ring-of-free-action", label: "Ring of Free Action" },
      { level: 14, key: "ring-of-protection", label: "Ring of Protection" },
      { level: 14, key: "ring-of-the-ram", label: "Ring of the Ram" }
    ]
  }
];

export const artificerReplicateMagicItemPlanOptions = artificerReplicateMagicItemPlanGroups.flatMap(
  (group) => group.options
);

export const artificerReplicateMagicItemPlanOptionsByKey: ReadonlyMap<
  string,
  ArtificerReplicateMagicItemPlanOption
> = new Map(artificerReplicateMagicItemPlanOptions.map((option) => [option.key, option]));

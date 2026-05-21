export type ArtificerReplicateMagicItemPlanLevel = 2 | 6 | 10 | 14;

export type ArtificerReplicateMagicItemPlanDefinition = {
  level: ArtificerReplicateMagicItemPlanLevel;
  key: string;
  label: string;
  itemKeys: readonly string[];
};

export type ArtificerReplicateMagicItemPlanGroup = {
  level: ArtificerReplicateMagicItemPlanLevel;
  label: string;
  options: readonly ArtificerReplicateMagicItemPlanDefinition[];
};

export const ARTIFICER_REPLICATE_MAGIC_ITEM_SPECIAL_FILTER = "ArtificerReplicateMagicItem";
export const ARTIFICER_REPLICATE_MAGIC_ITEM_ALL_PLAN_KEY = "ALL";

const levelAggregatePlanKeys = [
  ["all-level-2", 2],
  ["all-level-6", 6],
  ["all-level-10", 10],
  ["all-level-14", 14]
] as const satisfies readonly (readonly [string, ArtificerReplicateMagicItemPlanLevel])[];

const commonMagicItemKeys = [
  "srd-2024_manifold-tool",
  "vom_agile-breastplate",
  "vom_agile-chain-mail",
  "vom_agile-chain-shirt",
  "vom_agile-half-plate",
  "vom_agile-hide",
  "vom_agile-plate",
  "vom_agile-ring-mail",
  "vom_agile-scale-mail",
  "vom_agile-splint",
  "vom_almanac-of-common-wisdom",
  "vom_animated-abacus",
  "vom_apron-of-the-eager-artisan",
  "vom_ashwood-wand",
  "vom_blackguards-dagger",
  "vom_blackguards-shortsword",
  "vom_blessed-paupers-purse",
  "vom_bookmark-of-eldritch-insight",
  "vom_bountiful-cauldron",
  "vom_brawlers-leather",
  "vom_breathing-reed",
  "vom_broken-fang-talisman",
  "vom_broom-of-sweeping",
  "vom_brown-honey-buckle",
  "vom_candle-of-visions",
  "vom_case-of-preservation",
  "vom_charm-of-restoration",
  "vom_clamor-bell",
  "vom_comfy-slippers",
  "vom_commanders-helm",
  "vom_commoners-veneer",
  "vom_copper-skeleton-key",
  "vom_crawling-cloak",
  "vom_crusaders-shield",
  "vom_dancing-caltrops",
  "vom_dancing-ink",
  "vom_deepchill-orb",
  "vom_distracting-doubloon",
  "vom_dust-of-muffling",
  "vom_ferrymans-coins",
  "vom_figurehead-of-prowess",
  "vom_figurine-of-wondrous-power-tin-dog",
  "vom_flash-bullet",
  "vom_flood-charm",
  "vom_glazed-battleaxe",
  "vom_glazed-greataxe",
  "vom_glazed-greatsword",
  "vom_glazed-handaxe",
  "vom_glazed-longsword",
  "vom_glazed-rapier",
  "vom_glazed-scimitar",
  "vom_glazed-shortsword",
  "vom_grifters-deck",
  "vom_hazelwood-wand",
  "vom_heat-stone",
  "vom_hunters-charm-1",
  "vom_knockabout-billet",
  "vom_kobold-firework",
  "vom_lantern-of-selective-illumination",
  "vom_last-chance-quiver",
  "vom_lifeblood-gear",
  "vom_linguists-cap",
  "vom_lockbreaker",
  "vom_longbow-of-accuracy",
  "vom_lucky-charm-of-the-monkey-king",
  "vom_lucky-coin",
  "vom_mask-of-the-war-chief",
  "vom_master-anglers-tackle",
  "vom_minor-minstrel",
  "vom_muffled-chain-mail",
  "vom_muffled-half-plate",
  "vom_muffled-padded",
  "vom_muffled-plate",
  "vom_muffled-ring-mail",
  "vom_muffled-scale-mail",
  "vom_muffled-splint",
  "vom_mug-of-merry-drinking",
  "vom_oakwood-wand",
  "vom_oracle-charm",
  "vom_pocket-spark",
  "vom_prospecting-compass",
  "vom_quill-of-scribing",
  "vom_quilted-bridge",
  "vom_ring-of-deceivers-warning",
  "vom_ring-of-remembrance",
  "vom_ring-of-shadows",
  "vom_ring-of-small-mercies",
  "vom_rod-of-repossession",
  "vom_rod-of-vapor",
  "vom_rod-of-verbatim",
  "vom_rod-of-warning",
  "vom_rope-seed",
  "vom_sacrificial-knife",
  "vom_scourge-of-devotion",
  "vom_scouts-coat",
  "vom_screaming-skull",
  "vom_sea-witchs-blade",
  "vom_second-wind",
  "vom_shield-of-the-fallen",
  "vom_shortbow-of-accuracy",
  "vom_siege-arrow",
  "vom_slick-cuirass",
  "vom_slimeblade-greatsword",
  "vom_slimeblade-longsword",
  "vom_slimeblade-rapier",
  "vom_slimeblade-scimitar",
  "vom_slimeblade-shortsword",
  "vom_slipshod-hammer",
  "vom_smugglers-bag",
  "vom_spectral-blade",
  "vom_spice-box-spoon",
  "vom_survival-knife",
  "vom_tactile-unguent",
  "vom_tailors-clasp",
  "vom_tracking-dart",
  "vom_vigilant-mug",
  "vom_wand-of-air-glyphs",
  "vom_wand-of-depth-detection",
  "vom_wand-of-direction",
  "vom_wand-of-extinguishing",
  "vom_wand-of-flame-control",
  "vom_wand-of-giggles",
  "vom_wand-of-guidance",
  "vom_wand-of-ignition",
  "vom_wand-of-resistance",
  "vom_wand-of-tears",
  "vom_wand-of-windows",
  "vom_warding-icon",
  "vom_wayfarers-candle",
  "vom_whispering-powder",
  "vom_white-dandelion",
  "vom_worry-stone"
] as const;

const weaponPlus1Keys = [
  "srd-2024_battleaxe-plus-1",
  "srd-2024_blowgun-plus-1",
  "srd-2024_club-plus-1",
  "srd-2024_dagger-plus-1",
  "srd-2024_dart-plus-1",
  "srd-2024_flail-plus-1",
  "srd-2024_glaive-plus-1",
  "srd-2024_greataxe-plus-1",
  "srd-2024_greatclub-plus-1",
  "srd-2024_greatsword-plus-1",
  "srd-2024_halberd-plus-1",
  "srd-2024_hand-crossbow-plus-1",
  "srd-2024_handaxe-plus-1",
  "srd-2024_heavy-crossbow-plus-1",
  "srd-2024_javelin-plus-1",
  "srd-2024_lance-plus-1",
  "srd-2024_light-crossbow-plus-1",
  "srd-2024_light-hammer-plus-1",
  "srd-2024_longbow-plus-1",
  "srd-2024_longsword-plus-1",
  "srd-2024_mace-plus-1",
  "srd-2024_maul-plus-1",
  "srd-2024_morningstar-plus-1",
  "srd-2024_musket-plus-1",
  "srd-2024_pike-plus-1",
  "srd-2024_pistol-plus-1",
  "srd-2024_quarterstaff-plus-1",
  "srd-2024_rapier-plus-1",
  "srd-2024_scimitar-plus-1",
  "srd-2024_shortbow-plus-1",
  "srd-2024_shortsword-plus-1",
  "srd-2024_sickle-plus-1",
  "srd-2024_sling-plus-1",
  "srd-2024_spear-plus-1",
  "srd-2024_trident-plus-1",
  "srd-2024_war-pick-plus-1",
  "srd-2024_warhammer-plus-1",
  "srd-2024_whip-plus-1"
] as const;

const armorPlus1Keys = [
  "srd-2024_breastplate-plus-1",
  "srd-2024_chain-mail-plus-1",
  "srd-2024_chain-shirt-plus-1",
  "srd-2024_half-plate-armor-plus-1",
  "srd-2024_hide-armor-plus-1",
  "srd-2024_leather-armor-plus-1",
  "srd-2024_padded-armor-plus-1",
  "srd-2024_plate-armor-plus-1",
  "srd-2024_ring-mail-plus-1",
  "srd-2024_scale-mail-plus-1",
  "srd-2024_splint-armor-plus-1",
  "srd-2024_studded-leather-armor-plus-1"
] as const;

const weaponOfWarningKeys = [
  "srd-2024_weapon-of-warning-battleaxe",
  "srd-2024_weapon-of-warning-blowgun",
  "srd-2024_weapon-of-warning-club",
  "srd-2024_weapon-of-warning-dagger",
  "srd-2024_weapon-of-warning-dart",
  "srd-2024_weapon-of-warning-flail",
  "srd-2024_weapon-of-warning-glaive",
  "srd-2024_weapon-of-warning-greataxe",
  "srd-2024_weapon-of-warning-greatclub",
  "srd-2024_weapon-of-warning-greatsword",
  "srd-2024_weapon-of-warning-halberd",
  "srd-2024_weapon-of-warning-hand-crossbow",
  "srd-2024_weapon-of-warning-handaxe",
  "srd-2024_weapon-of-warning-heavy-crossbow",
  "srd-2024_weapon-of-warning-javelin",
  "srd-2024_weapon-of-warning-lance",
  "srd-2024_weapon-of-warning-light-crossbow",
  "srd-2024_weapon-of-warning-light-hammer",
  "srd-2024_weapon-of-warning-longbow",
  "srd-2024_weapon-of-warning-longsword",
  "srd-2024_weapon-of-warning-mace",
  "srd-2024_weapon-of-warning-maul",
  "srd-2024_weapon-of-warning-morningstar",
  "srd-2024_weapon-of-warning-musket",
  "srd-2024_weapon-of-warning-pike",
  "srd-2024_weapon-of-warning-pistol",
  "srd-2024_weapon-of-warning-quarterstaff",
  "srd-2024_weapon-of-warning-rapier",
  "srd-2024_weapon-of-warning-scimitar",
  "srd-2024_weapon-of-warning-shortbow",
  "srd-2024_weapon-of-warning-shortsword",
  "srd-2024_weapon-of-warning-sickle",
  "srd-2024_weapon-of-warning-sling",
  "srd-2024_weapon-of-warning-spear",
  "srd-2024_weapon-of-warning-trident",
  "srd-2024_weapon-of-warning-war-pick",
  "srd-2024_weapon-of-warning-warhammer",
  "srd-2024_weapon-of-warning-whip"
] as const;

const armorOfResistanceKeys = [
  "srd-2024_armor-of-resistance-breastplate",
  "srd-2024_armor-of-resistance-chain-mail",
  "srd-2024_armor-of-resistance-chain-shirt",
  "srd-2024_armor-of-resistance-half-plate",
  "srd-2024_armor-of-resistance-hide-armor",
  "srd-2024_armor-of-resistance-leather",
  "srd-2024_armor-of-resistance-padded",
  "srd-2024_armor-of-resistance-plate",
  "srd-2024_armor-of-resistance-ring-mail",
  "srd-2024_armor-of-resistance-scale-mail",
  "srd-2024_armor-of-resistance-splint",
  "srd-2024_armor-of-resistance-studded-leather"
] as const;

const uncommonWondrousItemKeys = [
  "srd_restorative-ointment",
  "srd-2024_alchemy-jug",
  "srd-2024_amulet-of-proof-against-detection-and-location",
  "srd-2024_bag-of-holding",
  "srd-2024_bag-of-tricks",
  "srd-2024_boots-of-elvenkind",
  "srd-2024_boots-of-striding-and-springing",
  "srd-2024_boots-of-the-winding-path",
  "srd-2024_boots-of-the-winterlands",
  "srd-2024_bracers-of-archery",
  "srd-2024_brooch-of-shielding",
  "srd-2024_broom-of-flying",
  "srd-2024_cap-of-water-breathing",
  "srd-2024_circlet-of-blasting",
  "srd-2024_cloak-of-elvenkind",
  "srd-2024_cloak-of-protection",
  "srd-2024_cloak-of-the-manta-ray",
  "srd-2024_decanter-of-endless-water",
  "srd-2024_deck-of-illusions",
  "srd-2024_dust-of-disappearance",
  "srd-2024_dust-of-dryness",
  "srd-2024_dust-of-sneezing-and-choking",
  "srd-2024_efficient-quiver",
  "srd-2024_elemental-gem",
  "srd-2024_eversmoking-bottle",
  "srd-2024_eyes-of-charming",
  "srd-2024_eyes-of-minute-seeing",
  "srd-2024_eyes-of-the-eagle",
  "srd-2024_feather-token-anchor",
  "srd-2024_feather-token-fan",
  "srd-2024_feather-token-tree",
  "srd-2024_figurine-of-wondrous-power-silver-raven",
  "srd-2024_gauntlets-of-ogre-power",
  "srd-2024_gem-of-brightness",
  "srd-2024_gloves-of-missile-snaring",
  "srd-2024_gloves-of-swimming-and-climbing",
  "srd-2024_gloves-of-thievery",
  "srd-2024_goggles-of-night",
  "srd-2024_hat-of-disguise",
  "srd-2024_headband-of-intellect",
  "srd-2024_helm-of-awareness",
  "srd-2024_helm-of-comprehending-languages",
  "srd-2024_helm-of-telepathy",
  "srd-2024_lantern-of-revealing",
  "srd-2024_medallion-of-thoughts",
  "srd-2024_necklace-of-adaptation",
  "srd-2024_pearl-of-power",
  "srd-2024_periapt-of-health",
  "srd-2024_periapt-of-wound-closure",
  "srd-2024_pipes-of-haunting",
  "srd-2024_pipes-of-the-sewers",
  "srd-2024_robe-of-useful-items",
  "srd-2024_rope-of-climbing",
  "srd-2024_sending-stones",
  "srd-2024_slippers-of-spider-climbing",
  "srd-2024_stone-of-good-luck-luckstone",
  "srd-2024_wind-fan",
  "srd-2024_winged-boots",
  "srd-2024_wraps-of-unarmed-power-plus-1",
  "vom_air-seed",
  "vom_alchemical-lantern",
  "vom_amulet-of-sustaining-health",
  "vom_angelic-earrings",
  "vom_aurochs-bracers",
  "vom_bag-of-bramble-beasts",
  "vom_bagpipes-of-battle",
  "vom_baleful-wardrums",
  "vom_band-of-restraint",
  "vom_bandana-of-brachiation",
  "vom_bandana-of-bravado",
  "vom_banner-of-the-fortunate",
  "vom_battle-standard-of-passage",
  "vom_bear-paws",
  "vom_belt-of-the-wilds",
  "vom_berserkers-kilt-wolf",
  "vom_black-honey-buckle",
  "vom_black-phial",
  "vom_blinding-lantern",
  "vom_blood-mark",
  "vom_blood-pearl",
  "vom_bloodpearl-bracelet-silver",
  "vom_blue-willow-cloak",
  "vom_book-shroud",
  "vom_bookkeeper-inkpot",
  "vom_boots-of-solid-footing",
  "vom_bottled-boat",
  "vom_bracelet-of-the-fire-tender",
  "vom_braid-whip-clasp",
  "vom_briarthorn-bracers",
  "vom_brotherhood-of-fezzes",
  "vom_bubbling-retort",
  "vom_burglars-lock-and-key",
  "vom_butter-of-disbelief",
  "vom_candle-of-communion",
  "vom_candle-of-summoning",
  "vom_celestial-sextant",
  "vom_censer-of-dark-shadows",
  "vom_centaur-wrist-wraps",
  "vom_chalice-of-forbidden-ecstasies",
  "vom_chalk-of-exodus",
  "vom_charlatans-veneer",
  "vom_circlet-of-holly",
  "vom_circlet-of-persuasion",
  "vom_clarifying-goggles",
  "vom_cloak-of-coagulation",
  "vom_cloak-of-petals",
  "vom_cloak-of-sails",
  "vom_cloak-of-the-bearfolk",
  "vom_cloak-of-the-eel",
  "vom_cloak-of-the-empire",
  "vom_cloak-of-the-inconspicuous-rake",
  "vom_cloak-of-the-ram",
  "vom_cloak-of-wicked-wings",
  "vom_clockwork-gauntlet",
  "vom_clockwork-hand",
  "vom_collar-of-beast-armor",
  "vom_countermelody-crystals",
  "vom_crab-gloves",
  "vom_crafter-shabti",
  "vom_cravens-heart",
  "vom_crimson-carpet",
  "vom_decoy-card",
  "vom_defender-shabti",
  "vom_digger-shabti",
  "vom_dust-of-the-dead",
  "vom_earrings-of-the-eclipse",
  "vom_everflowing-bowl",
  "vom_eye-of-horus",
  "vom_fanged-mask",
  "vom_farhealing-bandages",
  "vom_fear-eaters-mask",
  "vom_figurine-of-wondrous-power-amber-bee",
  "vom_figurine-of-wondrous-power-basalt-cockatrice",
  "vom_firebird-feather",
  "vom_flute-of-saurian-summoning",
  "vom_fly-whisk-of-authority",
  "vom_gliding-cloak",
  "vom_goggles-of-firesight",
  "vom_goggles-of-shade",
  "vom_granny-wax",
  "vom_gritless-grease",
  "vom_headrest-of-the-cattle-queens",
  "vom_headscarf-of-the-oasis",
  "vom_heliotrope-heart",
  "vom_helm-of-the-slashing-fin",
  "vom_honey-lamp",
  "vom_honeypot-of-awakening",
  "vom_hunters-charm-2",
  "vom_jewelers-anvil",
  "vom_jungle-mess-kit",
  "vom_locket-of-remembrance",
  "vom_lodestone-caltrops",
  "vom_mantle-of-blood-vengeance",
  "vom_mapping-ink",
  "vom_mask-of-the-leaping-gazelle",
  "vom_medal-of-valor",
  "vom_menders-mark",
  "vom_mnemonic-fob",
  "vom_mock-box",
  "vom_neutralizing-bead",
  "vom_octopus-bracers",
  "vom_orb-of-enthralling-patterns",
  "vom_ouroboros-amulet",
  "vom_parasol-of-temperate-weather",
  "vom_periapt-of-eldritch-knowledge",
  "vom_phase-mirror",
  "vom_prayer-mat",
  "vom_primal-doom-of-anguish",
  "vom_quick-change-mirror",
  "vom_radiance-bomb",
  "vom_recording-book",
  "vom_relocation-cable",
  "vom_resolute-bracer",
  "vom_revenants-shawl",
  "vom_rug-of-safe-haven",
  "vom_saddle-of-the-cavalry-casters",
  "vom_sanctuary-shell",
  "vom_sandals-of-sand-skating",
  "vom_sandals-of-the-desert-wanderer",
  "vom_satchel-of-seawalking",
  "vom_scent-sponge",
  "vom_scorn-pouch",
  "vom_scoundrels-gambit",
  "vom_scrimshaw-comb",
  "vom_sentinel-portrait",
  "vom_serpentine-bracers",
  "vom_shadowhounds-muzzle",
  "vom_shifting-shirt",
  "vom_shoes-of-the-shingled-canopy",
  "vom_signaling-compass",
  "vom_silver-skeleton-key",
  "vom_silver-string",
  "vom_skullcap-of-deep-wisdom",
  "vom_sleep-pellet",
  "vom_slippers-of-the-cat",
  "vom_spider-grenade",
  "vom_sturdy-crawling-cloak",
  "vom_swashing-plumage",
  "vom_talking-tablets",
  "vom_three-section-boots",
  "vom_throttlers-gauntlets",
  "vom_thunderous-kazoo",
  "vom_toothsome-purse",
  "vom_treebleed-bucket",
  "vom_umber-beans",
  "vom_venomous-fangs",
  "vom_verminous-snipsnaps",
  "vom_ward-against-wild-appetites",
  "vom_windwalker-boots",
  "vom_witch-ward-bottle",
  "vom_worg-salve",
  "vom_wraithstone"
] as const;

const weaponPlus2Keys = [
  "srd-2024_battleaxe-plus-2",
  "srd-2024_blowgun-plus-2",
  "srd-2024_club-plus-2",
  "srd-2024_dagger-plus-2",
  "srd-2024_dart-plus-2",
  "srd-2024_flail-plus-2",
  "srd-2024_glaive-plus-2",
  "srd-2024_greataxe-plus-2",
  "srd-2024_greatclub-plus-2",
  "srd-2024_greatsword-plus-2",
  "srd-2024_halberd-plus-2",
  "srd-2024_hand-crossbow-plus-2",
  "srd-2024_handaxe-plus-2",
  "srd-2024_heavy-crossbow-plus-2",
  "srd-2024_javelin-plus-2",
  "srd-2024_lance-plus-2",
  "srd-2024_light-crossbow-plus-2",
  "srd-2024_light-hammer-plus-2",
  "srd-2024_longbow-plus-2",
  "srd-2024_longsword-plus-2",
  "srd-2024_mace-plus-2",
  "srd-2024_maul-plus-2",
  "srd-2024_morningstar-plus-2",
  "srd-2024_musket-plus-2",
  "srd-2024_pike-plus-2",
  "srd-2024_pistol-plus-2",
  "srd-2024_quarterstaff-plus-2",
  "srd-2024_rapier-plus-2",
  "srd-2024_scimitar-plus-2",
  "srd-2024_shortbow-plus-2",
  "srd-2024_shortsword-plus-2",
  "srd-2024_sickle-plus-2",
  "srd-2024_sling-plus-2",
  "srd-2024_spear-plus-2",
  "srd-2024_trident-plus-2",
  "srd-2024_war-pick-plus-2",
  "srd-2024_warhammer-plus-2",
  "srd-2024_whip-plus-2"
] as const;

const armorPlus2Keys = [
  "srd-2024_breastplate-plus-2",
  "srd-2024_chain-mail-plus-2",
  "srd-2024_chain-shirt-plus-2",
  "srd-2024_half-plate-armor-plus-2",
  "srd-2024_hide-armor-plus-2",
  "srd-2024_leather-armor-plus-2",
  "srd-2024_padded-armor-plus-2",
  "srd-2024_plate-armor-plus-2",
  "srd-2024_ring-mail-plus-2",
  "srd-2024_scale-mail-plus-2",
  "srd-2024_splint-armor-plus-2",
  "srd-2024_studded-leather-armor-plus-2"
] as const;

const flameTongueKeys = [
  "srd-2024_flame-tongue-battleaxe",
  "srd-2024_flame-tongue-club",
  "srd-2024_flame-tongue-dagger",
  "srd-2024_flame-tongue-dart",
  "srd-2024_flame-tongue-flail",
  "srd-2024_flame-tongue-glaive",
  "srd-2024_flame-tongue-greataxe",
  "srd-2024_flame-tongue-greatclub",
  "srd-2024_flame-tongue-greatsword",
  "srd-2024_flame-tongue-halberd",
  "srd-2024_flame-tongue-handaxe",
  "srd-2024_flame-tongue-javelin",
  "srd-2024_flame-tongue-lance",
  "srd-2024_flame-tongue-light-hammer",
  "srd-2024_flame-tongue-longsword",
  "srd-2024_flame-tongue-mace",
  "srd-2024_flame-tongue-maul",
  "srd-2024_flame-tongue-morningstar",
  "srd-2024_flame-tongue-pike",
  "srd-2024_flame-tongue-quarterstaff",
  "srd-2024_flame-tongue-rapier",
  "srd-2024_flame-tongue-scimitar",
  "srd-2024_flame-tongue-shortsword",
  "srd-2024_flame-tongue-sickle",
  "srd-2024_flame-tongue-spear",
  "srd-2024_flame-tongue-trident",
  "srd-2024_flame-tongue-war-pick",
  "srd-2024_flame-tongue-warhammer",
  "srd-2024_flame-tongue-whip"
] as const;

const rareWondrousItemKeys = [
  "srd_belt-of-dwarvenkind",
  "srd_belt-of-hill-giant-strength",
  "srd_feather-token",
  "srd_horn-of-valhalla-brass",
  "srd_horn-of-valhalla-silver",
  "srd_ioun-stone-agility",
  "srd_ioun-stone-awareness",
  "srd_ioun-stone-protection",
  "srd_ioun-stone-reserve",
  "srd_ioun-stone-sustenance",
  "srd_iron-bands-of-binding",
  "srd_potion-of-fire-giant-strength",
  "srd-2024_amulet-of-health",
  "srd-2024_bag-of-beans",
  "srd-2024_bead-of-force",
  "srd-2024_belt-of-giant-strength-hill",
  "srd-2024_boots-of-levitation",
  "srd-2024_boots-of-speed",
  "srd-2024_bowl-of-commanding-water-elementals",
  "srd-2024_bracers-of-defense",
  "srd-2024_brazier-of-commanding-fire-elementals",
  "srd-2024_cape-of-the-mountebank",
  "srd-2024_censer-of-controlling-air-elementals",
  "srd-2024_chime-of-opening",
  "srd-2024_cloak-of-displacement",
  "srd-2024_cloak-of-the-bat",
  "srd-2024_cube-of-force",
  "srd-2024_dimensional-shackles",
  "srd-2024_feather-token-bird",
  "srd-2024_feather-token-swan-boat",
  "srd-2024_feather-token-whip",
  "srd-2024_figurine-of-wondrous-power-bronze-griffon",
  "srd-2024_figurine-of-wondrous-power-ebony-fly",
  "srd-2024_figurine-of-wondrous-power-golden-lions",
  "srd-2024_figurine-of-wondrous-power-ivory-goats",
  "srd-2024_figurine-of-wondrous-power-marble-elephant",
  "srd-2024_figurine-of-wondrous-power-onyx-dog",
  "srd-2024_figurine-of-wondrous-power-serpentine-owl",
  "srd-2024_folding-boat",
  "srd-2024_gem-of-seeing",
  "srd-2024_handy-haversack",
  "srd-2024_helm-of-teleportation",
  "srd-2024_horn-of-blasting",
  "srd-2024_horseshoes-of-speed",
  "srd-2024_instant-fortress",
  "srd-2024_iron-bands",
  "srd-2024_mantle-of-spell-resistance",
  "srd-2024_necklace-of-fireballs",
  "srd-2024_necklace-of-prayer-beads",
  "srd-2024_periapt-of-proof-against-poison",
  "srd-2024_portable-hole",
  "srd-2024_robe-of-eyes",
  "srd-2024_rope-of-entanglement",
  "srd-2024_stone-of-controlling-earth-elementals",
  "srd-2024_wings-of-flying",
  "srd-2024_wraps-of-unarmed-power-plus-2",
  "vom_alabaster-salt-shaker",
  "vom_amulet-of-memory",
  "vom_amulet-of-the-oracle",
  "vom_amulet-of-whirlwinds",
  "vom_ankh-of-aten",
  "vom_arcanaphage-stone",
  "vom_baba-yagas-cinderskull",
  "vom_bag-of-traps",
  "vom_band-of-iron-thorns",
  "vom_bead-of-exsanguination",
  "vom_bed-of-spikes",
  "vom_berserkers-kilt-elk",
  "vom_bloodpearl-bracelet-gold",
  "vom_blue-rose",
  "vom_bone-skeleton-key",
  "vom_boots-of-pouncing",
  "vom_boots-of-the-grandmother",
  "vom_boots-of-the-swift-striker",
  "vom_box-of-secrets",
  "vom_brass-snake-ball",
  "vom_cape-of-targeting",
  "vom_captains-flag",
  "vom_captains-goggles",
  "vom_cataloguing-book",
  "vom_chamrosh-salve",
  "vom_clacking-teeth",
  "vom_cloak-of-squirrels",
  "vom_cloak-of-the-rat",
  "vom_clockwork-mynah-bird",
  "vom_clockwork-pendant",
  "vom_clockwork-spider-cloak",
  "vom_coffer-of-memory",
  "vom_communal-flute",
  "vom_corpsehunters-medallion",
  "vom_dancing-floret",
  "vom_dastardly-quill-and-parchment",
  "vom_deserters-boots",
  "vom_devil-shark-mask",
  "vom_djinn-vessel",
  "vom_doppelganger-ointment",
  "vom_dust-of-desiccation",
  "vom_earrings-of-the-agent",
  "vom_eyes-of-the-portal-masters",
  "vom_farmer-shabti",
  "vom_figurine-of-wondrous-power-coral-shark",
  "vom_figurine-of-wondrous-power-hematite-aurochs",
  "vom_figurine-of-wondrous-power-lapis-camel",
  "vom_figurine-of-wondrous-power-marble-mistwolf",
  "vom_figurine-of-wondrous-power-violet-octopoid",
  "vom_fleshspurned-mask",
  "vom_frost-pellet",
  "vom_gazebo-of-shade-and-shelter",
  "vom_ghost-thread",
  "vom_giggling-orb",
  "vom_gloves-of-the-magister",
  "vom_hallowed-effigy",
  "vom_hammer-of-decrees",
  "vom_hangmans-noose",
  "vom_harmonizing-instrument",
  "vom_hat-of-mental-acuity",
  "vom_headdress-of-majesty",
  "vom_holy-verdant-bat-droppings",
  "vom_honey-trap",
  "vom_hunters-charm-3",
  "vom_incense-of-recovery",
  "vom_ivy-crown-of-prophecy",
  "vom_justicars-mask",
  "vom_language-pyramid",
  "vom_lantern-of-auspex",
  "vom_leonino-wings",
  "vom_living-stake",
  "vom_loom-of-fate",
  "vom_lucky-eyepatch",
  "vom_lupine-crown",
  "vom_magma-mantle",
  "vom_mantle-of-the-forest-lord",
  "vom_mantle-of-the-lion",
  "vom_mantle-of-the-void",
  "vom_manual-of-exercise",
  "vom_manual-of-the-lesser-golem",
  "vom_marvelous-clockwork-mallard",
  "vom_matryoshka-dolls",
  "vom_memory-philter",
  "vom_mirror-of-eavesdropping",
  "vom_moon-through-the-trees",
  "vom_necromantic-ink",
  "vom_oculi-of-the-ancestor",
  "vom_ogres-pot",
  "vom_oni-mask",
  "vom_pearl-of-diving",
  "vom_periapt-of-proof-against-lies",
  "vom_pipes-of-madness",
  "vom_plumb-of-the-elements",
  "vom_plunderers-sea-chest",
  "vom_primal-doom-of-pain",
  "vom_radiant-bracers",
  "vom_rift-orb",
  "vom_river-token",
  "vom_rogues-aces",
  "vom_scalehide-cream",
  "vom_scarab-of-rebirth",
  "vom_scarf-of-deception",
  "vom_scrimshaw-parrot",
  "vom_seneschals-gloves",
  "vom_shadow-tome",
  "vom_shark-tooth-crown",
  "vom_sheeshah-of-revelations",
  "vom_silvered-oar",
  "vom_skalds-harp",
  "vom_skipstone",
  "vom_snake-basket",
  "vom_song-saddle-of-the-khan",
  "vom_spell-disruptor-horn",
  "vom_spyglass-of-summoning",
  "vom_stonechewer-gauntlets",
  "vom_storytellers-pipe",
  "vom_swolbold-wraps",
  "vom_talking-torches",
  "vom_teapot-of-soothing",
  "vom_thornish-nocturnal",
  "vom_tick-stop-watch",
  "vom_timeworn-timepiece",
  "vom_tome-of-knowledge",
  "vom_torc-of-the-comet",
  "vom_umbral-lantern",
  "vom_unerring-dowsing-rod",
  "vom_vengeful-coat",
  "vom_vessel-of-deadly-venoms",
  "vom_vial-of-sunlight",
  "vom_vielle-of-weirding-and-warding",
  "vom_voidskin-cloak",
  "vom_warrior-shabti",
  "vom_whispering-cloak",
  "vom_ziphian-eye-amulet"
] as const;

export const artificerReplicateMagicItemPlanGroups = [
  {
    level: 2,
    label: "Artificer Plan Level 2+",
    options: [
      { level: 2, key: "alchemy-jug", label: "Alchemy Jug", itemKeys: ["srd-2024_alchemy-jug"] },
      {
        level: 2,
        key: "bag-of-holding",
        label: "Bag of Holding",
        itemKeys: ["srd-2024_bag-of-holding"]
      },
      {
        level: 2,
        key: "cap-of-water-breathing",
        label: "Cap of Water Breathing",
        itemKeys: ["srd-2024_cap-of-water-breathing"]
      },
      {
        level: 2,
        key: "common-magic-item",
        label: "Common magic item that isn't a Potion, a Scroll, or cursed",
        itemKeys: commonMagicItemKeys
      },
      {
        level: 2,
        key: "goggles-of-night",
        label: "Goggles of Night",
        itemKeys: ["srd-2024_goggles-of-night"]
      },
      {
        level: 2,
        key: "manifold-tool",
        label: "Manifold Tool",
        itemKeys: ["srd-2024_manifold-tool"]
      },
      {
        level: 2,
        key: "repeating-shot",
        label: "Repeating Shot",
        itemKeys: ["srd-2024_repeating-shot"]
      },
      {
        level: 2,
        key: "returning-weapon",
        label: "Returning Weapon",
        itemKeys: ["srd-2024_returning-weapon"]
      },
      {
        level: 2,
        key: "rope-of-climbing",
        label: "Rope of Climbing",
        itemKeys: ["srd-2024_rope-of-climbing"]
      },
      {
        level: 2,
        key: "sending-stones",
        label: "Sending Stones",
        itemKeys: ["srd-2024_sending-stones"]
      },
      { level: 2, key: "shield-plus-1", label: "Shield +1", itemKeys: ["srd-2024_shield-plus-1"] },
      {
        level: 2,
        key: "wand-of-magic-detection",
        label: "Wand of Magic Detection",
        itemKeys: ["srd-2024_wand-of-magic-detection"]
      },
      {
        level: 2,
        key: "wand-of-secrets",
        label: "Wand of Secrets",
        itemKeys: ["srd-2024_wand-of-secrets"]
      },
      {
        level: 2,
        key: "wand-of-the-war-mage-plus-1",
        label: "Wand of the War Mage +1",
        itemKeys: ["srd-2024_wand-of-the-war-mage-plus-1"]
      },
      { level: 2, key: "weapon-plus-1", label: "Weapon +1", itemKeys: weaponPlus1Keys },
      {
        level: 2,
        key: "wraps-of-unarmed-power-plus-1",
        label: "+1 Wraps of Unarmed Power",
        itemKeys: ["srd-2024_wraps-of-unarmed-power-plus-1"]
      }
    ]
  },
  {
    level: 6,
    label: "Artificer Plan Level 6+",
    options: [
      { level: 6, key: "armor-plus-1", label: "Armor +1", itemKeys: armorPlus1Keys },
      {
        level: 6,
        key: "boots-of-elvenkind",
        label: "Boots of Elvenkind",
        itemKeys: ["srd-2024_boots-of-elvenkind"]
      },
      {
        level: 6,
        key: "boots-of-the-winding-path",
        label: "Boots of the Winding Path",
        itemKeys: ["srd-2024_boots-of-the-winding-path"]
      },
      {
        level: 6,
        key: "cloak-of-elvenkind",
        label: "Cloak of Elvenkind",
        itemKeys: ["srd-2024_cloak-of-elvenkind"]
      },
      {
        level: 6,
        key: "cloak-of-the-manta-ray",
        label: "Cloak of the Manta Ray",
        itemKeys: ["srd-2024_cloak-of-the-manta-ray"]
      },
      {
        level: 6,
        key: "dazzling-weapon",
        label: "Dazzling Weapon",
        itemKeys: ["srd-2024_dazzling-weapon"]
      },
      {
        level: 6,
        key: "eyes-of-charming",
        label: "Eyes of Charming",
        itemKeys: ["srd-2024_eyes-of-charming"]
      },
      {
        level: 6,
        key: "eyes-of-minute-seeing",
        label: "Eyes of Minute Seeing",
        itemKeys: ["srd-2024_eyes-of-minute-seeing"]
      },
      {
        level: 6,
        key: "gloves-of-thievery",
        label: "Gloves of Thievery",
        itemKeys: ["srd-2024_gloves-of-thievery"]
      },
      {
        level: 6,
        key: "helm-of-awareness",
        label: "Helm of Awareness",
        itemKeys: ["srd-2024_helm-of-awareness"]
      },
      {
        level: 6,
        key: "lantern-of-revealing",
        label: "Lantern of Revealing",
        itemKeys: ["srd-2024_lantern-of-revealing"]
      },
      {
        level: 6,
        key: "mind-sharpener",
        label: "Mind Sharpener",
        itemKeys: ["srd-2024_mind-sharpener"]
      },
      {
        level: 6,
        key: "necklace-of-adaptation",
        label: "Necklace of Adaptation",
        itemKeys: ["srd-2024_necklace-of-adaptation"]
      },
      {
        level: 6,
        key: "pipes-of-haunting",
        label: "Pipes of Haunting",
        itemKeys: ["srd-2024_pipes-of-haunting"]
      },
      {
        level: 6,
        key: "repulsion-shield",
        label: "Repulsion Shield",
        itemKeys: ["srd-2024_repulsion-shield"]
      },
      {
        level: 6,
        key: "ring-of-swimming",
        label: "Ring of Swimming",
        itemKeys: ["srd-2024_ring-of-swimming"]
      },
      {
        level: 6,
        key: "ring-of-water-walking",
        label: "Ring of Water Walking",
        itemKeys: ["srd-2024_ring-of-water-walking"]
      },
      {
        level: 6,
        key: "sentinel-shield",
        label: "Sentinel Shield",
        itemKeys: ["srd-2024_sentinel-shield"]
      },
      {
        level: 6,
        key: "spell-refueling-ring",
        label: "Spell-Refueling Ring",
        itemKeys: ["srd-2024_spell-refueling-ring"]
      },
      {
        level: 6,
        key: "wand-of-magic-missiles",
        label: "Wand of Magic Missiles",
        itemKeys: ["srd-2024_wand-of-magic-missiles"]
      },
      { level: 6, key: "wand-of-web", label: "Wand of Web", itemKeys: ["srd-2024_wand-of-web"] },
      {
        level: 6,
        key: "weapon-of-warning",
        label: "Weapon of Warning",
        itemKeys: weaponOfWarningKeys
      }
    ]
  },
  {
    level: 10,
    label: "Artificer Plan Level 10+",
    options: [
      {
        level: 10,
        key: "armor-of-resistance",
        label: "Armor of Resistance",
        itemKeys: armorOfResistanceKeys
      },
      {
        level: 10,
        key: "dagger-of-venom",
        label: "Dagger of Venom",
        itemKeys: ["srd-2024_dagger-of-venom"]
      },
      { level: 10, key: "elven-chain", label: "Elven Chain", itemKeys: ["srd_elven-chain"] },
      {
        level: 10,
        key: "ring-of-feather-falling",
        label: "Ring of Feather Falling",
        itemKeys: ["srd-2024_ring-of-feather-falling"]
      },
      {
        level: 10,
        key: "ring-of-jumping",
        label: "Ring of Jumping",
        itemKeys: ["srd-2024_ring-of-jumping"]
      },
      {
        level: 10,
        key: "ring-of-mind-shielding",
        label: "Ring of Mind Shielding",
        itemKeys: ["srd-2024_ring-of-mind-shielding"]
      },
      { level: 10, key: "shield-plus-2", label: "Shield +2", itemKeys: ["srd-2024_shield-plus-2"] },
      {
        level: 10,
        key: "uncommon-wondrous-item",
        label: "Uncommon Wondrous Item that isn't cursed",
        itemKeys: uncommonWondrousItemKeys
      },
      {
        level: 10,
        key: "wand-of-the-war-mage-plus-2",
        label: "Wand of the War Mage +2",
        itemKeys: ["srd-2024_wand-of-the-war-mage-plus-2"]
      },
      { level: 10, key: "weapon-plus-2", label: "Weapon +2", itemKeys: weaponPlus2Keys },
      {
        level: 10,
        key: "wraps-of-unarmed-power-plus-2",
        label: "+2 Wraps of Unarmed Power",
        itemKeys: ["srd-2024_wraps-of-unarmed-power-plus-2"]
      }
    ]
  },
  {
    level: 14,
    label: "Artificer Plan Level 14+",
    options: [
      { level: 14, key: "armor-plus-2", label: "Armor +2", itemKeys: armorPlus2Keys },
      {
        level: 14,
        key: "arrow-catching-shield",
        label: "Arrow-Catching Shield",
        itemKeys: ["srd-2024_arrow-catching-shield"]
      },
      { level: 14, key: "flame-tongue", label: "Flame Tongue", itemKeys: flameTongueKeys },
      {
        level: 14,
        key: "rare-wondrous-item",
        label: "Rare Wondrous Item that isn't cursed",
        itemKeys: rareWondrousItemKeys
      },
      {
        level: 14,
        key: "ring-of-free-action",
        label: "Ring of Free Action",
        itemKeys: ["srd-2024_ring-of-free-action"]
      },
      {
        level: 14,
        key: "ring-of-protection",
        label: "Ring of Protection",
        itemKeys: ["srd-2024_ring-of-protection"]
      },
      {
        level: 14,
        key: "ring-of-the-ram",
        label: "Ring of the Ram",
        itemKeys: ["srd-2024_ring-of-the-ram"]
      }
    ]
  }
] as const satisfies readonly ArtificerReplicateMagicItemPlanGroup[];

const planDefinitions: readonly ArtificerReplicateMagicItemPlanDefinition[] =
  artificerReplicateMagicItemPlanGroups.flatMap((group) => [...group.options]);
const planDefinitionsByKey = new Map<string, ArtificerReplicateMagicItemPlanDefinition>(
  planDefinitions.map((plan) => [plan.key, plan])
);
const aggregatePlanLevelByKey = new Map<string, ArtificerReplicateMagicItemPlanLevel>(
  levelAggregatePlanKeys
);

function uniqueKeys(keys: readonly string[]): string[] {
  return [...new Set(keys)];
}

function getPlanKeysThroughLevel(level: ArtificerReplicateMagicItemPlanLevel): string[] {
  return uniqueKeys(
    planDefinitions.filter((plan) => plan.level <= level).flatMap((plan) => [...plan.itemKeys])
  );
}

function getPlanDefinitionsForKeys(
  planKeys: readonly string[]
): ArtificerReplicateMagicItemPlanDefinition[] {
  const seenPlanKeys = new Set<string>();
  const selectedPlans: ArtificerReplicateMagicItemPlanDefinition[] = [];

  planKeys.forEach((planKey) => {
    if (seenPlanKeys.has(planKey)) {
      return;
    }

    const plan = planDefinitionsByKey.get(planKey);

    if (!plan) {
      return;
    }

    seenPlanKeys.add(planKey);
    selectedPlans.push(plan);
  });

  return selectedPlans;
}

export function getArtificerReplicateMagicItemPlanGroups() {
  return artificerReplicateMagicItemPlanGroups;
}

export function getArtificerReplicateMagicItemAllKeys(): string[] {
  return getPlanKeysThroughLevel(14);
}

export function getArtificerReplicateMagicItemKeysForPlan(planKey: string | undefined): string[] {
  if (!planKey || planKey === ARTIFICER_REPLICATE_MAGIC_ITEM_ALL_PLAN_KEY) {
    return getArtificerReplicateMagicItemAllKeys();
  }

  const aggregateLevel = aggregatePlanLevelByKey.get(planKey);
  if (aggregateLevel !== undefined) {
    return getPlanKeysThroughLevel(aggregateLevel);
  }

  const plan = planDefinitionsByKey.get(planKey);

  return plan ? [...plan.itemKeys] : [];
}

export function getArtificerReplicateMagicItemKeysForSelectedPlans(
  planKeys: readonly string[] | undefined,
  planKey: string | undefined
): string[] {
  if (planKeys === undefined) {
    return getArtificerReplicateMagicItemKeysForPlan(planKey);
  }

  const selectedPlans = getPlanDefinitionsForKeys(planKeys);

  if (planKey && planKey !== ARTIFICER_REPLICATE_MAGIC_ITEM_ALL_PLAN_KEY) {
    const selectedPlan = selectedPlans.find((plan) => plan.key === planKey);

    return selectedPlan ? [...selectedPlan.itemKeys] : [];
  }

  return uniqueKeys(selectedPlans.flatMap((plan) => [...plan.itemKeys]));
}

export function getArtificerReplicateMagicItemPlanGroupsForSelectedPlans(
  planKeys: readonly string[] | undefined
): ArtificerReplicateMagicItemPlanGroup[] {
  if (planKeys === undefined) {
    return [...artificerReplicateMagicItemPlanGroups];
  }

  const selectedPlanKeySet = new Set(getPlanDefinitionsForKeys(planKeys).map((plan) => plan.key));

  return artificerReplicateMagicItemPlanGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((plan) => selectedPlanKeySet.has(plan.key))
    }))
    .filter((group) => group.options.length > 0);
}

export function isArtificerReplicateMagicItemPlanKey(value: string | undefined): boolean {
  return (
    !value ||
    value === ARTIFICER_REPLICATE_MAGIC_ITEM_ALL_PLAN_KEY ||
    aggregatePlanLevelByKey.has(value) ||
    planDefinitionsByKey.has(value)
  );
}

export function isArtificerReplicateMagicItemSpecificPlanKey(value: string | undefined): boolean {
  return Boolean(value && planDefinitionsByKey.has(value));
}

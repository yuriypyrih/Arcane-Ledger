import type { SpellDescriptionEntry } from "../../../../codex/entries";

export function filterDescriptionEntries(
  description: SpellDescriptionEntry[],
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return description.filter(
    (entry): entry is string => typeof entry === "string" && predicate(entry)
  );
}

export function isChargerImprovedDashDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Improved Dash.</strong>");
}

export function isChargerChargeAttackDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Charge Attack.</strong>");
}

export function isCultOfDragonInitiateDragonsTerrorDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Dragon's Terror.</strong>");
}

export function isCultOfDragonInitiateInspiredByFearDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Inspired by Fear.</strong>");
}

export function isEmeraldEnclaveFledglingSpeakWithAnimalsDescriptionEntry(
  entry: string
): boolean {
  return entry.startsWith("<strong>Speak with Animals.</strong>");
}

export function isEmeraldEnclaveFledglingTagTeamDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Tag Team.</strong>");
}

export function isHarperAgentDistractingMelodyDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Distracting Melody.</strong>");
}

export function isPurpleDragonRookRallyingCryDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Rallying Cry.</strong>") ||
    entry.startsWith("Once you use this benefit,")
  );
}

export function isSpellfireSparkMagicAbsorptionDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Magic Absorption.</strong>");
}

export function isSpellfireSparkSpellfireFlameDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Spellfire Flame.</strong>");
}

export function isTyroOfTheGauntletStandAsOneDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Stand as One.</strong>");
}

export function isTyroOfTheGauntletVigilantDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Vigilant.</strong>");
}

export function isZhentarimRuffianExploitOpeningDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Exploit Opening.</strong>");
}

export function isZhentarimRuffianFamilyFirstDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Family First.</strong>");
}

export function isChefReplenishingMealDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Replenishing Meal.</strong>");
}

export function isChefBolsteringTreatsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Bolstering Treats.</strong>");
}

export function isArcheryWeaponActionDescriptionEntry(entry: string): boolean {
  return entry.trim().length > 0;
}

export function isDuelingWeaponActionDescriptionEntry(entry: string): boolean {
  return entry.trim().length > 0;
}

export function isBoonOfCombatProwessPeerlessAimDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Peerless Aim.</strong>");
}

export function isBoonOfDimensionalTravelBlinkStepsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Blink Steps.</strong>");
}

export function isBoonOfEnergyResistanceEnergyResistancesDescriptionEntry(
  entry: string
): boolean {
  return entry.startsWith("<strong>Energy Resistances.</strong>");
}

export function isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry(
  entry: string
): boolean {
  return entry.startsWith("<strong>Energy Redirection.</strong>");
}

export function isBoonOfFateImproveFateDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Improve Fate.</strong>");
}

export function isBoonOfIrresistibleOffenseDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Overcome Defenses.</strong>") ||
    entry.startsWith("<strong>Overwhelming Strike.</strong>")
  );
}

export function isBoonOfNightSpiritDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Merge with Shadows.</strong>") ||
    entry.startsWith("<strong>Shadowy Form.</strong>")
  );
}

export function isBoonOfRecoveryRecoverVitalityDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Recover Vitality.</strong>");
}

export function isBoonOfSpeedEscapeArtistDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Escape Artist.</strong>");
}

export function isBoonOfSpellRecallFreeCastingDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Free Casting.</strong>");
}

export function isThrownWeaponFightingWeaponActionDescriptionEntry(entry: string): boolean {
  return entry.trim().length > 0;
}

export function isTwoWeaponFightingWeaponActionDescriptionEntry(entry: string): boolean {
  return entry.trim().length > 0;
}

export function isUnarmedFightingWeaponActionDescriptionEntry(entry: string): boolean {
  return entry.trim().length > 0;
}

export function isCrusherWeaponActionDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Push.</strong>") ||
    entry.startsWith("<strong>Enhanced Critical.</strong>")
  );
}

export function isPiercerWeaponActionDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Puncture.</strong>") ||
    entry.startsWith("<strong>Enhanced Critical.</strong>")
  );
}

export function isSlasherWeaponActionDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Hamstring.</strong>") ||
    entry.startsWith("<strong>Enhanced Critical.</strong>")
  );
}

export function isPoisonerPotentPoisonDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Potent Poison.</strong>");
}

export function isPoisonerBrewPoisonDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Brew Poison.</strong>");
}

export function isSpeedyDashOverDifficultTerrainDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Dash over Difficult Terrain.</strong>");
}

export function isSpeedyAgileMovementDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Agile Movement.</strong>");
}

export function isWeaponMasterMasteryPropertyDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Mastery Property.</strong>");
}

export function isDefensiveDuelistParryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Parry.</strong>");
}

export function isPolearmMasterPoleStrikeDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Pole Strike.</strong>");
}

export function isPolearmMasterReactiveStrikeDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Reactive Strike.</strong>");
}

export function isSentinelGuardianHaltDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Guardian.</strong>") || entry.startsWith("<strong>Halt.</strong>");
}

export function isDurableSpeedyRecoveryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Speedy Recovery.</strong>");
}

export function isDualWielderEnhancedDualWieldingDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Enhanced Dual Wielding.</strong>");
}

export function isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Heavy Weapon Mastery.</strong>");
}

export function isGreatWeaponMasterHewDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Hew.</strong>");
}

export function isHeavyArmorMasterDamageReductionDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Damage Reduction.</strong>");
}

export function isInspiringLeaderBolsteringPerformanceDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Bolstering Performance.</strong>");
}

export function isKeenMindQuickStudyDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Quick Study.</strong>");
}

export function isObservantQuickSearchDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Quick Search.</strong>");
}

export function isMageSlayerConcentrationBreakerDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Concentration Breaker.</strong>");
}

export function isMageSlayerGuardedMindDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Guarded Mind.</strong>");
}

export function isMediumArmorMasterDexterousWearerDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Dexterous Wearer.</strong>");
}

export function isCrossbowExpertDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Ignore Loading.</strong>") ||
    entry.startsWith("<strong>Firing in Melee.</strong>") ||
    entry.startsWith("<strong>Dual Wielding.</strong>")
  );
}

export function isSharpshooterDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Bypass Cover.</strong>") ||
    entry.startsWith("<strong>Firing in Melee.</strong>") ||
    entry.startsWith("<strong>Long Shots.</strong>")
  );
}

export function isShieldMasterShieldBashDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Shield Bash.</strong>");
}

export function isShieldMasterInterposeShieldDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Interpose Shield.</strong>");
}

export function isSkulkerHideDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Fog of War.</strong>") ||
    entry.startsWith("<strong>Sniper.</strong>")
  );
}

export function isSpellSniperDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Bypass Cover.</strong>") ||
    entry.startsWith("<strong>Casting in Melee.</strong>") ||
    entry.startsWith("<strong>Increased Range.</strong>")
  );
}

export function isTelekineticMinorTelekinesisDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Minor Telekinesis.</strong>");
}

export function isTelekineticShoveDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Telekinetic Shove.</strong>");
}

export function isTelepathicUtteranceDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Telepathic Utterance.</strong>");
}

export function isTelepathicDetectThoughtsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Detect Thoughts.</strong>");
}

export function isWarCasterConcentrationDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Concentration.</strong>");
}

export function isWarCasterReactiveSpellDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Reactive Spell.</strong>");
}

export function isWarCasterSomaticComponentsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Somatic Components.</strong>");
}

export type SpellCastSlotPlanInput = {
  spellLevel: number;
  selectedSpellSlotLevel: number;
  wizardSignatureSpellLevel: number;
  fixedFreeCastSlotLevel?: number | null;
  selectedSpellIsWizardSpellMastery?: boolean;
  selectedSpellIsWizardSignatureSpell?: boolean;
  selectedSpellSupportsNaturalRecovery?: boolean;
  hasWizardSignatureSpellFreeCastAvailable?: boolean;
  druidNaturalRecoveryUsesRemaining?: number;
  sorceryPointsRemaining?: number;
  useStarMap?: boolean;
  useMagicInitiate?: boolean;
  useGenasiLineage?: boolean;
  useForestGnome?: boolean;
  useFiendishLegacy?: boolean;
  useHexMagic?: boolean;
  useFeyMagic?: boolean;
  useQuickRitual?: boolean;
  useShadowMagic?: boolean;
  useDetectThoughts?: boolean;
  useBoonOfRevelry?: boolean;
  useBoonOfSpellRecall?: boolean;
  useDruidWildCompanion?: boolean;
  useEmeraldEnclaveFledglingFreeUse?: boolean;
  useTwoHeartsOneMind?: boolean;
  usePsionicSorcery?: boolean;
  useStepsOfTheFey?: boolean;
  useBewitchingMagic?: boolean;
  useMistyWanderer?: boolean;
  useFeyReinforcements?: boolean;
  useDragonCompanion?: boolean;
  usePhantasmalCreatures?: boolean;
  useTelekineticMaster?: boolean;
  useNaturalRecovery?: boolean;
};

export type SpellCastSlotPlan = {
  minimumSlotLevel: number;
  slotLevel: number;
  castsWithoutSpellSlot: boolean;
  freeCasts: {
    fixedFreeCastSlot: boolean;
    spellMastery: boolean;
    signatureSpells: boolean;
    naturalRecovery: boolean;
    starMap: boolean;
    magicInitiate: boolean;
    genasiLineage: boolean;
    forestGnome: boolean;
    fiendishLegacy: boolean;
    hexMagic: boolean;
    feyMagic: boolean;
    quickRitual: boolean;
    shadowMagic: boolean;
    detectThoughts: boolean;
    boonOfRevelry: boolean;
    boonOfSpellRecall: boolean;
    druidWildCompanion: boolean;
    emeraldEnclaveFledgling: boolean;
    twoHeartsOneMind: boolean;
    psionicSorcery: boolean;
    stepsOfTheFey: boolean;
    bewitchingMagic: boolean;
    mistyWanderer: boolean;
    feyReinforcements: boolean;
    dragonCompanion: boolean;
    phantasmalCreatures: boolean;
    telekineticMaster: boolean;
  };
};

function clampNumber(value: number, minimum: number, maximum: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(minimum, Math.min(maximum, Math.floor(value)));
}

export function getSpellCastSlotPlan({
  spellLevel,
  selectedSpellSlotLevel,
  wizardSignatureSpellLevel,
  fixedFreeCastSlotLevel = null,
  selectedSpellIsWizardSpellMastery = false,
  selectedSpellIsWizardSignatureSpell = false,
  selectedSpellSupportsNaturalRecovery = false,
  hasWizardSignatureSpellFreeCastAvailable = false,
  druidNaturalRecoveryUsesRemaining = 0,
  sorceryPointsRemaining = 0,
  useStarMap = false,
  useMagicInitiate = false,
  useGenasiLineage = false,
  useForestGnome = false,
  useFiendishLegacy = false,
  useHexMagic = false,
  useFeyMagic = false,
  useQuickRitual = false,
  useShadowMagic = false,
  useDetectThoughts = false,
  useBoonOfRevelry = false,
  useBoonOfSpellRecall = false,
  useDruidWildCompanion = false,
  useEmeraldEnclaveFledglingFreeUse = false,
  useTwoHeartsOneMind = false,
  usePsionicSorcery = false,
  useStepsOfTheFey = false,
  useBewitchingMagic = false,
  useMistyWanderer = false,
  useFeyReinforcements = false,
  useDragonCompanion = false,
  usePhantasmalCreatures = false,
  useTelekineticMaster = false,
  useNaturalRecovery = false
}: SpellCastSlotPlanInput): SpellCastSlotPlan {
  const minimumSlotLevel = Math.max(1, spellLevel);
  const castsAtMinimumSlotLevel =
    useStarMap ||
    useMagicInitiate ||
    useGenasiLineage ||
    useForestGnome ||
    useFiendishLegacy ||
    useHexMagic ||
    useFeyMagic ||
    useQuickRitual ||
    useShadowMagic ||
    useDetectThoughts ||
    useBoonOfRevelry ||
    useBoonOfSpellRecall ||
    useDruidWildCompanion ||
    useEmeraldEnclaveFledglingFreeUse ||
    useTwoHeartsOneMind ||
    useStepsOfTheFey ||
    useBewitchingMagic ||
    useMistyWanderer ||
    useFeyReinforcements ||
    useDragonCompanion ||
    usePhantasmalCreatures;
  const slotLevel = castsAtMinimumSlotLevel
    ? minimumSlotLevel
    : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
  const fixedFreeCastSlot =
    fixedFreeCastSlotLevel !== null && slotLevel === fixedFreeCastSlotLevel;
  const spellMastery = selectedSpellIsWizardSpellMastery && slotLevel === minimumSlotLevel;
  const signatureSpells =
    selectedSpellIsWizardSignatureSpell &&
    slotLevel === wizardSignatureSpellLevel &&
    hasWizardSignatureSpellFreeCastAvailable;
  const naturalRecovery =
    useNaturalRecovery &&
    selectedSpellSupportsNaturalRecovery &&
    druidNaturalRecoveryUsesRemaining > 0 &&
    slotLevel === spellLevel;
  const psionicSorcery = usePsionicSorcery && sorceryPointsRemaining >= slotLevel;
  const freeCasts: SpellCastSlotPlan["freeCasts"] = {
    fixedFreeCastSlot,
    spellMastery,
    signatureSpells,
    naturalRecovery,
    starMap: useStarMap,
    magicInitiate: useMagicInitiate,
    genasiLineage: useGenasiLineage,
    forestGnome: useForestGnome,
    fiendishLegacy: useFiendishLegacy,
    hexMagic: useHexMagic,
    feyMagic: useFeyMagic,
    quickRitual: useQuickRitual,
    shadowMagic: useShadowMagic,
    detectThoughts: useDetectThoughts,
    boonOfRevelry: useBoonOfRevelry,
    boonOfSpellRecall: useBoonOfSpellRecall,
    druidWildCompanion: useDruidWildCompanion,
    emeraldEnclaveFledgling: useEmeraldEnclaveFledglingFreeUse,
    twoHeartsOneMind: useTwoHeartsOneMind,
    psionicSorcery,
    stepsOfTheFey: useStepsOfTheFey,
    bewitchingMagic: useBewitchingMagic,
    mistyWanderer: useMistyWanderer,
    feyReinforcements: useFeyReinforcements,
    dragonCompanion: useDragonCompanion,
    phantasmalCreatures: usePhantasmalCreatures,
    telekineticMaster: useTelekineticMaster
  };

  return {
    minimumSlotLevel,
    slotLevel,
    castsWithoutSpellSlot: Object.values(freeCasts).some(Boolean),
    freeCasts
  };
}

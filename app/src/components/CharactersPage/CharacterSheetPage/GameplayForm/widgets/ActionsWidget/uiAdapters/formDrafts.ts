import type { ActionsWidgetUiState } from "../types";
import type { ActionFormKind } from "./types";
const formDrafts = {
  "font-of-magic": () => ({ selectedFontOfMagicSelection: null }),
  "boon-fluid-forms-shapechanger": () => ({
    selectedFluidFormsMonster: null,
    isFluidFormsMonsterModalOpen: false
  }),
  "genie-magic-wish-magic": () => ({ selectedGenieMagicSpell: null }),
  "wild-shape": () => ({ selectedWildShapeMonsterSlug: null }),
  "wild-companion": () => ({
    selectedWildCompanionResource: "wild-shape",
    selectedWildCompanionSpellSlotLevel: 1
  }),
  "artificer-experimental-elixir": () => ({
    selectedExperimentalElixirOptionKey: null,
    selectedExperimentalElixirSpellSlotLevel: null
  }),
  "artificer-eldritch-cannon": () => ({ selectedArtificerEldritchCannonSpellSlotLevel: null }),
  "artificer-reanimated-companion": () => ({ selectedReanimatedCompanionDefinitions: [] }),
  "warlock-vestige-companion": () => ({ selectedVestigeCompanionDefinitions: [] }),
  "warlock-semblance-of-life": () => ({ selectedVestigeCompanionDefinitions: [] }),
  "artificer-steel-defender": () => ({ selectedArtificerSteelDefenderSpellSlotLevel: null }),
  "wild-resurgence": () => ({
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1
  }),
  "nature-magician": () => ({ selectedNatureMagicianSpellSlotLevel: null }),
  "lay-on-hands": () => ({
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: []
  }),
  "aasimar-healing-hands": () => ({ selectedAasimarHealingHandsTarget: "other" }),
  "keeper-of-souls": () => ({ selectedKeeperOfSoulsTarget: "self" }),
  "aasimar-celestial-revelation": () => ({ selectedAasimarCelestialRevelationOptionKey: null }),
  "third-eye": () => ({ selectedThirdEyeOptionKey: null }),
  "starry-form": () => ({ selectedStarryFormConstellation: null }),
  "wild-heart-rage": () => ({
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false
  })
} satisfies Partial<Record<ActionFormKind, () => Partial<ActionsWidgetUiState>>>;
export function createActionFormDraftState() {
  return {
    ...formDrafts["font-of-magic"](),
    ...formDrafts["boon-fluid-forms-shapechanger"](),
    ...formDrafts["genie-magic-wish-magic"](),
    ...formDrafts["wild-shape"](),
    ...formDrafts["wild-companion"](),
    ...formDrafts["artificer-experimental-elixir"](),
    ...formDrafts["artificer-eldritch-cannon"](),
    ...formDrafts["artificer-steel-defender"](),
    ...formDrafts["artificer-reanimated-companion"](),
    ...formDrafts["warlock-vestige-companion"](),
    ...formDrafts["wild-resurgence"](),
    ...formDrafts["nature-magician"](),
    ...formDrafts["lay-on-hands"](),
    ...formDrafts["aasimar-healing-hands"](),
    ...formDrafts["keeper-of-souls"](),
    ...formDrafts["aasimar-celestial-revelation"](),
    ...formDrafts["third-eye"](),
    ...formDrafts["starry-form"](),
    ...formDrafts["wild-heart-rage"]()
  };
}

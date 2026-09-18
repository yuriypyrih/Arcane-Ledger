import { describe, expect, it } from "vitest";
import {
  getSpellCastSlotPlan,
  type SpellCastSlotPlanInput
} from "../../src/components/CharactersPage/CharacterSheetPage/SpellCastingForm/spellCastSlotPlan";
const ordinary: SpellCastSlotPlanInput = {
  spellLevel: 1,
  selectedSpellSlotLevel: 1,
  wizardSignatureSpellLevel: 3
};

describe("casting payment selection", () => {
  it("an ordinary prepared or always-prepared spell requires the selected slot", () => {
    expect(getSpellCastSlotPlan(ordinary)).toMatchObject({
      slotLevel: 1,
      castsWithoutSpellSlot: false
    });
    expect(getSpellCastSlotPlan({ ...ordinary, selectedSpellSlotLevel: 3 })).toMatchObject({
      slotLevel: 3,
      castsWithoutSpellSlot: false
    });
  });
  it("a Magic Initiate free use casts at base level, not at the previously selected upcast level", () => {
    expect(
      getSpellCastSlotPlan({ ...ordinary, selectedSpellSlotLevel: 3, useMagicInitiate: true })
    ).toMatchObject({
      slotLevel: 1,
      castsWithoutSpellSlot: true,
      freeCasts: { magicInitiate: true }
    });
  });
  it("Spell Mastery is free at base level but upcasting spends a slot", () => {
    expect(
      getSpellCastSlotPlan({ ...ordinary, selectedSpellIsWizardSpellMastery: true })
        .castsWithoutSpellSlot
    ).toBe(true);
    expect(
      getSpellCastSlotPlan({
        ...ordinary,
        selectedSpellSlotLevel: 2,
        selectedSpellIsWizardSpellMastery: true
      }).castsWithoutSpellSlot
    ).toBe(false);
  });
  it.each([false, true])(
    "Signature Spell free casting requires an available use (%s)",
    (available) => {
      expect(
        getSpellCastSlotPlan({
          ...ordinary,
          spellLevel: 3,
          selectedSpellSlotLevel: 3,
          selectedSpellIsWizardSignatureSpell: true,
          hasWizardSignatureSpellFreeCastAvailable: available
        }).castsWithoutSpellSlot
      ).toBe(available);
    }
  );
  it("Psionic Sorcery requires enough points for the actual casting level", () => {
    expect(
      getSpellCastSlotPlan({
        ...ordinary,
        selectedSpellSlotLevel: 3,
        usePsionicSorcery: true,
        sorceryPointsRemaining: 2
      }).castsWithoutSpellSlot
    ).toBe(false);
    expect(
      getSpellCastSlotPlan({
        ...ordinary,
        selectedSpellSlotLevel: 3,
        usePsionicSorcery: true,
        sorceryPointsRemaining: 3
      }).castsWithoutSpellSlot
    ).toBe(true);
  });
  it("Natural Recovery cannot provide an exhausted or upcast free use", () => {
    const plan = {
      ...ordinary,
      selectedSpellSupportsNaturalRecovery: true,
      useNaturalRecovery: true
    };
    expect(
      getSpellCastSlotPlan({ ...plan, druidNaturalRecoveryUsesRemaining: 0 }).castsWithoutSpellSlot
    ).toBe(false);
    expect(
      getSpellCastSlotPlan({ ...plan, druidNaturalRecoveryUsesRemaining: 1 }).castsWithoutSpellSlot
    ).toBe(true);
    expect(
      getSpellCastSlotPlan({
        ...plan,
        druidNaturalRecoveryUsesRemaining: 1,
        selectedSpellSlotLevel: 2
      }).castsWithoutSpellSlot
    ).toBe(false);
  });
});

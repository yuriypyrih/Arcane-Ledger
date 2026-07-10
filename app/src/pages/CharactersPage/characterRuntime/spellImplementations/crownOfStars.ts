import type { SpellImplementationContributionSpec } from "./types";

export const crownOfStarsSpellId = "spell-crown-of-stars";
export const crownOfStarsStatusValue = "Crown of Stars";

const crownOfStarsBaseSlotLevel = 7;
const crownOfStarsBaseMotes = 7;
const crownOfStarsMotesPerUpcastLevel = 2;

export function getCrownOfStarsMoteCount(spellSlotLevel: number | null | undefined): number {
  const normalizedSlotLevel =
    typeof spellSlotLevel === "number" && Number.isFinite(spellSlotLevel)
      ? Math.max(crownOfStarsBaseSlotLevel, Math.floor(spellSlotLevel))
      : crownOfStarsBaseSlotLevel;

  return (
    crownOfStarsBaseMotes +
    (normalizedSlotLevel - crownOfStarsBaseSlotLevel) * crownOfStarsMotesPerUpcastLevel
  );
}

export const crownOfStarsSpellImplementationSpec: SpellImplementationContributionSpec = {
  source: {
    type: "spell",
    id: crownOfStarsSpellId,
    label: crownOfStarsStatusValue
  },
  spellId: crownOfStarsSpellId,
  suppressCastAttackRoll: true,
  getStatusOptions: ({ sourceSpellSlotLevel, spellSlotLevel }) => {
    const moteCount = getCrownOfStarsMoteCount(sourceSpellSlotLevel ?? spellSlotLevel);

    return {
      noteCharges: {
        current: moteCount,
        max: moteCount
      }
    };
  }
};

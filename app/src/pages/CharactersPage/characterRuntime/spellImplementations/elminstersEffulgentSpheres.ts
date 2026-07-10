import type { SpellImplementationContributionSpec } from "./types";

export const elminstersEffulgentSpheresSpellId = "spell-elminsters-effulgent-spheres";
export const elminstersEffulgentSpheresStatusValue = "Elminster's Effulgent Spheres";

const elminstersEffulgentSpheresBaseSlotLevel = 6;
const elminstersEffulgentSpheresBaseSpheres = 6;

export function getElminstersEffulgentSpheresSphereCount(
  spellSlotLevel: number | null | undefined
): number {
  const normalizedSlotLevel =
    typeof spellSlotLevel === "number" && Number.isFinite(spellSlotLevel)
      ? Math.max(elminstersEffulgentSpheresBaseSlotLevel, Math.floor(spellSlotLevel))
      : elminstersEffulgentSpheresBaseSlotLevel;

  return (
    elminstersEffulgentSpheresBaseSpheres +
    (normalizedSlotLevel - elminstersEffulgentSpheresBaseSlotLevel)
  );
}

export const elminstersEffulgentSpheresSpellImplementationSpec: SpellImplementationContributionSpec =
  {
    source: {
      type: "spell",
      id: elminstersEffulgentSpheresSpellId,
      label: elminstersEffulgentSpheresStatusValue
    },
    spellId: elminstersEffulgentSpheresSpellId,
    suppressCastAttackRoll: true,
    getStatusOptions: ({ sourceSpellSlotLevel, spellSlotLevel }) => {
      const sphereCount = getElminstersEffulgentSpheresSphereCount(
        sourceSpellSlotLevel ?? spellSlotLevel
      );

      return {
        noteCharges: {
          current: sphereCount,
          max: sphereCount
        }
      };
    }
  };

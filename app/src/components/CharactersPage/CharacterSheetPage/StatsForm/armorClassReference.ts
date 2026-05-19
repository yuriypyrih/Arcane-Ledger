import type {
  ArmorClassBreakdown,
  ArmorClassResolution
} from "../../../../pages/CharactersPage/armor";
import { formatCustomTraitBonusFormulaTerm } from "../../../../pages/CharactersPage/customTraitEffects";
import { formatSignedFormulaTerm } from "../../../../pages/CharactersPage/shared/formulas";
import type { ReferenceDetailCard } from "./StatReferenceDrawer";

function formatArmorClassTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  if (["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(label)) {
    return label;
  }

  return label;
}

export function formatArmorClassFormula(breakdown: ArmorClassBreakdown): string {
  const terms = breakdown.entries.map(
    (entry) =>
      entry.formulaLabel ??
      formatCustomTraitBonusFormulaTerm(entry) ??
      formatSignedFormulaTerm(entry.value, formatArmorClassTermLabel(entry.label, breakdown.source))
  );

  return `${breakdown.total} AC = ${terms.join(" ")}`;
}

export function getArmorClassReferenceDetailCards(
  resolution: ArmorClassResolution
): ReferenceDetailCard[] {
  return [
    {
      label: "AC Formula",
      value: formatArmorClassFormula(resolution.activeFormula.breakdown),
      variant: "formula"
    }
  ];
}

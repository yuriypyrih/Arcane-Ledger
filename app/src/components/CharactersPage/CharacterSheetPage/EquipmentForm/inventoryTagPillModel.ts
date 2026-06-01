import type { ReactNode } from "react";

export type InventoryTagPillType =
  | "onHand"
  | "worn"
  | "attuned"
  | "charges"
  | "modded"
  | "container"
  | "pack"
  | "spell"
  | "conjured"
  | "spellcastingFocus"
  | "feature";

export type InventoryTagPillProps = {
  type: InventoryTagPillType;
  label?: ReactNode;
  expandedText?: ReactNode;
  className?: string;
  inline?: boolean;
};

function splitExpandedLabel(label: string, prefix: string) {
  return label.startsWith(prefix) ? label.slice(prefix.length).trim() : null;
}

export function getInventoryTagPillProps(label: string): InventoryTagPillProps {
  const conjuredExpandedText = splitExpandedLabel(label, "Conjured:");
  const spellExpandedText = splitExpandedLabel(label, "Spell:");

  if (conjuredExpandedText) {
    return {
      type: "conjured",
      expandedText: conjuredExpandedText
    };
  }

  if (spellExpandedText) {
    return {
      type: "spell",
      expandedText: spellExpandedText
    };
  }

  switch (label) {
    case "On Hand":
      return { type: "onHand" };
    case "Worn":
      return { type: "worn" };
    case "Attuned":
      return { type: "attuned" };
    case "Modded":
      return { type: "modded" };
    case "Container":
      return { type: "container" };
    case "Pack":
      return { type: "pack" };
    case "Spell":
      return { type: "spell" };
    case "Conjured":
      return { type: "conjured" };
    case "Spellcasting Focus":
      return { type: "spellcastingFocus" };
    default:
      return { type: "feature", label };
  }
}

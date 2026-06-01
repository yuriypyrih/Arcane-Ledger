import clsx from "clsx";
import { Hand, Package, Shield, Sparkles, type LucideIcon } from "lucide-react";
import type { InventoryTagPillProps, InventoryTagPillType } from "./inventoryTagPillModel";
import styles from "./EquipmentForm.module.css";

type InventoryTagPillDefinition = {
  label: string;
  icon: LucideIcon | null;
  className: string;
};

const inventoryTagPillDefinitions: Record<InventoryTagPillType, InventoryTagPillDefinition> = {
  onHand: {
    label: "On Hand",
    icon: Hand,
    className: styles.inventoryTagPillOnHand
  },
  worn: {
    label: "Worn",
    icon: Shield,
    className: styles.inventoryTagPillWorn
  },
  attuned: {
    label: "Attuned",
    icon: Sparkles,
    className: styles.inventoryTagPillAttuned
  },
  charges: {
    label: "Charges",
    icon: null,
    className: styles.inventoryTagPillCharges
  },
  modded: {
    label: "Modded",
    icon: null,
    className: styles.inventoryTagPillModded
  },
  container: {
    label: "Container",
    icon: Package,
    className: styles.inventoryTagPillPack
  },
  pack: {
    label: "Pack",
    icon: Package,
    className: styles.inventoryTagPillPack
  },
  spell: {
    label: "Spell",
    icon: Sparkles,
    className: styles.inventoryTagPillSpell
  },
  conjured: {
    label: "Conjured",
    icon: null,
    className: styles.inventoryTagPillFeature
  },
  spellcastingFocus: {
    label: "Spellcasting Focus",
    icon: Sparkles,
    className: styles.inventoryTagPillSpellcastingFocus
  },
  feature: {
    label: "Feature",
    icon: null,
    className: styles.inventoryTagPillFeature
  }
};

function InventoryTagPill({
  type,
  label,
  expandedText,
  className,
  inline = false
}: InventoryTagPillProps) {
  const definition = inventoryTagPillDefinitions[type];
  const Icon = definition.icon;
  const contentLabel = label ?? definition.label;

  return (
    <span
      className={clsx(
        styles.inventoryTagPill,
        definition.className,
        inline && styles.inventoryTagPillInline,
        className
      )}
    >
      {Icon ? <Icon size={13} aria-hidden="true" /> : null}
      <span>
        {contentLabel}
        {expandedText ? (
          <>
            <span aria-hidden="true">: </span>
            <span>{expandedText}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}

export default InventoryTagPill;

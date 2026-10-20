import type { ResourceManagementModalAction } from "./ResourceManagementModal";

export function counterResourceActions({
  label,
  current,
  total,
  onUse,
  onRestore,
  onReset
}: {
  label: string;
  current: number;
  total: number;
  onUse: () => void;
  onRestore: () => void;
  onReset: () => void;
}): ResourceManagementModalAction[] {
  return [
    { label: "Use 1", onClick: onUse, disabled: current <= 0, ariaLabel: `Use 1 ${label}` },
    {
      label: "Reset 1",
      onClick: onRestore,
      disabled: current >= total,
      ariaLabel: `Reset 1 ${label}`
    },
    {
      label: "Reset All",
      onClick: onReset,
      disabled: current >= total,
      ariaLabel: `Reset all ${label}`
    }
  ];
}

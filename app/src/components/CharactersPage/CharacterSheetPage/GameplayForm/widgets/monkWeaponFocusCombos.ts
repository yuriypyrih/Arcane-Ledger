type MonkFocusComboOption = {
  label: string;
  cost: number;
  selected: boolean;
};

function formatOptionLabelList(labels: string[]): string {
  if (labels.length <= 1) {
    return labels[0] ?? "";
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function getMonkFocusComboDisabledReason(options: {
  focusPointsRemaining: number;
  currentOption: Omit<MonkFocusComboOption, "selected">;
  selectedOptions: MonkFocusComboOption[];
}): string | null {
  const activeOptions = [
    options.currentOption,
    ...options.selectedOptions.filter((option) => option.selected)
  ];

  if (activeOptions.length <= 1) {
    return null;
  }

  const requiredFocusPoints = activeOptions.reduce((sum, option) => sum + option.cost, 0);

  if (options.focusPointsRemaining >= requiredFocusPoints) {
    return null;
  }

  return `You need ${requiredFocusPoints} Focus Point${
    requiredFocusPoints === 1 ? "" : "s"
  } to use ${formatOptionLabelList(activeOptions.map((option) => option.label))} together.`;
}

import type {
  StarterPackEquipmentChoice,
  StarterPackEquipmentReference
} from "./type";

function getQuantityPrefix(reference: StarterPackEquipmentReference): string {
  if (!("quantity" in reference) || typeof reference.quantity !== "number" || reference.quantity <= 1) {
    return "";
  }

  return `${reference.quantity} `;
}

export function formatStarterPackEquipmentReference(
  reference: StarterPackEquipmentReference,
  selectionLabels?: Record<string, string>
): string {
  if (reference.type === "currency") {
    return `${reference.amount} ${reference.currency}`;
  }

  if (reference.type === "selected-tool") {
    const selectionLabel =
      (reference.selectionId ? selectionLabels?.[reference.selectionId] : null) ?? reference.label;

    return `${getQuantityPrefix(reference)}${selectionLabel}`;
  }

  return `${getQuantityPrefix(reference)}${reference.label}`;
}

export function formatStarterPackEquipmentChoice(
  choice: StarterPackEquipmentChoice,
  choiceIndex: number,
  options?: {
    includeOptionLabel?: boolean;
    selectionLabels?: Record<string, string>;
  }
): string {
  const entries = choice.map((reference) =>
    formatStarterPackEquipmentReference(reference, options?.selectionLabels)
  );
  const body = entries.join(", ");

  if (options?.includeOptionLabel === false) {
    return body;
  }

  return `Option ${String.fromCharCode(65 + choiceIndex)}: ${body}`;
}

export function formatStarterPackStartingEquipmentSummary(
  startingEquipment: StarterPackEquipmentChoice[]
): string {
  if (startingEquipment.length === 0) {
    return "None";
  }

  const optionLabel =
    startingEquipment.length === 2
      ? "Choose A or B"
      : startingEquipment.length === 3
        ? "Choose A, B, or C"
        : "Choose one option";

  return `${optionLabel}: ${startingEquipment
    .map((choice, choiceIndex) =>
      formatStarterPackEquipmentChoice(choice, choiceIndex, {
        includeOptionLabel: true
      })
    )
    .join("; ")}`;
}

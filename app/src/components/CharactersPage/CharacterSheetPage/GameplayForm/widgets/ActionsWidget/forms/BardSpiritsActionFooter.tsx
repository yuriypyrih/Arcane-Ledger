import { useState } from "react";
import type { Character } from "../../../../../../../types";
import {
  choosePendingSpirit,
  chooseSpiritActionKey,
  getBardSpiritsState,
  getSpiritOptions,
  resolveSpiritRoll
} from "../../../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfSpiritsState";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import SelectInput from "../../../../../FormInputs/SelectInput";
import ActionButton from "../../../../../../ActionButton";
import ActionShape from "../../../../../../ActionShape";
import DescriptionContent from "../../../../../../DescriptionContent/DescriptionContent";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import type { ActionFormFooterContext } from "../uiAdapters/types";
import styles from "../ActionsWidget.module.css";

export default function BardSpiritsActionFooter({ context }: { context: ActionFormFooterContext }) {
  const {
    character,
    selectedAction,
    onPersistCharacter,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason
  } = context;
  const [selection, setSelection] = useState("");
  const [firstRoll, setFirstRoll] = useState("");
  const [secondRoll, setSecondRoll] = useState("");
  if (selectedAction?.kind !== "feature") return null;
  const action = selectedAction.action;
  if (action.key !== chooseSpiritActionKey) return null;
  const state = getBardSpiritsState(character);
  const options = getSpiritOptions(character);
  const pending = state.pendingSpiritRolls?.[0];
  const selectedNumber = Number(selection);
  const spirit = options.find((entry) => entry.number === selectedNumber);
  const selectedOptions = pending?.results
    ? options.filter(
        (entry) =>
          pending.results?.[0] === pending.results?.[1] || pending.results?.includes(entry.number)
      )
    : options;
  const manualRollsValid =
    pending &&
    Number(firstRoll) >= 1 &&
    Number(firstRoll) <= pending.die &&
    (pending.count === 1 || (Number(secondRoll) >= 1 && Number(secondRoll) <= pending.die));
  const warning = selectedFeatureActionPrimaryDisabledReason ?? null;
  const disabled =
    !!warning ||
    !pending ||
    (pending.results
      ? !selectedOptions.some((entry) => entry.number === selectedNumber)
      : !manualRollsValid);
  const confirmLabel = pending?.results ? "Keep Spirit" : "Save Spirit Roll";
  const shape = getActionShapeForEconomyType(action.economyType);
  const shapeAvailable = selectedActionEconomyShapeState?.isAvailable ?? true;
  const shapeCount = selectedActionEconomyShapeState?.multiCount ?? 0;

  function confirm() {
    if (disabled) return;
    if (pending) {
      onPersistCharacter((current: Character) =>
        pending.results
          ? choosePendingSpirit(current, pending.id, Number(selection))
          : resolveSpiritRoll(
              current,
              pending.id,
              pending.count === 1 ? [Number(firstRoll)] : [Number(firstRoll), Number(secondRoll)]
            )
      );
      setSelection("");
      setFirstRoll("");
      setSecondRoll("");
      return;
    }
  }

  return (
    <div className={styles.footerActionStack}>
      {pending && !pending.results ? (
        <>
          <p>
            Enter your d{pending.die} {pending.count === 2 ? "rolls" : "roll"} from the dice result
            or physical dice. This channeling is already paid for.
          </p>
          {Array.from({ length: pending.count }, (_, index) => (
            <SelectInput
              key={index}
              aria-label={`Spirit roll ${index + 1}`}
              value={index === 0 ? firstRoll : secondRoll}
              onChange={(event) => (index === 0 ? setFirstRoll : setSecondRoll)(event.target.value)}
            >
              <option value="">Select roll {index + 1}</option>
              {Array.from({ length: pending.die }, (_, n) => (
                <option key={n + 1} value={n + 1}>
                  {n + 1}
                </option>
              ))}
            </SelectInput>
          ))}
        </>
      ) : null}
      {pending?.results ? (
        <p>
          Rolled {pending.results.join(" and ")}.{" "}
          {pending.results[0] === pending.results[1]
            ? "Matching rolls: choose any spirit."
            : "Choose either spirit."}
        </p>
      ) : null}
      {pending?.results ? (
        <SelectInput
          aria-label="Choose spirit"
          value={selection}
          onChange={(event) => setSelection(event.target.value)}
        >
          <option value="">Choose a spirit</option>
          {selectedOptions.map((entry) => (
            <option key={entry.number} value={entry.number}>
              {entry.number} — {entry.name}
            </option>
          ))}
        </SelectInput>
      ) : null}
      {spirit ? <DescriptionContent description={[spirit.description]} /> : null}
      {warning ? <p>{warning}</p> : null}
      <ActionFooterButtonRow>
        <ActionButton
          className={styles.weaponFooterButton}
          disabled={disabled}
          onClick={context.confirmSelectedActionToast(confirm)}
          trailingBadge={
            shape ? (
              <ActionShape shape={shape} isSelected={shapeAvailable} multiCount={shapeCount} />
            ) : null
          }
        >
          {confirmLabel}
        </ActionButton>
      </ActionFooterButtonRow>
    </div>
  );
}

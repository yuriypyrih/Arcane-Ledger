import type { ActionShapeType } from "../../ActionShape";
import {
  ECONOMY_TYPE,
  type EconomyType
} from "../../../pages/CharactersPage/actionEconomy";
import type { RoundTrackerResource } from "../../../pages/CharactersPage/combat";
import { hasToastCards, showToast, store } from "../../../store";

export type ActionConfirmationToastTrigger =
  | EconomyType
  | RoundTrackerResource
  | ActionShapeType
  | null
  | undefined;

const actionConfirmationTriggers = new Set<ActionConfirmationToastTrigger>([
  ECONOMY_TYPE.ACTION,
  ECONOMY_TYPE.BONUS_ACTION,
  ECONOMY_TYPE.REACTION,
  "bonusAction"
]);
const ACTION_CONFIRMATION_TOAST_DISMISS_MS = 4_000;

function isActionConfirmationTrigger(trigger: ActionConfirmationToastTrigger): boolean {
  return actionConfirmationTriggers.has(trigger);
}

function scheduleActionConfirmationToast() {
  if (typeof window === "undefined") {
    return;
  }

  window.setTimeout(() => {
    if (hasToastCards(store.getState().toasts)) {
      return;
    }

    store.dispatch(
      showToast({
        text: "Action Confirmed",
        type: "success",
        position: "top-middle",
        effect: "default",
        dismissMs: ACTION_CONFIRMATION_TOAST_DISMISS_MS
      })
    );
  }, 0);
}

export function runWithActionConfirmationToast<T>(
  trigger: ActionConfirmationToastTrigger,
  callback: () => T
): T {
  const shouldConsiderToast =
    isActionConfirmationTrigger(trigger) && !hasToastCards(store.getState().toasts);
  const result = callback();

  if (shouldConsiderToast && !hasToastCards(store.getState().toasts)) {
    scheduleActionConfirmationToast();
  }

  return result;
}

export async function runWithActionConfirmationToastAsync<T>(
  trigger: ActionConfirmationToastTrigger,
  callback: () => Promise<T>
): Promise<T> {
  const shouldConsiderToast =
    isActionConfirmationTrigger(trigger) && !hasToastCards(store.getState().toasts);
  const result = await callback();

  if (shouldConsiderToast && !hasToastCards(store.getState().toasts)) {
    scheduleActionConfirmationToast();
  }

  return result;
}

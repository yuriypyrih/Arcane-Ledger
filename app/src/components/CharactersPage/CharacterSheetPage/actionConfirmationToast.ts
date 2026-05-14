import type { ActionShapeType } from "../../ActionShape";
import {
  ECONOMY_TYPE,
  type EconomyType
} from "../../../pages/CharactersPage/actionEconomy";
import type { RoundTrackerResource } from "../../../pages/CharactersPage/combat";
import { showToast, store } from "../../../store";

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
    if (store.getState().toasts.length > 0) {
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
    isActionConfirmationTrigger(trigger) && store.getState().toasts.length === 0;
  const result = callback();

  if (shouldConsiderToast && store.getState().toasts.length === 0) {
    scheduleActionConfirmationToast();
  }

  return result;
}

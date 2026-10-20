import BardSpiritsActionFooter from "../forms/BardSpiritsActionFooter";
import type { ActionFormAdapter, ActionFormKind } from "./types";

export const bardFormAdapters: Partial<Record<ActionFormKind, ActionFormAdapter>> = {
  "bard-spirits": {
    footer: (context) => (
      <BardSpiritsActionFooter key={context.selectedAction?.key} context={context} />
    )
  }
};

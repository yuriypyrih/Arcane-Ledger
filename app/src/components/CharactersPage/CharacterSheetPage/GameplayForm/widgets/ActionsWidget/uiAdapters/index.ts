import type {
  ActionFormKind,
  ActionFormAdapter,
  ActionFormBodyContext,
  ActionFormFooterContext
} from "./types";
import { artificerFormAdapters } from "./artificer";
import { bardFormAdapters } from "./bard";
import { speciesFormAdapters } from "./species";
import { wizardFormAdapters } from "./wizard";
import { clericFormAdapters } from "./cleric";
import { fighterFormAdapters } from "./fighter";
import { paladinFormAdapters } from "./paladin";
import { warlockFormAdapters } from "./warlock";
import { featsFormAdapters } from "./feats";
import { barbarianFormAdapters } from "./barbarian";
import { rogueFormAdapters } from "./rogue";
import { sorcererFormAdapters } from "./sorcerer";
import { druidFormAdapters } from "./druid";
const adapters: Partial<Record<ActionFormKind, ActionFormAdapter>> = {
  ...artificerFormAdapters,
  ...bardFormAdapters,
  ...speciesFormAdapters,
  ...wizardFormAdapters,
  ...clericFormAdapters,
  ...fighterFormAdapters,
  ...paladinFormAdapters,
  ...warlockFormAdapters,
  ...featsFormAdapters,
  ...barbarianFormAdapters,
  ...rogueFormAdapters,
  ...sorcererFormAdapters,
  ...druidFormAdapters
};
export function renderFormBody(context: ActionFormBodyContext) {
  const action = context.selectedAction;
  return action?.drawer.kind === "custom-form"
    ? adapters[action.drawer.formKind]?.body?.(context)
    : undefined;
}
export function renderFormFooter(context: ActionFormFooterContext) {
  const action = context.selectedAction;
  if (!action) return undefined;
  // A custom drawer owns its form; execute-only forms keep their existing discriminant.
  const key =
    action.drawer.kind === "custom-form"
      ? action.drawer.formKind
      : action.execute.kind === "custom-form"
        ? action.execute.formKind
        : null;
  return key ? adapters[key]?.footer?.(context) : undefined;
}

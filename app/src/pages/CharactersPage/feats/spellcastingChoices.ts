import { FEATS } from "../../../codex/entries/enums";
import type {
  ArcaneCantripSpellcastingAbility,
  ArcaneUndertakerState,
  CharacterFeatEntry,
  FamiliarFriendState
} from "../../../types";
import {
  arcaneCantripFeats,
  getArcaneUndertakerCantrip,
  isArcaneCantripSpellcastingAbility
} from "./arcaneCantripChoices";

const featSpellcastingChoices = {
  ...arcaneCantripFeats,
  [FEATS.FAMILIAR_FRIEND]: { key: "familiarFriend" },
  [FEATS.SECOND_SKIN]: { key: "secondSkin" }
} as const;

export type FeatWithSpellcastingChoice = keyof typeof featSpellcastingChoices;
export type FeatSpellcastingSelection = Pick<
  ArcaneUndertakerState,
  "cantripId" | "spellcastingAbility"
>;

export function hasFeatSpellcastingChoice(
  feat: string | null | undefined
): feat is FeatWithSpellcastingChoice {
  return (
    typeof feat === "string" && Object.prototype.hasOwnProperty.call(featSpellcastingChoices, feat)
  );
}

export function getFeatSpellcastingChoiceAbility(entry: CharacterFeatEntry) {
  return hasFeatSpellcastingChoice(entry.feat)
    ? entry[featSpellcastingChoices[entry.feat].key]?.spellcastingAbility
    : undefined;
}

export function isFeatSpellcastingChoiceComplete(
  feat: FeatWithSpellcastingChoice,
  ability: unknown,
  cantripId?: string
): ability is ArcaneCantripSpellcastingAbility {
  return (
    isArcaneCantripSpellcastingAbility(ability) &&
    (feat !== FEATS.ARCANE_UNDERTAKER || Boolean(getArcaneUndertakerCantrip(cantripId)))
  );
}

export function getFeatSpellcastingChoiceUpdate(
  feat: FeatWithSpellcastingChoice,
  selection: FeatSpellcastingSelection,
  entry?: CharacterFeatEntry
): Pick<CharacterFeatEntry, (typeof featSpellcastingChoices)[FeatWithSpellcastingChoice]["key"]> {
  const { key } = featSpellcastingChoices[feat];
  return { [key]: { ...entry?.[key], ...selection } };
}

export function normalizeFamiliarFriendState(value: unknown): FamiliarFriendState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Partial<FamiliarFriendState>;
  const spellcastingAbility = isArcaneCantripSpellcastingAbility(record.spellcastingAbility)
    ? record.spellcastingAbility
    : undefined;
  const faithfulCompanionExpended = record.faithfulCompanionExpended === true || undefined;

  return spellcastingAbility || faithfulCompanionExpended
    ? { spellcastingAbility, faithfulCompanionExpended }
    : undefined;
}

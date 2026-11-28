import { FEATS } from "../../../../codex/entries/enums";
import type { Character } from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { createChargesCardUsage } from "../../classFeatures/cardUsage";
import type { FeatureActionCard } from "../../classFeatures/types";
import { normalizeRoundTracker } from "../../combat";
import { getFeatDefinition, getFeatLabel } from "../catalog";
import { filterDescriptionEntries } from "./descriptionMatchers";
import { proficiencyBonusFeatResource } from "./resources/counter";

export const portalStepActionKey = "feat-portal-jumper-portal-step";
export const portalStepResource = proficiencyBonusFeatResource(
  FEATS.PORTAL_JUMPER,
  "portalJumper",
  "portalStepUsesExpended",
  "Portal Step",
  (entry) => entry.portalJumper?.portalStepUsesExpended
);

function getPortalStepDisabledReason(character: Character) {
  return portalStepResource.remaining(character) <= 0
    ? "Portal Step recharges on a Long Rest."
    : normalizeRoundTracker(character.roundTracker).portalStepUsedThisTurn
      ? "Portal Step has already been used this turn."
      : undefined;
}

export function createPortalStepAction(character: Character): FeatureActionCard {
  const description = filterDescriptionEntries(
    getFeatDefinition(FEATS.PORTAL_JUMPER)?.description ?? [],
    (line) => line.startsWith("<strong>Portal Step.</strong>")
  );
  const disabledReason = getPortalStepDisabledReason(character);
  return {
    key: portalStepActionKey,
    name: portalStepResource.label,
    actionSource: { type: "feat", name: getFeatLabel(FEATS.PORTAL_JUMPER) },
    summary: "Spend 15 feet of movement",
    detail: "Teleport up to 15 feet.",
    breakdown: "Teleport up to 15 feet",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createChargesCardUsage(
      portalStepResource.remaining(character),
      portalStepResource.total(character),
      portalStepResource
    ),
    description,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function spendPortalStep(character: Character): Character {
  if (getPortalStepDisabledReason(character)) return character;

  const next = portalStepResource.spendOne(character);
  const roundTracker = normalizeRoundTracker(next.roundTracker);
  return next !== character && roundTracker.isInCombat
    ? { ...next, roundTracker: { ...roundTracker, portalStepUsedThisTurn: true } }
    : next;
}

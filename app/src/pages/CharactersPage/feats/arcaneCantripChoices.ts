import { FEATS } from "../../../codex/entries/enums";
import type {
  ArcaneArtistState,
  ArcaneCantripSpellcastingAbility,
  ArcaneEloquenceChoice,
  ArcaneInfiltratorState,
  ArcaneOmensState,
  ArcaneOverloadState,
  ArcaneSafeguardState,
  CharacterFeatEntry
} from "../../../types";

export const arcaneCantripSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;

export const arcaneCantripFeats = {
  [FEATS.ARCANE_ARTIST]: { key: "arcaneArtist", cantripId: "spell-minor-illusion" },
  [FEATS.ARCANE_ELOQUENCE]: { key: "arcaneEloquence", cantripId: "spell-vicious-mockery" },
  [FEATS.ARCANE_INFILTRATOR]: { key: "arcaneInfiltrator", cantripId: "spell-friends" },
  [FEATS.ARCANE_OMENS]: { key: "arcaneOmens", cantripId: "spell-guidance" },
  [FEATS.ARCANE_OVERLOAD]: { key: "arcaneOverload", cantripId: "spell-fire-bolt" },
  [FEATS.ARCANE_SAFEGUARD]: { key: "arcaneSafeguard", cantripId: "spell-resistance" }
} as const;

export type ArcaneCantripFeat = keyof typeof arcaneCantripFeats;

export function isArcaneCantripFeat(feat: string | null | undefined): feat is ArcaneCantripFeat {
  return typeof feat === "string" && Object.prototype.hasOwnProperty.call(arcaneCantripFeats, feat);
}

export function isArcaneCantripSpellcastingAbility(
  value: unknown
): value is ArcaneCantripSpellcastingAbility {
  return value === "INT" || value === "WIS" || value === "CHA";
}

export function getArcaneCantripAbility(entry: CharacterFeatEntry) {
  return isArcaneCantripFeat(entry.feat)
    ? entry[arcaneCantripFeats[entry.feat].key]?.spellcastingAbility
    : undefined;
}

export function getArcaneCantripChoiceUpdate(
  feat: ArcaneCantripFeat,
  spellcastingAbility: ArcaneCantripSpellcastingAbility,
  entry?: CharacterFeatEntry
): Pick<CharacterFeatEntry, (typeof arcaneCantripFeats)[ArcaneCantripFeat]["key"]> {
  const { key } = arcaneCantripFeats[feat];
  return { [key]: { ...entry?.[key], spellcastingAbility } };
}

function normalizeExpendedUses(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.floor(value)
    : undefined;
}

export function normalizeArcaneArtistState(value: unknown): ArcaneArtistState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility, inspiringMagicExpended } = value as ArcaneArtistState;
  const ability = isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? spellcastingAbility
    : undefined;
  const expended = inspiringMagicExpended === true;

  return ability || expended
    ? { spellcastingAbility: ability, inspiringMagicExpended: expended || undefined }
    : undefined;
}

export function normalizeArcaneEloquenceChoice(value: unknown): ArcaneEloquenceChoice | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility } = value as ArcaneEloquenceChoice;
  return isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? { spellcastingAbility }
    : undefined;
}

export function normalizeArcaneInfiltratorState(
  value: unknown
): ArcaneInfiltratorState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility, cunningDiversionUsesExpended } = value as ArcaneInfiltratorState;
  const ability = isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? spellcastingAbility
    : undefined;
  const expended = normalizeExpendedUses(cunningDiversionUsesExpended);
  return ability || expended
    ? { spellcastingAbility: ability, cunningDiversionUsesExpended: expended }
    : undefined;
}

export function normalizeArcaneOmensState(value: unknown): ArcaneOmensState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility, helpfulPremonitionUsesExpended } = value as ArcaneOmensState;
  const ability = isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? spellcastingAbility
    : undefined;
  const expended = normalizeExpendedUses(helpfulPremonitionUsesExpended);
  return ability || expended
    ? { spellcastingAbility: ability, helpfulPremonitionUsesExpended: expended }
    : undefined;
}

export function normalizeArcaneOverloadState(value: unknown): ArcaneOverloadState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility, powerSurgeExpended } = value as ArcaneOverloadState;
  const ability = isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? spellcastingAbility
    : undefined;
  const expended = powerSurgeExpended === true;
  return ability || expended
    ? { spellcastingAbility: ability, powerSurgeExpended: expended || undefined }
    : undefined;
}

export function normalizeArcaneSafeguardState(value: unknown): ArcaneSafeguardState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const { spellcastingAbility, resistanceBonusActionUsesExpended } = value as ArcaneSafeguardState;
  const ability = isArcaneCantripSpellcastingAbility(spellcastingAbility)
    ? spellcastingAbility
    : undefined;
  const expended = normalizeExpendedUses(resistanceBonusActionUsesExpended);
  return ability || expended
    ? { spellcastingAbility: ability, resistanceBonusActionUsesExpended: expended }
    : undefined;
}

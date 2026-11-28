import { getSpellEntriesForSpellListClasses } from "../../../codex/classes/spellAccess";
import { FEATS, MAGIC_SCHOOL, SPELL_LIST_CLASS } from "../../../codex/entries/enums";
import type {
  ArcaneArtistState,
  ArcaneCantripSpellcastingAbility,
  ArcaneEloquenceChoice,
  ArcaneInfiltratorState,
  ArcaneOmensState,
  ArcaneOverloadState,
  ArcaneSafeguardState,
  ArcaneUndertakerState
} from "../../../types";

export const arcaneCantripSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;

export const arcaneCantripFeats = {
  [FEATS.ARCANE_ARTIST]: { key: "arcaneArtist", cantripId: "spell-minor-illusion" },
  [FEATS.ARCANE_ELOQUENCE]: { key: "arcaneEloquence", cantripId: "spell-vicious-mockery" },
  [FEATS.ARCANE_INFILTRATOR]: { key: "arcaneInfiltrator", cantripId: "spell-friends" },
  [FEATS.ARCANE_OMENS]: { key: "arcaneOmens", cantripId: "spell-guidance" },
  [FEATS.ARCANE_OVERLOAD]: { key: "arcaneOverload", cantripId: "spell-fire-bolt" },
  [FEATS.ARCANE_SAFEGUARD]: { key: "arcaneSafeguard", cantripId: "spell-resistance" },
  [FEATS.ARCANE_UNDERTAKER]: { key: "arcaneUndertaker", cantripId: null },
  [FEATS.GATHERED_WHISPERS]: { key: "gatheredWhispers", cantripId: "spell-message" },
  [FEATS.LIVING_SHADOW]: { key: "livingShadow", cantripId: "spell-mage-hand" },
  [FEATS.TOUCH_OF_DEATH]: { key: "touchOfDeath", cantripId: "spell-chill-touch" }
} as const;

export type ArcaneCantripFeat = keyof typeof arcaneCantripFeats;

export const arcaneUndertakerCantripOptions = getSpellEntriesForSpellListClasses([
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.WIZARD
]).filter((spell) => spell.spellLevel === 0 && spell.magicSchool === MAGIC_SCHOOL.NECROMANCY);

export function getArcaneUndertakerCantrip(cantripId?: string) {
  return arcaneUndertakerCantripOptions.find((spell) => spell.id === cantripId);
}

export function isArcaneCantripFeat(feat: string | null | undefined): feat is ArcaneCantripFeat {
  return typeof feat === "string" && Object.prototype.hasOwnProperty.call(arcaneCantripFeats, feat);
}

export function isArcaneCantripSpellcastingAbility(
  value: unknown
): value is ArcaneCantripSpellcastingAbility {
  return value === "INT" || value === "WIS" || value === "CHA";
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

export function normalizeArcaneUndertakerState(value: unknown): ArcaneUndertakerState | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Partial<ArcaneUndertakerState>;
  const cantripId =
    typeof record.cantripId === "string"
      ? getArcaneUndertakerCantrip(record.cantripId.trim())?.id
      : undefined;
  const spellcastingAbility = isArcaneCantripSpellcastingAbility(record.spellcastingAbility)
    ? record.spellcastingAbility
    : undefined;
  const understandingOfDeathExpended = record.understandingOfDeathExpended === true || undefined;

  return cantripId || spellcastingAbility || understandingOfDeathExpended
    ? { cantripId, spellcastingAbility, understandingOfDeathExpended }
    : undefined;
}

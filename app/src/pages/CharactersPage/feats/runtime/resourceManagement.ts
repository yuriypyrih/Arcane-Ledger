import { FEATS } from "../../../../codex/entries/enums";
import type { Character, CharacterFeatEntry } from "../../../../types";
import type {
  CounterResourceTarget,
  ResourceAdjustment,
  ResourceManagementTarget
} from "../../resourceManagement";
import { hitDiceResource } from "../../resourceManagement";
import {
  boonOfFateImproveFateActionKey,
  boonOfFluidFormsShapechangerActionKey,
  boonOfRecoveryRecoverVitalityActionKey,
  cultOfDragonInitiateInspiredByFearActionKey,
  durableSpeedyRecoveryActionKey,
  fairyTricksterFlusteringStrikeActionKey,
  genieMagicWishMagicActionKey,
  lordlyResolveStandardBearerActionKey,
  luckyFeatActionKey,
  purpleDragonCommandantEncourageAllyActionKey
} from "./constants";
import { getBoonOfFluidFormsShapechangerStateForCharacter } from "./fluidForms";
import {
  getBoonOfFateImproveFateStateForCharacter,
  getBoonOfRecoveryRecoverVitalityStateForCharacter,
  getBoonOfRevelryIrresistibleDanceFreeCastStateForCharacter,
  getCultOfDragonInitiateInspiredByFearStateForCharacter,
  getEnclaveMagicTwoHeartsOneMindStateForCharacter,
  getFairyTricksterFlusteringStrikeStateForCharacter,
  getGenieMagicWishMagicStateForCharacter,
  getLordlyResolveStandardBearerStateForCharacter,
  getPurpleDragonCommandantEncourageAllyStateForCharacter
} from "./resources";
import {
  getFeyTouchedFreeCastStateForCharacter,
  getMagicInitiateFreeCastStateForCharacter,
  getRitualCasterQuickRitualStateForCharacter,
  getShadowTouchedFreeCastStateForCharacter,
  getTelepathicDetectThoughtsFreeCastStateForCharacter
} from "./spellcasting";
import { collectFeatDerivedState } from "./state";

type Usage = { usesTotal: number; usesRemaining: number } | null;

/** Adjust only the resource field on eligible feat records, preserving their choices and other casts. */
function featResource<K extends keyof CharacterFeatEntry>(
  feat: FEATS,
  stateKey: K,
  field: keyof NonNullable<CharacterFeatEntry[K]>,
  label: string,
  state: (character: Character) => Usage,
  mode: "number" | "boolean" | "spell" = "boolean",
  spellId?: string,
  matches: (entry: CharacterFeatEntry) => boolean = () => true
): CounterResourceTarget {
  function update(character: Character, adjustment: ResourceAdjustment): Character {
    const usage = state(character);
    if (!usage || usage.usesTotal <= 0 || (adjustment === "use" && usage.usesRemaining <= 0))
      return character;
    let changed = false;
    const eligibleIds = new Set(
      collectFeatDerivedState(character)
        .normalizedFeats.filter((entry) => entry.feat === feat && matches(entry))
        .map((entry) => entry.id)
    );
    const feats = (character.feats ?? []).map((entry) => {
      if (!eligibleIds.has(entry.id) || (changed && adjustment !== "reset")) return entry;
      const record = (entry[stateKey] ?? {}) as Record<string, unknown>;
      const raw = record[String(field)];
      const spellIds = Array.isArray(raw)
        ? raw.filter((value): value is string => typeof value === "string")
        : [];
      const expended =
        mode === "spell"
          ? Number(spellIds.includes(spellId!))
          : mode === "boolean"
            ? Number(raw === true)
            : Math.max(0, Number(raw) || 0);
      if (
        adjustment === "use" ? expended >= (mode === "number" ? usage.usesTotal : 1) : expended <= 0
      )
        return entry;
      const next = adjustment === "reset" ? 0 : expended + (adjustment === "use" ? 1 : -1);
      const value =
        mode === "spell"
          ? next > 0
            ? [...new Set([...spellIds, spellId!])]
            : spellIds.filter((id) => id !== spellId)
          : mode === "boolean"
            ? next > 0
            : next;
      changed = true;
      return { ...entry, [stateKey]: { ...record, [field]: value } };
    });
    return changed ? { ...character, feats } : character;
  }
  return {
    kind: "counter",
    id: `feat:${feat}:${String(field)}:${spellId ?? ""}`,
    label,
    total: (character) => state(character)?.usesTotal ?? 0,
    remaining: (character) => state(character)?.usesRemaining ?? 0,
    spendOne: (character) => update(character, "use"),
    restoreOne: (character) => update(character, "restore"),
    restoreAll: (character) => update(character, "reset")
  };
}

export const featActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  [luckyFeatActionKey]: [
    featResource(
      FEATS.LUCKY,
      "lucky",
      "pointsExpended",
      "Lucky Points",
      (character) => {
        const state = collectFeatDerivedState(character);
        return { usesTotal: state.luckyPointsTotal, usesRemaining: state.luckyPointsRemaining };
      },
      "number"
    )
  ],
  [boonOfFateImproveFateActionKey]: [
    featResource(
      FEATS.BOON_OF_FATE,
      "boonOfFate",
      "improveFateExpended",
      "Improve Fate",
      getBoonOfFateImproveFateStateForCharacter
    )
  ],
  [cultOfDragonInitiateInspiredByFearActionKey]: [
    featResource(
      FEATS.CULT_OF_THE_DRAGON_INITIATE,
      "cultOfDragonInitiate",
      "inspiredByFearExpended",
      "Inspired by Fear",
      getCultOfDragonInitiateInspiredByFearStateForCharacter
    )
  ],
  [boonOfRecoveryRecoverVitalityActionKey]: [
    featResource(
      FEATS.BOON_OF_RECOVERY,
      "boonOfRecovery",
      "recoverVitalityDiceExpended",
      "Recover Vitality",
      getBoonOfRecoveryRecoverVitalityStateForCharacter,
      "number"
    )
  ],
  [fairyTricksterFlusteringStrikeActionKey]: [
    featResource(
      FEATS.FAIRY_TRICKSTER,
      "fairyTrickster",
      "flusteringStrikeExpended",
      "Flustering Strike",
      getFairyTricksterFlusteringStrikeStateForCharacter,
      "number"
    )
  ],
  [genieMagicWishMagicActionKey]: [
    featResource(
      FEATS.GENIE_MAGIC,
      "genieMagic",
      "wishMagicExpended",
      "Wish Magic",
      getGenieMagicWishMagicStateForCharacter
    )
  ],
  [purpleDragonCommandantEncourageAllyActionKey]: [
    featResource(
      FEATS.PURPLE_DRAGON_COMMANDANT,
      "purpleDragonCommandant",
      "encourageAllyExpended",
      "Encourage Ally",
      getPurpleDragonCommandantEncourageAllyStateForCharacter,
      "number"
    )
  ],
  [durableSpeedyRecoveryActionKey]: [hitDiceResource],
  [boonOfFluidFormsShapechangerActionKey]: [
    featResource(
      FEATS.BOON_OF_FLUID_FORMS,
      "boonOfFluidForms",
      "shapechangerExpended",
      "Shapechanger",
      getBoonOfFluidFormsShapechangerStateForCharacter
    )
  ],
  [lordlyResolveStandardBearerActionKey]: [
    featResource(
      FEATS.LORDLY_RESOLVE,
      "lordlyResolve",
      "standardBearerExpended",
      "Standard Bearer",
      getLordlyResolveStandardBearerStateForCharacter
    )
  ]
};

export function getFeatSpellResource(
  optionId: string,
  spellId: string
): CounterResourceTarget | undefined {
  switch (optionId) {
    case "magic-initiate":
      return featResource(
        FEATS.MAGIC_INITIATE,
        "magicInitiate",
        "freeCastExpended",
        "Magic Initiate",
        (character) => getMagicInitiateFreeCastStateForCharacter(character, spellId),
        "boolean",
        spellId,
        (entry) => entry.magicInitiate?.levelOneSpellId === spellId
      );
    case "fey-magic":
      return featResource(
        FEATS.FEY_TOUCHED,
        "feyTouched",
        "freeCastExpendedSpellIds",
        "Fey Magic",
        (character) => getFeyTouchedFreeCastStateForCharacter(character, spellId),
        "spell",
        spellId,
        (entry) => spellId === "spell-misty-step" || entry.feyTouched?.spellId === spellId
      );
    case "shadow-magic":
      return featResource(
        FEATS.SHADOW_TOUCHED,
        "shadowTouched",
        "freeCastExpendedSpellIds",
        "Shadow Magic",
        (character) => getShadowTouchedFreeCastStateForCharacter(character, spellId),
        "spell",
        spellId,
        (entry) => spellId === "spell-invisibility" || entry.shadowTouched?.spellId === spellId
      );
    case "detect-thoughts":
      return featResource(
        FEATS.TELEPATHIC,
        "telepathic",
        "detectThoughtsExpended",
        "Detect Thoughts",
        (character) => getTelepathicDetectThoughtsFreeCastStateForCharacter(character, spellId)
      );
    case "quick-ritual":
      return featResource(
        FEATS.RITUAL_CASTER,
        "ritualCaster",
        "quickRitualExpended",
        "Quick Ritual",
        getRitualCasterQuickRitualStateForCharacter
      );
    case "boon-of-revelry":
      return featResource(
        FEATS.BOON_OF_REVELRY,
        "boonOfRevelry",
        "irresistibleDanceExpended",
        "Boon of Revelry",
        (character) =>
          getBoonOfRevelryIrresistibleDanceFreeCastStateForCharacter(character, spellId)
      );
    case "enclave-magic-two-hearts-one-mind":
      return featResource(
        FEATS.ENCLAVE_MAGIC,
        "enclaveMagic",
        "twoHeartsOneMindExpended",
        "Two Hearts, One Mind",
        getEnclaveMagicTwoHeartsOneMindStateForCharacter
      );
    default:
      return undefined;
  }
}

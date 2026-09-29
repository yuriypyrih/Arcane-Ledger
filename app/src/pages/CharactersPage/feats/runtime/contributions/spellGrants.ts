import { appendFeatSpellGrants } from "./spellGrantBuilder";
import { FEATS } from "../../../../../codex/entries/enums";

import { getFeatLabel } from "../../catalog";

import {
  getBoonOfRevelryIrresistibleDanceSpellEntry,
  getEmeraldEnclaveFledglingSpellEntry,
  getEnclaveMagicBeastSenseSpellEntry,
  getFeyTouchedSpellEntries,
  getMagicInitiateLevelOneSpellEntry,
  getRitualCasterSpellEntries,
  getShadowTouchedSpellEntries,
  getSpellfireSparkSacredFlameSpellEntry,
  getTelekineticMageHandSpellEntry,
  getTelepathicDetectThoughtsSpellEntry
} from "../spells";

import type { FeatContributionBuilders } from "./types";
export const magicInitiateFreeCastContributionId = "feat-magic-initiate-free-cast";
export const feyTouchedFreeCastContributionId = "feat-fey-touched-free-cast";
export const shadowTouchedFreeCastContributionId = "feat-shadow-touched-free-cast";
export const telepathicDetectThoughtsFreeCastContributionId =
  "feat-telepathic-detect-thoughts-free-cast";
export const boonOfRevelryIrresistibleDanceFreeCastContributionId =
  "feat-boon-of-revelry-irresistible-dance-free-cast";
export const spellGrantsBuilders: FeatContributionBuilders = {
  [FEATS.MAGIC_INITIATE]: ({ entry, contribution, featCantripEntries }) => {
    if (!entry.magicInitiate) return false;

    const magicInitiate = entry.magicInitiate;

    appendFeatSpellGrants(entry, contribution, featCantripEntries, {
      kind: "always-prepared-cantrip",
      ability: magicInitiate.spellcastingAbility
    });

    const levelOneSpell = getMagicInitiateLevelOneSpellEntry(entry);

    if (levelOneSpell) {
      contribution.spellGrants!.push({
        kind: "always-prepared-spell",
        spell: levelOneSpell,
        sourceLabel: getFeatLabel(entry.feat),
        spellcastingAbility: magicInitiate.spellcastingAbility,
        freeCast: {
          id: magicInitiateFreeCastContributionId,
          entryId: entry.id,
          expended: magicInitiate.freeCastExpended === true
        }
      });
    }

    return true;
  },
  [FEATS.COLD_CASTER]: ({ entry, contribution, featCantripEntries }) => {
    if (!entry.coldCaster) return false;

    const coldCaster = entry.coldCaster;

    appendFeatSpellGrants(entry, contribution, featCantripEntries, {
      kind: "always-prepared-cantrip",
      ability: coldCaster.ability
    });

    return true;
  },
  [FEATS.EMERALD_ENCLAVE_FLEDGLING]: ({ entry, contribution }) => {
    if (!entry.emeraldEnclaveFledgling) return false;

    const speakWithAnimals = getEmeraldEnclaveFledglingSpellEntry(entry);

    if (speakWithAnimals) {
      contribution.spellGrants!.push({
        kind: "always-prepared-spell",
        spell: speakWithAnimals,
        sourceLabel: getFeatLabel(entry.feat),
        spellcastingAbility: entry.emeraldEnclaveFledgling.spellcastingAbility
      });
    }

    return true;
  },
  [FEATS.ENCLAVE_MAGIC]: ({ entry, contribution }) => {
    const beastSense = getEnclaveMagicBeastSenseSpellEntry(entry);

    if (beastSense) {
      contribution.spellGrants!.push({
        kind: "always-prepared-spell",
        spell: beastSense,
        sourceLabel: getFeatLabel(entry.feat),
        spellcastingAbility: entry.epicBoonAbilityChoice?.ability ?? "WIS"
      });
    }

    return true;
  },
  [FEATS.SPELLFIRE_SPARK]: ({ entry, contribution }) => {
    if (!entry.spellfireSpark) return false;

    const sacredFlame = getSpellfireSparkSacredFlameSpellEntry(entry);

    if (sacredFlame) {
      contribution.spellGrants!.push(
        {
          kind: "granted-cantrip",
          spell: sacredFlame
        },
        {
          kind: "always-prepared-cantrip",
          spell: sacredFlame,
          sourceLabel: getFeatLabel(entry.feat),
          spellcastingAbility: entry.spellfireSpark.spellcastingAbility
        }
      );
    }

    return true;
  },
  [FEATS.BOON_OF_REVELRY]: ({ entry, contribution }) => {
    const irresistibleDance = getBoonOfRevelryIrresistibleDanceSpellEntry(entry);

    if (irresistibleDance) {
      contribution.spellGrants!.push({
        kind: "always-prepared-spell",
        spell: irresistibleDance,
        sourceLabel: getFeatLabel(entry.feat),
        freeCast: {
          id: boonOfRevelryIrresistibleDanceFreeCastContributionId,
          entryId: entry.id,
          expended: entry.boonOfRevelry?.irresistibleDanceExpended === true
        }
      });
    }

    return true;
  },
  [FEATS.FEY_TOUCHED]: ({ entry, contribution }) => {
    if (!entry.feyTouched) return false;

    const feyTouched = entry.feyTouched;

    appendFeatSpellGrants(entry, contribution, getFeyTouchedSpellEntries(entry), {
      kind: "always-prepared-spell",
      ability: feyTouched.ability,
      freeCast: (spell) => ({
        id: feyTouchedFreeCastContributionId,
        entryId: entry.id,
        expended: feyTouched.freeCastExpendedSpellIds?.includes(spell.id) === true
      })
    });

    return true;
  },
  [FEATS.RITUAL_CASTER]: ({ entry, contribution }) => {
    if (!entry.ritualCaster) return false;

    const ritualCaster = entry.ritualCaster;

    appendFeatSpellGrants(entry, contribution, getRitualCasterSpellEntries(entry), {
      kind: "always-prepared-spell",
      ability: ritualCaster.ability
    });

    return true;
  },
  [FEATS.SHADOW_TOUCHED]: ({ entry, contribution }) => {
    if (!entry.shadowTouched) return false;

    const shadowTouched = entry.shadowTouched;

    appendFeatSpellGrants(entry, contribution, getShadowTouchedSpellEntries(entry), {
      kind: "always-prepared-spell",
      ability: shadowTouched.ability,
      freeCast: (spell) => ({
        id: shadowTouchedFreeCastContributionId,
        entryId: entry.id,
        expended: shadowTouched.freeCastExpendedSpellIds?.includes(spell.id) === true
      })
    });

    return true;
  },
  [FEATS.TELEKINETIC]: ({ entry, contribution }) => {
    if (!entry.telekinetic) return false;

    const mageHand = getTelekineticMageHandSpellEntry(entry);

    if (mageHand) {
      contribution.spellGrants!.push({
        kind: "always-prepared-cantrip",
        spell: mageHand,
        sourceLabel: getFeatLabel(entry.feat),
        spellcastingAbility: entry.telekinetic.ability
      });
    }

    return true;
  },
  [FEATS.TELEPATHIC]: ({ entry, contribution }) => {
    if (!entry.telepathic) return false;

    const detectThoughts = getTelepathicDetectThoughtsSpellEntry(entry);

    if (detectThoughts) {
      contribution.spellGrants!.push({
        kind: "always-prepared-spell",
        spell: detectThoughts,
        sourceLabel: getFeatLabel(entry.feat),
        spellcastingAbility: entry.telepathic.ability,
        freeCast: {
          id: telepathicDetectThoughtsFreeCastContributionId,
          entryId: entry.id,
          expended: entry.telepathic.detectThoughtsExpended === true
        }
      });
    }

    return true;
  }
};

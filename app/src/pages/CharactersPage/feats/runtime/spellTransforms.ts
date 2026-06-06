import { DAMAGE_TYPE, FEATS, SPELL_COMPONENT, type SpellEntry } from "../../../../codex/entries";
import type { CharacterFeatEntry } from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { getFeatLabel } from "..";
import {
  emeraldEnclaveFledglingSpeakWithAnimalsSpellId,
  elementalAdeptEnergyMasteryDescription,
  feyTouchedFeyMagicDescription,
  feyTouchedMistyStepSpellId,
  ritualCasterQuickRitualDescription,
  shadowTouchedInvisibilitySpellId,
  shadowTouchedShadowMagicDescription,
  spellfireSparkSacredFlameSpellId,
  telekineticMageHandSpellId,
  telepathicDetectThoughtsSpellId
} from "./constants";
import {
  isBoonOfDimensionalTravelBlinkStepsDescriptionEntry,
  isBoonOfIrresistibleOffenseDescriptionEntry,
  isBoonOfSpellRecallFreeCastingDescriptionEntry,
  isEmeraldEnclaveFledglingSpeakWithAnimalsDescriptionEntry,
  isPiercerWeaponActionDescriptionEntry,
  isPoisonerPotentPoisonDescriptionEntry,
  isSpellfireSparkSpellfireFlameDescriptionEntry,
  isSpellSniperDescriptionEntry,
  isTelekineticMinorTelekinesisDescriptionEntry,
  isTelepathicDetectThoughtsDescriptionEntry,
  isWarCasterSomaticComponentsDescriptionEntry
} from "./descriptionMatchers";

type FeatDescriptionSliceGetter = (
  feat: FEATS,
  predicate: (entry: string) => boolean
) => SpellEntry["description"];

function doesSpellDealDamageType(spell: SpellEntry, chosenDamageType: DAMAGE_TYPE): boolean {
  return spell.damage.some(([, damageType]) =>
    Array.isArray(damageType)
      ? damageType.includes(chosenDamageType)
      : damageType === chosenDamageType
  );
}

function doesSpellDealAnyDamageType(spell: SpellEntry, damageTypes: DAMAGE_TYPE[]): boolean {
  return damageTypes.some((damageType) => doesSpellDealDamageType(spell, damageType));
}

export function transformFeatSpellEntryForEntries(
  normalizedFeats: readonly CharacterFeatEntry[],
  spell: SpellEntry,
  getFeatDescriptionSlice: FeatDescriptionSliceGetter
): SpellEntry {
  return normalizedFeats.reduce<SpellEntry>((currentSpell, entry) => {
    if (entry.feat === FEATS.BOON_OF_DIMENSIONAL_TRAVEL) {
      const description = getFeatDescriptionSlice(
        FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
        isBoonOfDimensionalTravelBlinkStepsDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            getFeatLabel(FEATS.BOON_OF_DIMENSIONAL_TRAVEL),
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
      entry.boonOfIrresistibleOffense &&
      doesSpellDealAnyDamageType(currentSpell, [
        DAMAGE_TYPE.BLUDGEONING,
        DAMAGE_TYPE.PIERCING,
        DAMAGE_TYPE.SLASHING
      ])
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
        isBoonOfIrresistibleOffenseDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            getFeatLabel(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE),
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.BOON_OF_SPELL_RECALL &&
      currentSpell.spellLevel >= 1 &&
      currentSpell.spellLevel <= 4
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.BOON_OF_SPELL_RECALL,
        isBoonOfSpellRecallFreeCastingDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            getFeatLabel(FEATS.BOON_OF_SPELL_RECALL),
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.ELEMENTAL_ADEPT &&
      entry.elementalAdept &&
      doesSpellDealDamageType(currentSpell, entry.elementalAdept.damageType)
    ) {
      return appendSourcedDescriptionAddition(
        currentSpell,
        `Elemental Adept: Energy Mastery (${formatCodexLabel(entry.elementalAdept.damageType)})`,
        [elementalAdeptEnergyMasteryDescription]
      );
    }

    if (
      entry.feat === FEATS.SPELL_SNIPER &&
      entry.spellSniper &&
      currentSpell.isAttackSpell === true
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.SPELL_SNIPER,
        isSpellSniperDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            getFeatLabel(FEATS.SPELL_SNIPER),
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.TELEKINETIC &&
      entry.telekinetic &&
      currentSpell.id === telekineticMageHandSpellId
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.TELEKINETIC,
        isTelekineticMinorTelekinesisDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            "Telekinetic: Minor Telekinesis",
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING &&
      entry.emeraldEnclaveFledgling &&
      currentSpell.id === emeraldEnclaveFledglingSpeakWithAnimalsSpellId
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.EMERALD_ENCLAVE_FLEDGLING,
        isEmeraldEnclaveFledglingSpeakWithAnimalsDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(currentSpell, "Emerald Enclave Fledgling", description)
        : currentSpell;
    }

    if (
      entry.feat === FEATS.SPELLFIRE_SPARK &&
      entry.spellfireSpark &&
      currentSpell.id === spellfireSparkSacredFlameSpellId
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.SPELLFIRE_SPARK,
        isSpellfireSparkSpellfireFlameDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            "Spellfire Spark: Spellfire Flame",
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.TELEPATHIC &&
      entry.telepathic &&
      currentSpell.id === telepathicDetectThoughtsSpellId
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.TELEPATHIC,
        isTelepathicDetectThoughtsDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(currentSpell, "Telepathic: Detect Thoughts", description)
        : currentSpell;
    }

    if (
      entry.feat === FEATS.WAR_CASTER &&
      entry.warCaster &&
      currentSpell.components.includes(SPELL_COMPONENT.S)
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.WAR_CASTER,
        isWarCasterSomaticComponentsDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(
            currentSpell,
            "War Caster: Somatic Components",
            description
          )
        : currentSpell;
    }

    if (
      entry.feat === FEATS.PIERCER &&
      entry.piercer &&
      doesSpellDealDamageType(currentSpell, DAMAGE_TYPE.PIERCING)
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.PIERCER,
        isPiercerWeaponActionDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(currentSpell, getFeatLabel(FEATS.PIERCER), description)
        : currentSpell;
    }

    if (
      entry.feat === FEATS.POISONER &&
      entry.poisoner &&
      doesSpellDealDamageType(currentSpell, DAMAGE_TYPE.POISON)
    ) {
      const description = getFeatDescriptionSlice(
        FEATS.POISONER,
        isPoisonerPotentPoisonDescriptionEntry
      );

      return description.length > 0
        ? appendSourcedDescriptionAddition(currentSpell, "Poisoner: Potent Poison", description)
        : currentSpell;
    }

    if (entry.feat === FEATS.RITUAL_CASTER && entry.ritualCaster && currentSpell.ritual === true) {
      return appendSourcedDescriptionAddition(currentSpell, "Ritual Caster: Quick Ritual", [
        ritualCasterQuickRitualDescription
      ]);
    }

    if (
      entry.feat === FEATS.SHADOW_TOUCHED &&
      entry.shadowTouched &&
      (currentSpell.id === entry.shadowTouched.spellId ||
        currentSpell.id === shadowTouchedInvisibilitySpellId)
    ) {
      return appendSourcedDescriptionAddition(currentSpell, "Shadow-Touched: Shadow Magic", [
        shadowTouchedShadowMagicDescription
      ]);
    }

    if (
      entry.feat !== FEATS.FEY_TOUCHED ||
      !entry.feyTouched ||
      (currentSpell.id !== entry.feyTouched.spellId &&
        currentSpell.id !== feyTouchedMistyStepSpellId)
    ) {
      return currentSpell;
    }

    return appendSourcedDescriptionAddition(currentSpell, "Fey-Touched: Fey Magic", [
      feyTouchedFeyMagicDescription
    ]);
  }, spell);
}

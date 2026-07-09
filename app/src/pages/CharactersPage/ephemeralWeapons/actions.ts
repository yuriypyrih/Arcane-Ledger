import type { AbilityKey, Character } from "../../../types";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../../utils/codex";
import { getAbilityModifierForCharacter } from "../abilities";
import { ECONOMY_TYPE } from "../actionEconomy";
import { createWeaponAction, getProficiencyBonus, type WeaponAction } from "../gameplay";
import { getSpellcastingAbilityForCharacterSpell } from "../shared/spellcastingAbility";
import type {
  EphemeralWeaponActionContext,
  EphemeralWeaponCharacter,
  EphemeralWeaponDamageAbility,
  EphemeralWeaponDefinition
} from "./types";

function getSourceSpellId(definition: EphemeralWeaponDefinition): string | null {
  return definition.activation.kind === "spell-status" ? definition.activation.spellId : null;
}

function resolveFinesseAbility(character: EphemeralWeaponCharacter): AbilityKey {
  const strengthModifier = getAbilityModifierForCharacter(character, "STR");
  const dexterityModifier = getAbilityModifierForCharacter(character, "DEX");

  return dexterityModifier >= strengthModifier ? "DEX" : "STR";
}

function resolveEphemeralWeaponAbility(
  character: EphemeralWeaponCharacter,
  definition: EphemeralWeaponDefinition,
  context: EphemeralWeaponActionContext
): AbilityKey | null {
  if (typeof definition.ability === "function") {
    return definition.ability(character, context);
  }

  if (definition.ability === "finesse") {
    return resolveFinesseAbility(character);
  }

  if (definition.ability === "spellcasting") {
    const spellId = getSourceSpellId(definition);

    return spellId ? getSpellcastingAbilityForCharacterSpell(character as Character, spellId) : null;
  }

  return definition.ability;
}

function resolveDamageAbility(
  character: EphemeralWeaponCharacter,
  definition: EphemeralWeaponDefinition,
  context: EphemeralWeaponActionContext,
  attackAbility: AbilityKey
): { ability: AbilityKey; modifier: number } {
  const damageAbility: EphemeralWeaponDamageAbility = definition.damageAbility ?? "attack";

  if (damageAbility === "none") {
    return {
      ability: attackAbility,
      modifier: 0
    };
  }

  const resolvedAbility =
    damageAbility === "attack"
      ? attackAbility
      : typeof damageAbility === "function"
        ? damageAbility(character, context)
        : damageAbility;
  const ability = resolvedAbility ?? attackAbility;

  return {
    ability,
    modifier: getAbilityModifierForCharacter(character, ability)
  };
}

export function createEphemeralWeaponAction(
  character: EphemeralWeaponCharacter,
  definition: EphemeralWeaponDefinition,
  context: EphemeralWeaponActionContext = {}
): WeaponAction | null {
  if (definition.isAvailable && !definition.isAvailable(character, context)) {
    return null;
  }

  const damage =
    context.damage ?? definition.getDamage?.(character, context) ?? definition.damage ?? null;

  if (!damage) {
    return null;
  }

  const damageFormula = formatWeaponDamageFormula(damage);

  if (!damageFormula) {
    return null;
  }

  const ability = resolveEphemeralWeaponAbility(character, definition, context);

  if (!ability) {
    return null;
  }

  const abilityModifier = getAbilityModifierForCharacter(character, ability);
  const damageAbility = resolveDamageAbility(character, definition, context, ability);
  const description =
    context.description ?? definition.getDescription?.(character, context) ?? definition.description;
  const descriptionAdditions = [
    ...(definition.descriptionAdditions ?? []),
    ...(context.descriptionAdditions ?? [])
  ];
  const details =
    context.details ??
    definition.getDetails?.(character, {
      ...context,
      damage
    }) ??
    definition.details;
  const action = createWeaponAction(
    {
      abilities: character.abilities,
      className: character.className,
      classFeatureState: character.classFeatureState ?? {},
      feats: character.feats,
      level: character.level ?? 1,
      roundTracker: character.roundTracker,
      statusEntries: character.statusEntries ?? [],
      subclassId: character.subclassId
    },
    {
      key: context.key ?? definition.key,
      name: definition.name,
      attackKind: definition.attackKind,
      baseWeapon: definition.baseWeapon ?? null,
      combatType: definition.combatType ?? null,
      weaponTraining: definition.weaponTraining ?? null,
      properties: definition.properties ?? [],
      range: definition.range,
      mastery: definition.mastery ?? null,
      damageLabel: formatWeaponDamage(damage),
      damageFormula,
      rollFormulaBase: damageFormula,
      ability,
      abilityModifier,
      damageAbility: damageAbility.ability,
      damageAbilityModifier: damageAbility.modifier,
      proficiencyLabel: definition.proficiencyLabel,
      proficiencyBonus:
        definition.isProficient === false ? 0 : getProficiencyBonus(character.level ?? 1),
      damageBonusEntries: definition.damageBonusEntries,
      cardBonusLabels: definition.cardBonusLabels,
      description,
      descriptionAdditions,
      economyType: context.economyType ?? definition.economyType ?? ECONOMY_TYPE.ACTION,
      economyMultiCount: context.economyMultiCount ?? definition.economyMultiCount,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: false,
      hasActiveMastery: definition.hasActiveMastery,
      skipFeatureDerivedLookups: definition.skipFeatureDerivedLookups
    }
  );

  return {
    ...action,
    drawerEyebrow: definition.drawerEyebrow,
    details,
    facts: definition.facts
  };
}

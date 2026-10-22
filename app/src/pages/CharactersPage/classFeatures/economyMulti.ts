import type { SpellEntry } from "../../../codex/entries";
import { ACTION_TYPE } from "../../../codex/entries/enums";
import type { Character } from "../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type { RoundTrackerResource } from "../combat";
import type { WeaponAction } from "../gameplay";
import type {
  EconomyMultiActionContext,
  FeatureActionCard,
  FeatureActionOptionCard
} from "./types";
import { getEconomyPools, type EconomyCharacter } from "./economyPools";
import { applyEconomyPayment, resolveEconomyPayment } from "./economyPayment";
import { mysticArtsFlurrySpellPathId } from "./monk/subclasses/monkWarriorOfTheMysticArts";

export function createEconomyMultiContextForWeaponAction(
  action: Pick<
    WeaponAction,
    | "key"
    | "economyType"
    | "actionCategory"
    | "attackKind"
    | "combatType"
    | "inventoryStackId"
    | "inventoryFeatureTags"
  >
): EconomyMultiActionContext {
  return {
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    attackKind: action.attackKind,
    combatType: action.combatType,
    weaponActionKey: action.key,
    weaponInventoryStackId: action.inventoryStackId,
    weaponInventoryFeatureTags: action.inventoryFeatureTags
  };
}

export function createEconomyMultiContextForFeatureAction(
  action: Pick<FeatureActionCard, "economyType" | "actionCategory">
): EconomyMultiActionContext {
  return {
    economyType: action.economyType,
    actionCategory: action.actionCategory
  };
}

export function createEconomyMultiContextForFeatureActionOption(
  option: Pick<FeatureActionOptionCard, "economyType" | "actionCategory">
): EconomyMultiActionContext {
  return {
    economyType: option.economyType,
    actionCategory: option.actionCategory
  };
}

export function getEconomyTypeForSpell(
  spell: Pick<SpellEntry, "castingTime">
): EconomyMultiActionContext["economyType"] {
  if (spell.castingTime.includes(ACTION_TYPE.REACTION)) {
    return ECONOMY_TYPE.REACTION;
  }

  if (spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return ECONOMY_TYPE.BONUS_ACTION;
  }

  if (spell.castingTime.includes(ACTION_TYPE.ACTION)) {
    return ECONOMY_TYPE.ACTION;
  }

  return ECONOMY_TYPE.NON_COMBAT;
}

export function createEconomyMultiContextForSpell(
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">,
  path?: {
    id?: string;
    economyType?: EconomyMultiActionContext["economyType"];
    roundTrackerResource?: RoundTrackerResource | null;
  }
): EconomyMultiActionContext {
  return {
    economyType:
      path?.roundTrackerResource === "action"
        ? ECONOMY_TYPE.ACTION
        : path?.roundTrackerResource === "bonusAction"
          ? ECONOMY_TYPE.BONUS_ACTION
          : path?.roundTrackerResource === "reaction"
            ? ECONOMY_TYPE.REACTION
            : (path?.economyType ?? getEconomyTypeForSpell(spell)),
    actionCategory: ACTION_CATEGORY.MAGIC,
    spellLevel: spell.spellLevel,
    spellCastingTime: spell.castingTime,
    spellActionPathId: path?.id,
    poolOnly: path?.id === mysticArtsFlurrySpellPathId
  };
}

export function resolveEconomyPaymentForCharacterAction(
  character: EconomyCharacter,
  context: EconomyMultiActionContext
) {
  return resolveEconomyPayment(character, context, getEconomyPools(character));
}

/** Resolve again against the live character and return an explicit payment result. */
export function payEconomyForCharacterAction(
  character: Character,
  context: EconomyMultiActionContext
) {
  const pools = getEconomyPools(character);
  return applyEconomyPayment(character, resolveEconomyPayment(character, context, pools), pools);
}

export function canPaySpellEconomy(
  character: Character,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">,
  resource: RoundTrackerResource | null,
  pathId?: string | null
): boolean {
  if (!resource) return true;
  return (
    resolveEconomyPaymentForCharacterAction(
      character,
      createEconomyMultiContextForSpell(spell, {
        id: pathId ?? undefined,
        economyType:
          resource === "bonusAction"
            ? ECONOMY_TYPE.BONUS_ACTION
            : resource === "reaction"
              ? ECONOMY_TYPE.REACTION
              : ECONOMY_TYPE.ACTION
      })
    ).payment !== null
  );
}

export function getSharedEconomyMultiCountForCharacterAction(
  character: EconomyCharacter,
  context: EconomyMultiActionContext
): number {
  return resolveEconomyPaymentForCharacterAction(character, context).multiCount;
}

/** Compatibility API. New callers use the explicit payment result. */
export function consumeSharedEconomyMultiForCharacterAction(
  character: Character,
  context: EconomyMultiActionContext
): Character {
  return payEconomyForCharacterAction(character, context).character;
}

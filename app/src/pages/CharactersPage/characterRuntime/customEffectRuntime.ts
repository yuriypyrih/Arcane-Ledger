import type { Character } from "../../../types";
import type { CustomTraitBonusInput } from "../customTraitEffects";
import {
  getActiveItemModEffectSources,
  type CharacterItemModEffectSource
} from "../itemMods";

type CharacterCustomEffectContext = Partial<Pick<Character, "inventoryItems" | "statusEntries">>;

export type CharacterCustomEffectRuntime = {
  readonly itemModEffectSources: CharacterItemModEffectSource[];
  readonly customTraitEffectInput: CustomTraitBonusInput;
};

const customEffectRuntimeByContext = new WeakMap<object, CharacterCustomEffectRuntime>();

function createCharacterCustomEffectRuntime(
  context: CharacterCustomEffectContext
): CharacterCustomEffectRuntime {
  const itemModEffectSources = getActiveItemModEffectSources(context.inventoryItems);

  return {
    itemModEffectSources,
    customTraitEffectInput: {
      statusEntries: context.statusEntries,
      effectSources: itemModEffectSources
    }
  };
}

export function getCharacterCustomEffectRuntime(
  context: CharacterCustomEffectContext
): CharacterCustomEffectRuntime {
  const cachedRuntime = customEffectRuntimeByContext.get(context);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = createCharacterCustomEffectRuntime(context);
  customEffectRuntimeByContext.set(context, runtime);
  return runtime;
}

export function getCharacterCustomTraitEffectInput(
  context: CharacterCustomEffectContext
): CustomTraitBonusInput {
  return getCharacterCustomEffectRuntime(context).customTraitEffectInput;
}

export function getCharacterItemModEffectSources(
  context: CharacterCustomEffectContext
): CharacterItemModEffectSource[] {
  return getCharacterCustomEffectRuntime(context).itemModEffectSources;
}

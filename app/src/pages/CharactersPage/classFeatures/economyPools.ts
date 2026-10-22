import { ACTION_TYPE, CLASS_FEATURE } from "../../../codex/entries/enums";
import type { Character, CharacterClassFeatureState } from "../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { normalizeRoundTracker } from "../combat";
import { getCharacterClasses, getClassEditorCharacter } from "../multiclassState";
import { getCharacterClassRulesExtraAttackCount } from "../customClass";
import {
  hasActiveTashasOtherworldlyGuiseStatus,
  tashasOtherworldlyGuiseSpellId
} from "../characterRuntime/spellImplementations/tashasOtherworldlyGuise";
import {
  hasActiveTensersTransformationStatus,
  tensersTransformationSpellId
} from "../characterRuntime/spellImplementations/tensersTransformation";
import {
  getFighterAdditionalAttackCount,
  getFighterExtraAttacksRemainingThisTurn,
  getFighterNonMagicActionMultiCount
} from "./fighter/fighter";
import {
  getFighterEldritchKnightWarMagicRemainingUses,
  getFighterEldritchKnightWarMagicSpellLevels
} from "./fighter/subclasses/fighterEldritchKnight";
import { getBarbarianAdditionalAttackCount, getBarbarianRageState } from "./barbarian/barbarian";
import { getBarbarianPathOfTheBerserkerRetaliationAttackMultiCount } from "./barbarian/subclasses/barbarianPathOfTheBerserker";
import {
  getPaladinAdditionalAttackCount,
  getPaladinWeaponAttackMultiCount
} from "./paladin/paladin";
import { getRangerAdditionalAttackCount, getRangerWeaponAttackMultiCount } from "./ranger/ranger";
import {
  getBardCollegeOfValorAdditionalAttackCount,
  getBardCollegeOfValorWeaponAttackMultiCount
} from "./bard/subclasses/bardCollegeOfValor";
import {
  getWizardBladesingerAdditionalAttackCount,
  getWizardBladesingerWeaponAttackMultiCount
} from "./wizard/subclasses/wizardBladesinger";
import {
  hasArtificerExtraAttackFeature,
  getArtificerWeaponAttackMultiCount
} from "./artificer/artificer";
import {
  getWarlockPactBladeAdditionalAttackCount,
  getWarlockPactWeaponAttackMultiCount
} from "./warlock/warlock";
import { getCustomClassWeaponAttackMultiCount } from "./customClass/customClass";
import {
  hasMonkFeature,
  getMonkExtraAttackMultiCount,
  getMonkFlurryOfBlowsAttackMultiCount
} from "./monk/monk";
import { getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount } from "./monk/subclasses/monkWarriorOfShadow";
import {
  getMysticArtsCantripAccessRules,
  getMysticArtsSpellAccessRules
} from "./monk/subclasses/monkWarriorOfTheMysticArts";
import { replaceClassFeatureState } from "./shared/resourceState";
import type { EconomyAccessRule, EconomyPool } from "./economyPayment";

export type EconomyCharacter = Pick<
  Character,
  "className" | "level" | "classFeatureState" | "roundTracker"
> &
  Partial<
    Pick<
      Character,
      "subclassId" | "multiclass" | "classEntryId" | "classRules" | "customClass" | "statusEntries"
    >
  >;

const attackRule: EconomyAccessRule = {
  economyTypes: [ECONOMY_TYPE.ACTION],
  actionCategories: [ACTION_CATEGORY.ATTACK],
  attackKinds: ["weapon", "unarmed"],
  maxAccessible: "all"
};
const cantripRule: EconomyAccessRule = {
  economyTypes: [ECONOMY_TYPE.ACTION],
  actionCategories: [ACTION_CATEGORY.MAGIC],
  spellLevels: [0],
  spellCastingTimes: [ACTION_TYPE.ACTION],
  maxAccessible: 1
};
const bonusUnarmedRule: EconomyAccessRule = {
  economyTypes: [ECONOMY_TYPE.BONUS_ACTION],
  actionCategories: [ACTION_CATEGORY.ATTACK],
  attackKinds: ["unarmed"],
  maxAccessible: "all"
};

function writeCounter(
  character: Character,
  key: keyof CharacterClassFeatureState,
  counter: string,
  value: number | boolean,
  customEntryId?: string
): Character {
  if (customEntryId && character.multiclass) {
    return {
      ...character,
      multiclass: {
        ...character.multiclass,
        classes: character.multiclass.classes.map((entry) =>
          entry.id === customEntryId
            ? {
                ...entry,
                customFeatureState: {
                  ...entry.customFeatureState,
                  [key]: { ...entry.customFeatureState?.[key], [counter]: value }
                }
              }
            : entry
        )
      }
    };
  }
  return replaceClassFeatureState(character, key, {
    ...character.classFeatureState?.[key],
    [counter]: value
  } as NonNullable<CharacterClassFeatureState[typeof key]>);
}

function classPools(character: EconomyCharacter, customEntryId?: string): EconomyPool[] {
  const pools: EconomyPool[] = [];
  const add = (
    key: keyof CharacterClassFeatureState,
    remaining: number,
    extra: number,
    rules: EconomyAccessRule[] = [attackRule],
    onStart?: EconomyPool["onStart"]
  ) => {
    if (extra <= 0) return;
    pools.push({
      id: customEntryId ?? `${key}-extra-attack`,
      group: "attack",
      capacity: extra + 1,
      remaining: Math.max(0, Math.min(extra, remaining)),
      rules,
      onStart,
      writeRemaining: (next, value) =>
        writeCounter(next, key, "extraAttacksRemainingThisTurn", value, customEntryId)
    });
  };
  const independent = (
    id: string,
    key: keyof CharacterClassFeatureState,
    counter: string,
    remaining: number,
    rules: EconomyAccessRule[],
    group: EconomyPool["group"] = "independent"
  ) => {
    pools.push({
      id,
      group,
      remaining,
      capacity: 0,
      rules,
      writeRemaining: (next, value) => writeCounter(next, key, counter, value)
    });
  };
  const customExtra = getCharacterClassRulesExtraAttackCount(character);
  if (customExtra > 0) {
    add("customClass", getCustomClassWeaponAttackMultiCount(character), customExtra);
  } else {
    switch (character.className) {
      case "Fighter": {
        const remainingUses = getFighterEldritchKnightWarMagicRemainingUses(character);
        const levels = getFighterEldritchKnightWarMagicSpellLevels(character);
        add(
          "fighter",
          getFighterExtraAttacksRemainingThisTurn(character),
          getFighterAdditionalAttackCount(character),
          [
            attackRule,
            ...levels
              .filter(() => remainingUses > 0)
              .map((level) => ({
                ...cantripRule,
                spellLevels: [level],
                cost: level === 0 ? 1 : 2,
                maxAccessible: remainingUses,
                onSpend: (next: Character) =>
                  writeCounter(
                    next,
                    "fighter",
                    "eldritchKnightWarMagicUsesThisTurn",
                    (next.classFeatureState?.fighter?.eldritchKnightWarMagicUsesThisTurn ?? 0) + 1
                  )
              }))
          ],
          (next) => writeCounter(next, "fighter", "eldritchKnightWarMagicUsesThisTurn", 0)
        );
        break;
      }
      case "Barbarian":
        add(
          "rage",
          getBarbarianRageState(character).extraAttacksRemainingThisTurn ?? 0,
          getBarbarianAdditionalAttackCount(character)
        );
        break;
      case "Ranger":
        add(
          "ranger",
          getRangerWeaponAttackMultiCount(character),
          getRangerAdditionalAttackCount(character)
        );
        break;
      case "Paladin":
        add(
          "paladin",
          getPaladinWeaponAttackMultiCount(character),
          getPaladinAdditionalAttackCount(character)
        );
        break;
      case "Artificer":
        add(
          "artificer",
          getArtificerWeaponAttackMultiCount(character),
          hasArtificerExtraAttackFeature(character) ? 1 : 0
        );
        break;
      case "Monk":
        add(
          "monk",
          getMonkExtraAttackMultiCount(character),
          hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0,
          [
            attackRule,
            ...getMysticArtsCantripAccessRules(character),
            ...getMysticArtsSpellAccessRules(character, ECONOMY_TYPE.ACTION)
          ]
        );
        break;
      case "Warlock":
        add(
          "warlock",
          getWarlockPactWeaponAttackMultiCount(character),
          getWarlockPactBladeAdditionalAttackCount(character),
          [
            {
              ...attackRule,
              attackKinds: ["weapon"],
              weaponInventoryFeatureTags: ["pact-of-the-blade"]
            }
          ]
        );
        break;
      case "Bard":
        add(
          "bard",
          getBardCollegeOfValorWeaponAttackMultiCount(character),
          getBardCollegeOfValorAdditionalAttackCount(character),
          [
            attackRule,
            ...(!character.classFeatureState?.bard?.valorCantripReplacementUsedThisTurn
              ? [
                  {
                    ...cantripRule,
                    onSpend: (next: Character) =>
                      writeCounter(next, "bard", "valorCantripReplacementUsedThisTurn", true)
                  }
                ]
              : [])
          ],
          (next) => writeCounter(next, "bard", "valorCantripReplacementUsedThisTurn", false)
        );
        break;
      case "Wizard":
        add(
          "wizard",
          getWizardBladesingerWeaponAttackMultiCount(character),
          getWizardBladesingerAdditionalAttackCount(character),
          [
            attackRule,
            ...(!character.classFeatureState?.wizard?.bladesingerCantripReplacementUsedThisTurn
              ? [
                  {
                    ...cantripRule,
                    onSpend: (next: Character) =>
                      writeCounter(
                        next,
                        "wizard",
                        "bladesingerCantripReplacementUsedThisTurn",
                        true
                      )
                  }
                ]
              : [])
          ],
          (next) => writeCounter(next, "wizard", "bladesingerCantripReplacementUsedThisTurn", false)
        );
        break;
    }
  }
  if (character.className === "Monk") {
    independent(
      "monk-flurry",
      "monk",
      "flurryOfBlowsAttacksRemainingThisTurn",
      getMonkFlurryOfBlowsAttackMultiCount(character),
      [bonusUnarmedRule, ...getMysticArtsSpellAccessRules(character, ECONOMY_TYPE.BONUS_ACTION)]
    );
    independent(
      "monk-shadow-step",
      "monk",
      "warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn",
      getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount(character),
      [bonusUnarmedRule]
    );
  }
  if (character.className === "Barbarian") {
    independent(
      "barbarian-retaliation",
      "rage",
      "retaliationAttacksRemaining",
      getBarbarianPathOfTheBerserkerRetaliationAttackMultiCount(
        character,
        getBarbarianRageState(character)
      ),
      [attackRule]
    );
  }
  if (character.className === "Fighter") {
    independent(
      "fighter-action-surge",
      "fighter",
      "actionSurgeExtraActionsRemainingThisTurn",
      getFighterNonMagicActionMultiCount(character),
      [
        {
          economyTypes: [ECONOMY_TYPE.ACTION],
          actionCategories: [
            ACTION_CATEGORY.ATTACK,
            ACTION_CATEGORY.FEATURE,
            ACTION_CATEGORY.UTILITY,
            ACTION_CATEGORY.INTERACTION
          ],
          maxAccessible: "all"
        }
      ],
      "action-surge"
    );
  }
  return pools;
}

export function getEconomyPools(character: EconomyCharacter): EconomyPool[] {
  const pools = character.multiclass
    ? getCharacterClasses(character).flatMap((entry) =>
        classPools(
          { ...getClassEditorCharacter(character, entry), multiclass: undefined },
          entry.className === "Custom" ? entry.id : undefined
        )
      )
    : classPools(character);
  if (!pools.some((pool) => pool.group === "attack")) {
    for (const [id, active] of [
      [tashasOtherworldlyGuiseSpellId, hasActiveTashasOtherworldlyGuiseStatus(character)],
      [tensersTransformationSpellId, hasActiveTensersTransformationStatus(character)]
    ] as const) {
      if (!active) continue;
      const used = normalizeRoundTracker(character.roundTracker).spellExtraAttackUses?.[id];
      pools.push({
        id,
        group: "attack",
        capacity: 2,
        // A stored zero means an Attack action actually started. A spent Action alone does not.
        remaining: used === undefined ? 0 : Math.max(0, 1 - used),
        rules: [{ ...attackRule, attackKinds: ["weapon"] }],
        writeRemaining: (next, remaining) => ({
          ...next,
          roundTracker: {
            ...normalizeRoundTracker(next.roundTracker),
            spellExtraAttackUses: {
              ...next.roundTracker?.spellExtraAttackUses,
              [id]: 1 - remaining
            }
          }
        })
      });
    }
  }
  // Independent granted strikes (e.g. Retaliation) are consumed before the Attack action.
  return pools.sort(
    (left, right) => Number(left.group !== "independent") - Number(right.group !== "independent")
  );
}

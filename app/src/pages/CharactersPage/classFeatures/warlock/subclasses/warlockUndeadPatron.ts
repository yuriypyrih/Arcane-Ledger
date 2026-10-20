import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries/enums";
import {
  collectNecroticHuskContributions,
  normalizeUnholyResuscitationState
} from "./warlockNecroticHusk";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterWarlockFeatureState
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import { getClassLevel } from "../../../multiclassState";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../../statusEntries";
import { createChargesCardUsage, createChargesHeaderTag } from "../../cardUsage";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const undeadPatronSubclassId = "warlock-undead-patron";
export const formOfDreadActionKey = "warlock-undead-form-of-dread";
export const formOfDreadStatusSourceId = "feature-warlock-undead-form-of-dread";
const formOfDreadName = "Form of Dread";
const undeadSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Bane", "Blindness/Deafness", "Phantasmal Force", "Ray of Sickness"]),
  5: resolveSpellIdsByName(["Speak with Dead", "Summon Undead"]),
  7: resolveSpellIdsByName(["Greater Invisibility", "Phantasmal Killer"]),
  9: resolveSpellIdsByName(["Antilife Shell", "Cloudkill"])
};

export function hasFormOfDread(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.FORM_OF_DREAD) !== null;
}

export function getFormOfDreadUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasFormOfDread(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "CHA"))
    : 0;
}

export function normalizeWarlockUndeadFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<
  CharacterWarlockFeatureState,
  "formOfDreadUsesExpended" | "unholyResuscitationUsesExpended"
> {
  if (!hasFormOfDread(character)) return {};
  const expended = Number(value.formOfDreadUsesExpended);
  return {
    ...normalizeUnholyResuscitationState(value, character),
    formOfDreadUsesExpended: Number.isFinite(expended)
      ? Math.max(0, Math.min(getFormOfDreadUsesTotal(character), Math.floor(expended)))
      : 0
  };
}

export function getFormOfDreadUsesRemaining(character: SubclassRuntimeCharacter): number {
  return Math.max(
    0,
    getFormOfDreadUsesTotal(character) -
      (normalizeWarlockUndeadFeatureState(character.classFeatureState?.warlock ?? {}, character)
        .formOfDreadUsesExpended ?? 0)
  );
}

export function hasActiveFormOfDread(character: SubclassRuntimeCharacter): boolean {
  return (
    hasFormOfDread(character) &&
    !hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED) &&
    normalizeCharacterStatusEntries(character.statusEntries).some(
      (entry) => !entry.disabled && entry.sourceId === formOfDreadStatusSourceId
    )
  );
}

export function getFormOfDreadTemporaryHitPointsFormula(
  character: SubclassRuntimeCharacter
): string {
  return `1d10 + ${getClassLevel(character, "Warlock")}`;
}

export function activateFormOfDread(character: Character): Character {
  if (hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)) return character;
  const nextCharacter = spendClassResource(
    character,
    {
      stateKey: "warlock",
      counter: "formOfDreadUsesExpended",
      total: getFormOfDreadUsesTotal(character),
      remaining: getFormOfDreadUsesRemaining(character)
    },
    1
  );
  if (nextCharacter === character) return character;
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FORM_OF_DREAD)
    .filter((entry): entry is string => typeof entry === "string")
    .join("\n");
  return {
    ...nextCharacter,
    statusEntries: pruneLinkedStatusEntries([
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) =>
          entry.sourceId !== formOfDreadStatusSourceId &&
          entry.sourceId !== `${formOfDreadStatusSourceId}-frightened-immunity`
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: formOfDreadName,
        source: formOfDreadName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        sourceId: formOfDreadStatusSourceId,
        description,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        }
      }),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.IMMUNITIES,
        value: CONDITION_NAME.FRIGHTENED,
        source: formOfDreadName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        sourceId: `${formOfDreadStatusSourceId}-frightened-immunity`,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: formOfDreadName
        }
      })
    ])
  };
}

export function restoreFormOfDreadOnLongRest(character: Character): Character {
  if (
    !hasFormOfDread(character) ||
    !character.classFeatureState?.warlock?.formOfDreadUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "warlock", {
    ...character.classFeatureState?.warlock,
    formOfDreadUsesExpended: 0
  });
}

function collectUndeadPatronContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasFormOfDread(character)) return [];
  const graveTouched = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.GRAVE_TOUCHED
  );
  const superiorDread = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.SUPERIOR_DREAD
  );
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FORM_OF_DREAD);
  const frightfulAvatar = extractDescriptionSection(
    description.filter((entry): entry is string => typeof entry === "string"),
    "Frightful Avatar."
  );
  const usesTotal = getFormOfDreadUsesTotal(character);
  const usesRemaining = getFormOfDreadUsesRemaining(character);
  const active = hasActiveFormOfDread(character);
  const disabledReason =
    usesRemaining <= 0
      ? "No Form of Dread charges remaining."
      : hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)
        ? "You cannot transform while Incapacitated."
        : undefined;
  return [
    ...collectNecroticHuskContributions(character),
    ...(superiorDread
      ? [
          {
            source: createSubclassContributionSource({
              id: "warlock-undead-superior-dread",
              label: "Superior Dread",
              entryId: CLASS_FEATURE.SUPERIOR_DREAD
            }),
            featureActionTransforms: [
              {
                id: "warlock-undead-superior-dread-description",
                transform: (action) =>
                  action.key === formOfDreadActionKey
                    ? appendFeatureSourcedDescriptionAddition(
                        action,
                        character,
                        CLASS_FEATURE.SUPERIOR_DREAD,
                        superiorDread.description
                      )
                    : action
              }
            ],
            statuses: active
              ? [DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING].map(
                  (damageType) =>
                    createCharacterStatusEntry({
                      id: `feature-warlock-undead-superior-dread-${damageType.toLowerCase()}`,
                      sourceId: `feature-warlock-undead-superior-dread-${damageType.toLowerCase()}`,
                      group: STATUS_ENTRY_GROUP.RESISTANCES,
                      value: damageType,
                      source: "Superior Dread",
                      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
                      duration: { kind: STATUS_DURATION_KIND.INFINITE },
                      description: extractDescriptionSection(
                        superiorDread.description.filter(
                          (entry): entry is string => typeof entry === "string"
                        ),
                        "Dread Resistance."
                      ).join("\n")
                    })
                )
              : [],
            speedBonuses: active
              ? [
                  {
                    label: "Ghostly Flight",
                    movementType: "fly",
                    value: 0,
                    setBaseFromWalkMultiplier: 1,
                    hover: true
                  }
                ]
              : []
          } satisfies FeatureContributionSpec
        ]
      : []),
    ...(graveTouched
      ? [
          {
            source: createSubclassContributionSource({
              id: "warlock-undead-grave-touched",
              label: "Grave Touched",
              entryId: CLASS_FEATURE.GRAVE_TOUCHED
            }),
            featureActionTransforms: [
              {
                id: "warlock-undead-dreaded-necrosis-description",
                transform: (action) =>
                  action.key === formOfDreadActionKey
                    ? appendFeatureSourcedDescriptionAddition(
                        action,
                        character,
                        CLASS_FEATURE.GRAVE_TOUCHED,
                        extractDescriptionSection(
                          graveTouched.description.filter(
                            (entry): entry is string => typeof entry === "string"
                          ),
                          "Dreaded Necrosis."
                        )
                      )
                    : action
              }
            ],
            statuses: [
              createCharacterStatusEntry({
                id: "feature-warlock-undead-grave-touched",
                sourceId: "feature-warlock-undead-grave-touched",
                group: STATUS_ENTRY_GROUP.EFFECTS,
                value: "Grave Touched",
                source: "Grave Touched",
                sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
                duration: { kind: STATUS_DURATION_KIND.INFINITE },
                description: graveTouched.description
                  .filter((entry): entry is string => typeof entry === "string")
                  .join("\n")
              })
            ]
          } satisfies FeatureContributionSpec
        ]
      : []),
    {
      source: createSubclassContributionSource({
        id: "warlock-undead-spells",
        label: "Undead Spells",
        entryId: CLASS_FEATURE.UNDEAD_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        getClassLevel(character, "Warlock"),
        undeadSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: formOfDreadActionKey,
        label: formOfDreadName,
        entryId: CLASS_FEATURE.FORM_OF_DREAD
      }),
      actions: [
        {
          key: formOfDreadActionKey,
          name: formOfDreadName,
          sourceFeature: CLASS_FEATURE.FORM_OF_DREAD,
          summary: "Transform into a dreadful form for 10 turns.",
          detail: "Gain Temporary Hit Points and immunity to Frightened.",
          breakdown: "10 turns | Frightened immunity",
          economyType: ECONOMY_TYPE.BONUS_ACTION,
          actionCategory: ACTION_CATEGORY.FEATURE,
          usesRemaining,
          usesTotal,
          cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
          headerTags: [createChargesHeaderTag(usesRemaining, usesTotal, "Long Rest")],
          description,
          drawer: { kind: "confirm", description },
          execute: { kind: "activate" },
          isActive: active,
          disabled: Boolean(disabledReason),
          disabledReason
        }
      ],
      weaponActionTransforms: active
        ? [
            {
              id: "warlock-undead-frightful-avatar-weapon-description",
              transform: (_character, action) =>
                appendFeatureSourcedDescriptionAddition(
                  action as WeaponAction,
                  character,
                  CLASS_FEATURE.FORM_OF_DREAD,
                  frightfulAvatar
                )
            }
          ]
        : [],
      spellTransforms: active
        ? [
            {
              id: "warlock-undead-frightful-avatar-spell-description",
              transform: (spell) =>
                spell.isAttackSpell === true
                  ? appendFeatureSourcedDescriptionAddition(
                      spell,
                      character,
                      CLASS_FEATURE.FORM_OF_DREAD,
                      frightfulAvatar
                    )
                  : spell
            }
          ]
        : []
    }
  ];
}

export const getWarlockUndeadPatronDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectUndeadPatronContributions),
    { character: character as Character }
  );

import {
  CLASS_FEATURE,
  MAGIC_SCHOOL,
  SPELL_LIST_CLASS,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const evokerSubclassId = "wizard-evoker";
const potentCantripName = "Potent Cantrip";
const evokerSubclassEntry = getSubclassEntryById(evokerSubclassId);

function getWizardEvokerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = evokerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const potentCantripDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.POTENT_CANTRIP
);
const sculptSpellsDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.SCULPT_SPELLS
);
const empoweredEvocationDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.EMPOWERED_EVOCATION
);
const overchannelDescription = getWizardEvokerFeatureDescriptionEntries(CLASS_FEATURE.OVERCHANNEL);

function hasWizardEvokerPotentCantripFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWizardEvokerSculptSpellsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWizardEvokerEmpoweredEvocationFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 10
  );
}

export function hasWizardEvokerOverchannelFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function isWizardSpell(spell: Pick<SpellEntry, "spellLists">): boolean {
  return spell.spellLists.includes(SPELL_LIST_CLASS.WIZARD);
}

function isDamagingSpell(spell: Pick<SpellEntry, "damage" | "isDamagingSpell">): boolean {
  return spell.damage.length > 0 || spell.isDamagingSpell === true;
}

function spellQualifiesForWizardEvokerEmpoweredEvocation(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "damage" | "magicSchool" | "spellLists">
): boolean {
  return (
    hasWizardEvokerEmpoweredEvocationFeature(character) &&
    spell.magicSchool === MAGIC_SCHOOL.EVOCATION &&
    isWizardSpell(spell) &&
    spell.damage.length > 0
  );
}

export function spellQualifiesForWizardEvokerOverchannel(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "damage" | "isDamagingSpell" | "spellLevel" | "spellLists"> | null
): boolean {
  return (
    spell !== null &&
    hasWizardEvokerOverchannelFeature(character) &&
    isWizardSpell(spell) &&
    isDamagingSpell(spell) &&
    spell.spellLevel >= 1 &&
    spell.spellLevel <= 5
  );
}

export function canUseWizardEvokerOverchannelForSpellSlot(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "damage" | "isDamagingSpell" | "spellLevel" | "spellLists"> | null,
  spellSlotLevel: number
): boolean {
  return (
    spellQualifiesForWizardEvokerOverchannel(character, spell) &&
    Number.isFinite(spellSlotLevel) &&
    spellSlotLevel >= 1 &&
    spellSlotLevel <= 5
  );
}

export function getWizardEvokerEmpoweredEvocationDamageDetail(
  character: Pick<Character, "abilities" | "className"> &
    Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "damage" | "magicSchool" | "spellLists">,
  baseDamageDetail: string
): string {
  if (!spellQualifiesForWizardEvokerEmpoweredEvocation(character, spell)) {
    return baseDamageDetail;
  }

  const intelligenceModifier = getAbilityModifierForCharacter(character, "INT");
  const signedIntelligenceModifier =
    intelligenceModifier >= 0 ? `+ ${intelligenceModifier}` : `- ${Math.abs(intelligenceModifier)}`;

  return `${baseDamageDetail} ${signedIntelligenceModifier} INT (Empowered Evocation)`;
}

export function getWizardEvokerOverchannelUsesSinceLongRest(
  character: Partial<Pick<Character, "classFeatureState">>
): number {
  const rawUses = Number(character.classFeatureState?.wizard?.overchannelUsesSinceLongRest);

  return Number.isFinite(rawUses) ? Math.max(0, Math.floor(rawUses)) : 0;
}

export function getWizardEvokerOverchannelNecroticDamageFormula(
  character: Partial<Pick<Character, "classFeatureState">>
): string {
  const usesSinceLongRest = getWizardEvokerOverchannelUsesSinceLongRest(character);

  return usesSinceLongRest <= 0 ? "0" : `${usesSinceLongRest + 1}d12`;
}

export function applyWizardEvokerOverchannelUse(character: Character): Character {
  if (!hasWizardEvokerOverchannelFeature(character)) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};
  const nextUsesSinceLongRest = getWizardEvokerOverchannelUsesSinceLongRest(character) + 1;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        overchannelUsesSinceLongRest: nextUsesSinceLongRest
      }
    }
  };
}

export function restoreWizardEvokerOverchannelOnLongRest(character: Character): Character {
  const wizardState = character.classFeatureState?.wizard ?? {};

  if (!hasWizardEvokerOverchannelFeature(character) && !wizardState.overchannelUsesSinceLongRest) {
    return character;
  }

  if ((wizardState.overchannelUsesSinceLongRest ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        overchannelUsesSinceLongRest: 0
      }
    }
  };
}

function appendWizardEvokerPotentCantripDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (spell.spellLevel !== 0 || spell.damage.length <= 0) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.POTENT_CANTRIP,
    potentCantripDescription,
    potentCantripName
  );
}

export function getWizardEvokerSpellbookSpellEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  const spellWithSculptSpells =
    spell.magicSchool === MAGIC_SCHOOL.EVOCATION && hasWizardEvokerSculptSpellsFeature(character)
      ? appendFeatureSourcedDescriptionAddition(
          spell,
          character,
          CLASS_FEATURE.SCULPT_SPELLS,
          sculptSpellsDescription,
          "Sculpt Spells"
        )
      : spell;

  const spellWithEmpoweredEvocation = spellQualifiesForWizardEvokerEmpoweredEvocation(
    character,
    spell
  )
    ? appendFeatureSourcedDescriptionAddition(
        spellWithSculptSpells,
        character,
        CLASS_FEATURE.EMPOWERED_EVOCATION,
        empoweredEvocationDescription,
        "Empowered Evocation"
      )
    : spellWithSculptSpells;

  return spellQualifiesForWizardEvokerOverchannel(character, spell)
    ? appendFeatureSourcedDescriptionAddition(
        spellWithEmpoweredEvocation,
        character,
        CLASS_FEATURE.OVERCHANNEL,
        overchannelDescription,
        "Overchannel"
      )
    : spellWithEmpoweredEvocation;
}

function createWizardEvokerSource(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}) {
  return createSubclassContributionSource({
    ...input,
    id: `wizard-evoker-${input.id}`
  });
}

export function collectWizardEvokerContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (
    character.className !== "Wizard" ||
    character.subclassId !== evokerSubclassId ||
    typeof character.level !== "number"
  ) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    {
      source: createWizardEvokerSource({
        id: "evocation-savant",
        label: "Evocation Savant",
        entryId: CLASS_FEATURE.EVOCATION_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        className: character.className,
        level: character.level,
        subclassId: character.subclassId,
        classFeatureState: character.classFeatureState
      })
    }
  ];

  if (hasWizardEvokerPotentCantripFeature(character)) {
    contributions.push({
      source: createWizardEvokerSource({
        id: "potent-cantrip",
        label: potentCantripName,
        entryId: CLASS_FEATURE.POTENT_CANTRIP
      }),
      spellTransforms: [
        {
          id: "wizard-evoker-potent-cantrip-spell-transform",
          transform: (spell) => appendWizardEvokerPotentCantripDescription(character, spell)
        }
      ]
    });
  }

  if (hasWizardEvokerSculptSpellsFeature(character)) {
    contributions.push({
      source: createWizardEvokerSource({
        id: "sculpt-spells",
        label: "Sculpt Spells",
        entryId: CLASS_FEATURE.SCULPT_SPELLS
      })
    });
  }

  if (hasWizardEvokerEmpoweredEvocationFeature(character)) {
    contributions.push({
      source: createWizardEvokerSource({
        id: "empowered-evocation",
        label: "Empowered Evocation",
        entryId: CLASS_FEATURE.EMPOWERED_EVOCATION
      })
    });
  }

  if (hasWizardEvokerOverchannelFeature(character)) {
    contributions.push({
      source: createWizardEvokerSource({
        id: "overchannel",
        label: "Overchannel",
        entryId: CLASS_FEATURE.OVERCHANNEL
      })
    });
  }

  return contributions;
}

export const getWizardEvokerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectWizardEvokerContributions(character)),
    {
      character: character as Character
    }
  );

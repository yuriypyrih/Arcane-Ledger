import type { Dispatch, ReactNode, SetStateAction } from "react";
import CellContainer from "../../../../../CellContainer/CellContainer";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../pages/CharactersPage/spellcasting";
import SelectInput from "../../../../FormInputs/SelectInput";
import SearchField from "../../../../../SearchField";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { createCharacterStatusEntry } from "../../../../../../pages/CharactersPage/statusEntries";
import { consumeRoundTrackerResource } from "../../../../../../pages/CharactersPage/combat";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";
import type { Character, DruidCosmicOmenSelection } from "../../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../../types";
import {
  type FeatureActionFact,
  type FeatureActionHeaderTag,
  activateBarbarianBerserkerRetaliationForCharacter,
  activateBardCollegeOfDanceInspiringMovementForCharacter,
  activateRangerHunterSuperiorHuntersDefenseForCharacter,
  clericWardingFlareReactionEntryId,
  clericGuidedStrikeReactionEntryId,
  consumeClericGuidedStrikeReactionForCharacter,
  consumeClericWardingFlareUseForCharacter,
  consumeDruidCosmicOmenUseForCharacter,
  consumeElementalRebukeUseForCharacter,
  consumeFighterIndomitableUseForCharacter,
  consumeGloriousDefenseUseForCharacter,
  consumeRangerWinterWalkerChillingRetributionUseForCharacter,
  consumeRogueScionOfTheThreeBloodthirstUseForCharacter,
  consumeRogueSpellThiefUseForCharacter,
  consumeSorcererRestoreBalanceUseForCharacter,
  consumeWarlockBeguilingDefenseUseForCharacter,
  consumeWizardIllusionistIllusorySelfUseForCharacter,
  expendBardicInspirationUseForCharacter,
  expendFighterPsiWarriorEnergyDieForCharacter,
  expendSorceryPointForCharacter,
  getFighterIndomitableUsesRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getRogueScionOfTheThreeAuraOfMalevolenceFactsForCharacter,
  paladinElementalRebukeReactionEntryId,
  paladinGloriousDefenseReactionEntryId,
  paladinSoulOfVengeanceReactionEntryId,
  rangerHunterSuperiorHuntersDefenseDamageTypeOptions,
  rangerWinterWalkerChillingRetributionReactionEntryId,
  rogueScionOfTheThreeBloodthirstReactionEntryId,
  sorcererBendLuckReactionEntryId,
  sorcererRestoreBalanceReactionEntryId,
  warlockBeguilingDefenseReactionEntryId,
  wizardIllusionistIllusorySelfReactionEntryId
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  createChargesAndUsageHeaderTags,
  createChargesHeaderTag,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { barbarianBerserkerRetaliationReactionId } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/subclasses/barbarianPathOfTheBerserker";
import { barbarianWorldTreeBranchesOfTheTreeReactionId } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/subclasses/barbarianPathOfTheWorldTree";
import { bardCollegeOfDanceInspiringMovementReactionId } from "../../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfDance";
import { druidCosmicOmenReactionId } from "../../../../../../pages/CharactersPage/classFeatures/druid/subclasses/druidCircleOfTheStars";
import { superiorHuntersDefenseReactionId } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerHunter";
import {
  getRogueArcaneTricksterSpellThiefStatusSourceId,
  isRogueArcaneTricksterSpellThiefStatusSourceId,
  rogueArcaneTricksterSpellThiefReactionId
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import {
  hasActiveWizardBladesong,
  wizardBladesingerSongOfDefenseReactionId
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import {
  ABILITY_TYPES,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../../codex/entries";
import { defensiveDuelistParryReactionEntryId } from "../../../../../../pages/CharactersPage/feats/runtime";
import { characterHasHeldFinesseWeapon } from "../../../../../../pages/CharactersPage/heldWeapons";
import { formatCodexLabel } from "../../../../../../utils/codex";
import { getSpellSaveFormulaCell } from "../../../../../../pages/CharactersPage/shared/spellFormulas";
import DruidCosmicOmenReactionBody from "./DruidCosmicOmenReactionBody";
import {
  createDeflectAttacksReactionRollRequest,
  getDeflectAttacksReactionFacts,
  getSlowFallReactionFacts
} from "./deflectAttacksReactionUtils";
import {
  createElementalRebukeReactionRollRequest,
  getElementalRebukeReactionFacts
} from "./elementalRebukeReactionUtils";
import styles from "./TraitsConditionsWidget.module.css";

export const spellThiefSearchResultLimit = 50;

export function formatSpellThiefSpellOptionLabel(spell: SpellEntry): string {
  return `${spell.name} (${spell.spellLevel === 0 ? "Cantrip" : `Level ${spell.spellLevel}`})`;
}

export type ReactionDescriptorContext = {
  availableSongOfDefenseSpellSlotLevels: number[];
  bardicInspirationUsesRemaining: number;
  bardicInspirationUsesTotal: number;
  bloodthirstUsesRemaining: number;
  bloodthirstUsesTotal: number;
  channelDivinityUsesRemaining: number;
  channelDivinityUsesTotal: number;
  character: Character;
  chillingRetributionUsesRemaining: number;
  chillingRetributionUsesTotal: number;
  cosmicOmenUsesRemaining: number;
  cosmicOmenUsesTotal: number;
  elementalRebukeUsesRemaining: number;
  elementalRebukeUsesTotal: number;
  gloriousDefenseUsesRemaining: number;
  gloriousDefenseUsesTotal: number;
  hasActiveVowOfEnmity: boolean;
  restoreBalanceUsesRemaining: number;
  restoreBalanceUsesTotal: number;
  selectedBranchesOfTheTreeDcFormula: string | null;
  selectedCosmicOmenSelection: DruidCosmicOmenSelection;
  selectedRangerHunterSuperiorHuntersDefenseDamageType: string | null;
  selectedReactionEntry: ReactionEntry;
  selectedSongOfDefenseDamageReduction: number;
  selectedSongOfDefenseSpellSlotLevel: number;
  selectedSpellThiefSpell: SpellEntry | null;
  selectedSpellThiefSpellId: string;
  setSelectedSongOfDefenseSpellSlotLevel: Dispatch<SetStateAction<number>>;
  setSelectedSpellThiefSpellId: Dispatch<SetStateAction<string>>;
  setSpellThiefSearchQuery: Dispatch<SetStateAction<string>>;
  sorceryPointsRemaining: number;
  sorceryPointsTotal: number;
  spellSlotTotals: number[];
  spellSlotsRemaining: number[];
  spellThiefFilteredSpellOptions: SpellEntry[];
  spellThiefSearchQuery: string;
  spellThiefUsesRemaining: number;
  spellThiefUsesTotal: number;
  spellThiefVisibleSpellOptions: SpellEntry[];
  updateDruidCosmicOmenSelection: (nextSelection: DruidCosmicOmenSelection) => void;
  updateRangerHunterSuperiorHuntersDefenseDamageType: (nextValue: string) => void;
  warlockBeguilingDefenseUsesRemaining: number;
  warlockBeguilingDefenseUsesTotal: number;
  warlockPactMagicSlotTotal: number;
  warlockPactMagicSlotsRemaining: number;
  wardingFlareUsesRemaining: number;
  wardingFlareUsesTotal: number;
  wizardIllusionistIllusorySelfFallbackSlotSummary: {
    remaining: number;
    total: number;
  };
  wizardIllusionistIllusorySelfUsesRemaining: number;
  wizardIllusionistIllusorySelfUsesTotal: number;
};

export type ReactionDescriptor = {
  id: string;
  createRollRequest?: (context: ReactionDescriptorContext) => DiceRollerRequest | null;
  footerActionName?: string;
  getFacts?: (context: ReactionDescriptorContext) => FeatureActionFact[];
  getFactsSectionTitle?: (context: ReactionDescriptorContext) => string | null | undefined;
  getHeaderTags?: (context: ReactionDescriptorContext) => FeatureActionHeaderTag[];
  getResourceSummary?: (context: ReactionDescriptorContext) => string | null;
  getResourceWarning?: (context: ReactionDescriptorContext) => string | null;
  getSelectionWarning?: (context: ReactionDescriptorContext) => string | null;
  renderCustomContent?: (context: ReactionDescriptorContext) => ReactNode;
  apply?: (currentCharacter: Character, context: ReactionDescriptorContext) => Character;
  skipReactionWhenUnchanged?: boolean;
};

function spendSongOfDefenseSpellSlot(
  currentCharacter: Character,
  context: ReactionDescriptorContext
): Character {
  if (!hasActiveWizardBladesong(currentCharacter)) {
    return currentCharacter;
  }

  const slotLevel = Math.max(
    1,
    Math.min(9, Math.floor(context.selectedSongOfDefenseSpellSlotLevel || 1))
  );
  const spellSlotTotalsForCurrentCharacter = getSpellSlotTotalsForCharacter(
    currentCharacter.className,
    currentCharacter.level,
    currentCharacter.subclassId
  );
  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
    currentCharacter.spellSlotsExpended,
    spellSlotTotalsForCurrentCharacter
  );

  if (
    (spellSlotTotalsForCurrentCharacter[slotLevel - 1] ?? 0) <=
    (nextSpellSlotsExpended[slotLevel - 1] ?? 0)
  ) {
    return currentCharacter;
  }

  nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

  return {
    ...currentCharacter,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

function applySpellThief(
  currentCharacter: Character,
  context: ReactionDescriptorContext
): Character {
  if (!context.selectedSpellThiefSpell) {
    return currentCharacter;
  }

  const consumedCharacter = consumeRogueSpellThiefUseForCharacter(currentCharacter);

  if (consumedCharacter === currentCharacter) {
    return currentCharacter;
  }

  return {
    ...consumedCharacter,
    statusEntries: [
      ...(consumedCharacter.statusEntries ?? []).filter(
        (entry) => !isRogueArcaneTricksterSpellThiefStatusSourceId(entry.sourceId)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: context.selectedSpellThiefSpell.name,
        source: "Spell Thief",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.HOURS,
          amount: 8
        },
        sourceId: getRogueArcaneTricksterSpellThiefStatusSourceId(
          context.selectedSpellThiefSpell.id
        )
      })
    ]
  };
}

function renderSongOfDefenseSlotSelector(context: ReactionDescriptorContext): ReactNode {
  return (
    <label className={shared.field}>
      <span className={shared.fieldLabel}>Spell Slot</span>
      <SelectInput
        value={
          context.availableSongOfDefenseSpellSlotLevels.includes(
            context.selectedSongOfDefenseSpellSlotLevel
          )
            ? String(context.selectedSongOfDefenseSpellSlotLevel)
            : ""
        }
        onChange={(event) =>
          context.setSelectedSongOfDefenseSpellSlotLevel(Number(event.target.value) || 1)
        }
      >
        <option value="">Select a spell slot</option>
        {context.availableSongOfDefenseSpellSlotLevels.map((slotLevel) => (
          <option key={slotLevel} value={slotLevel}>
            {`Level ${slotLevel} (${context.spellSlotsRemaining[slotLevel - 1] ?? 0} remaining) - reduce ${slotLevel * 5}`}
          </option>
        ))}
      </SelectInput>
    </label>
  );
}

function renderSuperiorHuntersDefenseDamageTypeSelector(
  context: ReactionDescriptorContext
): ReactNode {
  return (
    <label className={shared.field}>
      <span className={shared.fieldLabel}>Damage Type</span>
      <SelectInput
        value={context.selectedRangerHunterSuperiorHuntersDefenseDamageType ?? ""}
        onChange={(event) =>
          context.updateRangerHunterSuperiorHuntersDefenseDamageType(event.target.value)
        }
      >
        <option value="">Select a damage type</option>
        {rangerHunterSuperiorHuntersDefenseDamageTypeOptions.map((damageType) => (
          <option key={damageType} value={damageType}>
            {formatCodexLabel(damageType)}
          </option>
        ))}
      </SelectInput>
    </label>
  );
}

function renderBranchesOfTheTreeDcFormula(context: ReactionDescriptorContext): ReactNode {
  if (!context.selectedBranchesOfTheTreeDcFormula) {
    return null;
  }

  return (
    <div className={sheetStyles.spellDrawerDetails}>
      <CellContainer label="DC Formula" content={context.selectedBranchesOfTheTreeDcFormula} />
    </div>
  );
}

function renderBeguilingDefenseDcFormula(context: ReactionDescriptorContext): ReactNode {
  const formulaCell = getSpellSaveFormulaCell(
    {
      isAttackSpell: false,
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.WIS,
      spellLists: []
    },
    context.character
  );

  if (!formulaCell) {
    return null;
  }

  return (
    <div className={styles.reactionCustomContent}>
      <CellContainer
        label="Wisdom DC Formula"
        content={formulaCell.content}
        breakdown={formulaCell.breakdown}
      />
    </div>
  );
}

function renderSpellThiefSelector(context: ReactionDescriptorContext): ReactNode {
  return (
    <div className={styles.spellThiefFieldGroup}>
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Spell Search</span>
        <SearchField
          value={context.spellThiefSearchQuery}
          onValueChange={context.setSpellThiefSearchQuery}
          placeholder="Search all spells"
          className={styles.spellThiefSearchInput}
        />
      </label>
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Spell</span>
        <SelectInput
          value={context.selectedSpellThiefSpellId}
          onChange={(event) => context.setSelectedSpellThiefSpellId(event.target.value)}
        >
          <option value="">Select a spell</option>
          {context.spellThiefVisibleSpellOptions.map((spell) => (
            <option key={spell.id} value={spell.id}>
              {formatSpellThiefSpellOptionLabel(spell)}
            </option>
          ))}
        </SelectInput>
      </label>
      <p className={shared.helperText}>
        {context.spellThiefFilteredSpellOptions.length > spellThiefSearchResultLimit
          ? `Showing ${spellThiefSearchResultLimit} of ${context.spellThiefFilteredSpellOptions.length} matching spells. Refine the search to narrow the list.`
          : `${context.spellThiefFilteredSpellOptions.length} spell${context.spellThiefFilteredSpellOptions.length === 1 ? "" : "s"} found.`}
      </p>
      {context.selectedSpellThiefSpell ? (
        <p className={styles.spellThiefSelectionSummary}>
          Selected: {formatSpellThiefSpellOptionLabel(context.selectedSpellThiefSpell)}
        </p>
      ) : null}
    </div>
  );
}

const descriptors: ReactionDescriptor[] = [
  {
    id: druidCosmicOmenReactionId,
    getResourceWarning: (context) =>
      context.cosmicOmenUsesRemaining <= 0 ? "No Cosmic Omen uses remaining." : null,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.cosmicOmenUsesRemaining, context.cosmicOmenUsesTotal)
    ],
    renderCustomContent: (context) => (
      <DruidCosmicOmenReactionBody
        character={context.character}
        selectedSelection={context.selectedCosmicOmenSelection}
        onSelectSelection={context.updateDruidCosmicOmenSelection}
      />
    ),
    apply: consumeDruidCosmicOmenUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: "reaction-cutting-words",
    getResourceWarning: (context) =>
      context.bardicInspirationUsesRemaining <= 0 ? "No Bardic Inspiration uses remaining." : null,
    apply: expendBardicInspirationUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: bardCollegeOfDanceInspiringMovementReactionId,
    getResourceWarning: (context) =>
      context.bardicInspirationUsesRemaining <= 0 ? "No Bardic Inspiration uses remaining." : null,
    getResourceSummary: (context) =>
      `${context.bardicInspirationUsesRemaining}/${context.bardicInspirationUsesTotal} Bardic Inspiration uses | Cost: 1`,
    getHeaderTags: (context) =>
      createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "music"
        }),
        context.bardicInspirationUsesRemaining,
        context.bardicInspirationUsesTotal,
        {
          icon: "music"
        }
      ),
    apply: activateBardCollegeOfDanceInspiringMovementForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: "reaction-banneret-shared-resilience",
    getResourceWarning: (context) =>
      getFighterIndomitableUsesRemainingForCharacter(context.character) <= 0
        ? "No Indomitable uses remaining."
        : null,
    apply: consumeFighterIndomitableUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: "reaction-psi-warrior-protective-field",
    getResourceWarning: (context) =>
      getFighterPsiWarriorEnergyDiceRemainingForCharacter(context.character) <= 0
        ? "No Psi Energy Dice remaining."
        : null,
    getHeaderTags: (context) =>
      createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "psi"
        }),
        getFighterPsiWarriorEnergyDiceRemainingForCharacter(context.character),
        getFighterPsiWarriorEnergyDiceTotalForCharacter(context.character),
        {
          icon: "psi"
        }
      ),
    apply: expendFighterPsiWarriorEnergyDieForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: sorcererBendLuckReactionEntryId,
    footerActionName: "Bend Luck",
    createRollRequest: () => ({
      title: "Bend Luck",
      description: "Bend Luck modifier roll",
      formula: "1d4",
      formulaDisplay: "1d4",
      entries: [
        {
          label: "Modifier",
          formula: "1d4",
          formulaDisplay: "1d4"
        }
      ]
    }),
    getResourceWarning: (context) =>
      context.sorceryPointsRemaining <= 0 ? "You need 1 Sorcery Point." : null,
    getHeaderTags: (context) =>
      createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "sparkles"
        }),
        context.sorceryPointsRemaining,
        context.sorceryPointsTotal,
        {
          icon: "sparkles"
        }
      ),
    apply: expendSorceryPointForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: sorcererRestoreBalanceReactionEntryId,
    getResourceWarning: (context) =>
      context.restoreBalanceUsesRemaining <= 0 ? "No Restore Balance uses remaining." : null,
    getResourceSummary: () => null,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.restoreBalanceUsesRemaining, context.restoreBalanceUsesTotal)
    ],
    apply: consumeSorcererRestoreBalanceUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: clericGuidedStrikeReactionEntryId,
    getResourceWarning: (context) =>
      context.channelDivinityUsesRemaining <= 0 ? "No Channel Divinity uses remaining." : null,
    getHeaderTags: (context) =>
      createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "pyromancy"
        }),
        context.channelDivinityUsesRemaining,
        context.channelDivinityUsesTotal,
        {
          icon: "pyromancy"
        }
      ),
    apply: consumeClericGuidedStrikeReactionForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: clericWardingFlareReactionEntryId,
    getResourceWarning: (context) =>
      context.wardingFlareUsesRemaining <= 0 ? "No Warding Flare uses remaining." : null,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.wardingFlareUsesRemaining, context.wardingFlareUsesTotal)
    ],
    apply: consumeClericWardingFlareUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: paladinGloriousDefenseReactionEntryId,
    getResourceWarning: (context) =>
      context.gloriousDefenseUsesRemaining <= 0 ? "No Glorious Defense charges remaining." : null,
    getResourceSummary: (context) =>
      `${context.gloriousDefenseUsesRemaining}/${context.gloriousDefenseUsesTotal} charges | Long Rest`,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.gloriousDefenseUsesRemaining, context.gloriousDefenseUsesTotal)
    ],
    apply: consumeGloriousDefenseUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: paladinSoulOfVengeanceReactionEntryId,
    getResourceWarning: (context) =>
      context.hasActiveVowOfEnmity
        ? null
        : "Vow of Enmity must be active to use this reaction. Attack a creature with the Vow of Enmity option enabled."
  },
  {
    id: paladinElementalRebukeReactionEntryId,
    footerActionName: "Elemental Rebuke",
    createRollRequest: (context) => createElementalRebukeReactionRollRequest(context.character),
    getFacts: (context) => getElementalRebukeReactionFacts(context.character),
    getFactsSectionTitle: () => null,
    getResourceWarning: (context) =>
      context.elementalRebukeUsesRemaining <= 0 ? "No Elemental Rebuke charges remaining." : null,
    getResourceSummary: (context) =>
      `${context.elementalRebukeUsesRemaining}/${context.elementalRebukeUsesTotal} charges | Long Rest`,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.elementalRebukeUsesRemaining, context.elementalRebukeUsesTotal)
    ],
    apply: consumeElementalRebukeUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: rogueScionOfTheThreeBloodthirstReactionEntryId,
    getFacts: (context) =>
      getRogueScionOfTheThreeAuraOfMalevolenceFactsForCharacter(context.character),
    getResourceWarning: (context) =>
      context.bloodthirstUsesRemaining <= 0 ? "No Bloodthirst uses remaining." : null,
    getResourceSummary: () => null,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.bloodthirstUsesRemaining, context.bloodthirstUsesTotal)
    ],
    apply: consumeRogueScionOfTheThreeBloodthirstUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: rangerWinterWalkerChillingRetributionReactionEntryId,
    getResourceWarning: (context) =>
      context.chillingRetributionUsesRemaining <= 0
        ? "No Chilling Retribution charges remaining."
        : null,
    getResourceSummary: (context) =>
      `${context.chillingRetributionUsesRemaining}/${context.chillingRetributionUsesTotal} charges | Long Rest`,
    getHeaderTags: (context) => [
      createChargesHeaderTag(
        context.chillingRetributionUsesRemaining,
        context.chillingRetributionUsesTotal,
        "Long Rest"
      )
    ],
    apply: consumeRangerWinterWalkerChillingRetributionUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: wizardIllusionistIllusorySelfReactionEntryId,
    getResourceWarning: (context) =>
      context.wizardIllusionistIllusorySelfUsesRemaining <= 0 &&
      context.wizardIllusionistIllusorySelfFallbackSlotSummary.remaining <= 0
        ? "No Illusory Self charge or level 2+ spell slots remaining."
        : null,
    getResourceSummary: () => null,
    getHeaderTags: (context) =>
      createChargesAndUsageHeaderTags(
        context.wizardIllusionistIllusorySelfUsesRemaining,
        context.wizardIllusionistIllusorySelfUsesTotal,
        createFeatureActionCardCost({
          amountText: "2+",
          resourceLabel: "Spell Slot"
        }),
        context.wizardIllusionistIllusorySelfFallbackSlotSummary.remaining,
        context.wizardIllusionistIllusorySelfFallbackSlotSummary.total,
        {
          label: "Spell Slots"
        },
        undefined,
        {
          isFallback: true
        }
      ),
    apply: consumeWizardIllusionistIllusorySelfUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: warlockBeguilingDefenseReactionEntryId,
    getResourceWarning: (context) =>
      context.warlockBeguilingDefenseUsesRemaining <= 0 &&
      context.warlockPactMagicSlotsRemaining <= 0
        ? "No Beguiling Defense charges or Pact Magic spell slots remaining."
        : null,
    getHeaderTags: (context) =>
      createChargesAndUsageHeaderTags(
        context.warlockBeguilingDefenseUsesRemaining,
        context.warlockBeguilingDefenseUsesTotal,
        createFeatureActionCardCost({
          resourceLabel: "Pact Magic Slot"
        }),
        context.warlockPactMagicSlotsRemaining,
        context.warlockPactMagicSlotTotal,
        {
          label: "Pact Magic Slots"
        },
        "Long Rest",
        {
          isFallback: true
        }
      ),
    renderCustomContent: renderBeguilingDefenseDcFormula,
    apply: consumeWarlockBeguilingDefenseUseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: wizardBladesingerSongOfDefenseReactionId,
    getResourceWarning: (context) =>
      context.availableSongOfDefenseSpellSlotLevels.length <= 0
        ? "No spell slots remaining."
        : !context.availableSongOfDefenseSpellSlotLevels.includes(
              context.selectedSongOfDefenseSpellSlotLevel
            )
          ? `No level ${context.selectedSongOfDefenseSpellSlotLevel} spell slots remaining.`
          : null,
    getResourceSummary: () => null,
    renderCustomContent: renderSongOfDefenseSlotSelector,
    apply: spendSongOfDefenseSpellSlot,
    skipReactionWhenUnchanged: true
  },
  {
    id: superiorHuntersDefenseReactionId,
    getSelectionWarning: (context) =>
      context.selectedRangerHunterSuperiorHuntersDefenseDamageType === null
        ? "Select a damage type."
        : null,
    renderCustomContent: renderSuperiorHuntersDefenseDamageTypeSelector,
    apply: activateRangerHunterSuperiorHuntersDefenseForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: defensiveDuelistParryReactionEntryId,
    getSelectionWarning: (context) =>
      characterHasHeldFinesseWeapon(context.character)
        ? null
        : "You must be holding a Finesse weapon to use Parry."
  },
  {
    id: barbarianBerserkerRetaliationReactionId,
    apply: activateBarbarianBerserkerRetaliationForCharacter,
    skipReactionWhenUnchanged: true
  },
  {
    id: barbarianWorldTreeBranchesOfTheTreeReactionId,
    renderCustomContent: renderBranchesOfTheTreeDcFormula
  },
  {
    id: rogueArcaneTricksterSpellThiefReactionId,
    getResourceWarning: (context) =>
      context.spellThiefUsesRemaining <= 0 ? "No Spell Thief charges remaining." : null,
    getSelectionWarning: (context) =>
      context.selectedSpellThiefSpell === null ? "Select a spell." : null,
    getResourceSummary: () => null,
    getHeaderTags: (context) => [
      createChargesHeaderTag(context.spellThiefUsesRemaining, context.spellThiefUsesTotal)
    ],
    renderCustomContent: renderSpellThiefSelector,
    apply: applySpellThief,
    skipReactionWhenUnchanged: true
  },
  {
    id: "reaction-deflect-attacks",
    footerActionName: "Deflect Attacks",
    createRollRequest: (context) => createDeflectAttacksReactionRollRequest(context.character),
    getFacts: (context) => getDeflectAttacksReactionFacts(context.character),
    getFactsSectionTitle: () => null
  },
  {
    id: "reaction-slow-fall",
    getFacts: (context) => getSlowFallReactionFacts(context.character)
  }
];

const descriptorByReactionId = new Map(
  descriptors.map((descriptor) => [descriptor.id, descriptor])
);

export function getReactionDescriptor(reactionId: string | undefined): ReactionDescriptor | null {
  return reactionId ? (descriptorByReactionId.get(reactionId) ?? null) : null;
}

export function applyReactionDescriptor(
  currentCharacter: Character,
  descriptor: ReactionDescriptor | null,
  context: ReactionDescriptorContext
): Character {
  const nextCharacter = descriptor?.apply?.(currentCharacter, context) ?? currentCharacter;

  if (descriptor?.skipReactionWhenUnchanged && nextCharacter === currentCharacter) {
    return currentCharacter;
  }

  return {
    ...nextCharacter,
    roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "reaction")
  };
}

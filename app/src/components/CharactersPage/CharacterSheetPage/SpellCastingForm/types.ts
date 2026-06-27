/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, SetStateAction } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character, CharacterCompanion, CharacterCustomTraitEffect } from "../../../../types";
import type { RoundTrackerResource } from "../../../../pages/CharactersPage/combat";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import type { SpellActionPathState } from "../spellActionPaths";
import type { SpellGroup, SpellRowModel } from "./spellcastingListModel";

export type SpellCastingDrawerViewMode = "standard" | "prepare-preview" | "divine-intervention";

export type CastSelectedSpellOptions = {
  castAsRitual?: boolean;
  roundTrackerResourceOverride?: RoundTrackerResource | null;
  useBeguilingMagic?: boolean;
  useStarMap?: boolean;
  usePhantasmalCreatures?: boolean;
  usePsionicSorcery?: boolean;
  useTamedSurge?: boolean;
  useTelekineticMaster?: boolean;
  useRadiantSoul?: boolean;
  useOverchannel?: boolean;
  useMagicInitiate?: boolean;
  useGoliathAncestry?: boolean;
  useForestGnome?: boolean;
  useFeyMagic?: boolean;
  useFiendishLegacy?: boolean;
  useQuickRitual?: boolean;
  useShadowMagic?: boolean;
  useDetectThoughts?: boolean;
  useBoonOfSpellRecall?: boolean;
  useEmeraldEnclaveFledglingFreeUse?: boolean;
  useBewitchingMagic?: boolean;
  useNaturalRecovery?: boolean;
  useMistyWanderer?: boolean;
  useFeyReinforcements?: boolean;
  useFeyReinforcementsNoConcentration?: boolean;
    useBlessingOfMoonlight?: boolean;
    useStepsOfTheFey?: boolean;
    useFrozenHaunt?: boolean;
    frozenHauntFallbackSlotLevel?: number;
  spellCastEffectIds?: string[];
  spellActionPathId?: string | null;
  spellImplementationCastSource?: SpellImplementationCastSource;
  spellImplementationOptions?: SpellImplementationOptionValues;
  summonCompanions?: CharacterCompanion[];
};

export type CastSelectedSpellContext = Record<string, any> & {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  selectedSpell: SpellEntry | null;
  selectedSpellDisplay: SpellEntry | null;
  selectedSpellActionPaths: SpellActionPathState[];
  selectedSpellSlotLevel: number;
  spellSlotsRemaining: number[];
  spellcastingState: {
    blocked?: boolean;
  };
};

export type SpellCastingFormRendererContext = Record<string, any> & {
  cantripOptions: SpellEntry[];
  preparedSpellRowGroups: SpellGroup<SpellRowModel>[];
  selectedSpell: SpellEntry | null;
  selectedSpellActionPaths: SpellActionPathState[];
  selectedSpellCustomEffects: CharacterCustomTraitEffect[];
  selectedSpellDisplay: SpellEntry | null;
  selectedSpellIsCustom: boolean;
  selectedSpellSlotLevel: number;
  selectedSpellViewMode: SpellCastingDrawerViewMode;
  spellPreparationOptions: SpellEntry[];
  spellSlotLevels: readonly number[];
  spellSlotTotals: number[];
  spellSlotsRemaining: number[];
  castSelectedSpell: (options?: CastSelectedSpellOptions) => void;
  setSelectedSpellSlotLevel: Dispatch<SetStateAction<number>>;
};

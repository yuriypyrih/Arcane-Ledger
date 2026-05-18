import { memo, useCallback } from "react";
import {
  CharacterProfileForm,
  ClassFeaturesAndFeats,
  CompanionsSection,
  CharacterStatsForm,
  EquipmentForm,
  GameplayForm,
  SkillsAndProficienciesForm,
  SpellCastingForm
} from "../../../components/CharactersPage/CharacterSheetPage";
import { useAppSelector } from "../../../store";
import {
  selectCompanionsCharacter,
  selectEquipmentCharacter,
  selectFeaturesCharacter,
  selectGameplayCharacter,
  selectProfileCharacter,
  selectSkillsCharacter,
  selectSpellcastingCharacter,
  selectStatsCharacter
} from "./selectors";
import type { PersistCharacterOptions, PersistCharacterUpdater, QueueCharacterSave } from "./types";

type PersistSectionProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type GameplaySectionProps = PersistSectionProps & {
  onQueueHitPointCharacter: QueueCharacterSave;
  onRequestCreateCompanion?: () => void;
};

type CharacterProfileSectionProps = PersistSectionProps & {
  broadLayout?: boolean;
};

type StatsSectionProps = PersistSectionProps & {
  broadLayout?: boolean;
};

const gameplayPersistOptions: PersistCharacterOptions = {
  domains: ["resources", "features", "statuses", "spells"],
  normalize: "targeted"
};

const proficiencyPersistOptions: PersistCharacterOptions = {
  domains: ["proficiencies"],
  normalize: "targeted"
};

const spellcastingPersistOptions: PersistCharacterOptions = {
  domains: ["spells", "resources", "features", "statuses"],
  normalize: "targeted"
};

function useDefaultPersistOptions(
  onPersistCharacter: PersistCharacterUpdater,
  defaultOptions: PersistCharacterOptions
): PersistCharacterUpdater {
  return useCallback(
    (updater, options) => {
      onPersistCharacter(updater, options ?? defaultOptions);
    },
    [defaultOptions, onPersistCharacter]
  );
}

export const CharacterProfileSection = memo(function CharacterProfileSection({
  broadLayout = false,
  className,
  onPersistCharacter
}: CharacterProfileSectionProps) {
  const character = useAppSelector(selectProfileCharacter);

  return character ? (
    <CharacterProfileForm
      broadLayout={broadLayout}
      character={character}
      className={className}
      onPersistCharacter={onPersistCharacter}
    />
  ) : null;
});

export const GameplaySection = memo(function GameplaySection({
  className,
  onPersistCharacter,
  onQueueHitPointCharacter,
  onRequestCreateCompanion
}: GameplaySectionProps) {
  const character = useAppSelector(selectGameplayCharacter);
  const persistGameplayCharacter = useDefaultPersistOptions(
    onPersistCharacter,
    gameplayPersistOptions
  );

  return character ? (
    <GameplayForm
      character={character}
      className={className}
      onPersistCharacter={persistGameplayCharacter}
      onQueueHitPointCharacter={onQueueHitPointCharacter}
      onRequestCreateCompanion={onRequestCreateCompanion}
    />
  ) : null;
});

export const StatsSection = memo(function StatsSection({
  broadLayout = false,
  className,
  onPersistCharacter
}: StatsSectionProps) {
  const character = useAppSelector(selectStatsCharacter);

  return character ? (
    <CharacterStatsForm
      broadLayout={broadLayout}
      character={character}
      className={className}
      onPersistCharacter={onPersistCharacter}
    />
  ) : null;
});

export const SkillsSection = memo(function SkillsSection({
  className,
  onPersistCharacter
}: PersistSectionProps) {
  const character = useAppSelector(selectSkillsCharacter);
  const persistProficiencyCharacter = useDefaultPersistOptions(
    onPersistCharacter,
    proficiencyPersistOptions
  );

  return character ? (
    <SkillsAndProficienciesForm
      character={character}
      className={className}
      onPersistCharacter={persistProficiencyCharacter}
    />
  ) : null;
});

export const FeaturesSection = memo(function FeaturesSection({
  className,
  onPersistCharacter
}: PersistSectionProps) {
  const character = useAppSelector(selectFeaturesCharacter);

  return character ? (
    <ClassFeaturesAndFeats
      character={character}
      className={className}
      onPersistCharacter={onPersistCharacter}
    />
  ) : null;
});

export const CompanionsSheetSection = memo(function CompanionsSheetSection({
  className,
  onPersistCharacter
}: PersistSectionProps) {
  const character = useAppSelector(selectCompanionsCharacter);
  const companions = character?.companions ?? [];

  return character && companions.length > 0 ? (
    <CompanionsSection
      character={character}
      className={className}
      onPersistCharacter={onPersistCharacter}
    />
  ) : null;
});

export const EquipmentSheetSection = memo(function EquipmentSheetSection({
  className,
  onPersistCharacter
}: PersistSectionProps) {
  const character = useAppSelector(selectEquipmentCharacter);

  return character ? (
    <EquipmentForm
      character={character}
      className={className}
      onPersistCharacter={onPersistCharacter}
    />
  ) : null;
});

export const SpellcastingSection = memo(function SpellcastingSection({
  className,
  onPersistCharacter
}: PersistSectionProps) {
  const character = useAppSelector(selectSpellcastingCharacter);
  const persistSpellcastingCharacter = useDefaultPersistOptions(
    onPersistCharacter,
    spellcastingPersistOptions
  );

  return character ? (
    <SpellCastingForm
      character={character}
      className={className}
      onPersistCharacter={persistSpellcastingCharacter}
    />
  ) : null;
});

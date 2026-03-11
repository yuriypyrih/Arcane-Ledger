import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NumberInput from "../../../components/CharactersPage/FormInputs/NumberInput";
import RarityPill from "../../../components/CodexPage/RarityPill";
import SelectInput from "../../../components/CharactersPage/FormInputs/SelectInput";
import { useDiceRollerPopup } from "../../../components/DicePage/DiceRollerPopup";
import {
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type SpellEntry,
  type WeaponEntry
} from "../../../codex/entries";
import type { AbilityKey, Character, SkillName } from "../../../types";
import { formatCodexLabel, formatCodexList, formatDamageDice } from "../../../utils/codex";
import {
  abilityKeys,
  createDefaultAbilities,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../constants";
import {
  getAvailableEquipmentNamesForClass,
  getGrantedProficienciesForCharacter,
  getGrantedSkillProficienciesForCharacter,
  getLoadoutCodexEntryByName,
  getToolProficiencyLabel,
  normalizeEquipmentSelectionsForClass,
  normalizeManualSkillSelections,
  normalizeSkillExpertiseSelectionsForCharacter,
  normalizeToolProficiencySelections,
  toolProficiencyOptions,
  type ToolProficiency
} from "../proficiency";
import {
  formatAbilityModifier,
  getMainAbilityForClass,
  getSavingThrowProficienciesForClass,
  getWeaponActionsForCharacter
} from "../gameplay";
import { getSkillRowsByAbility } from "../skills";
import {
  getAllSpellEntries,
  getKnownSpellsForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
  normalizeSpellSlotsExpended
} from "../spellcasting";
import {
  MAX_CHARACTER_LEVEL,
  getMinimumXpForLevel,
  getNextLevelThreshold,
  getXpProgressPercent
} from "../experience";
import { findCharacter, upsertCharacter } from "../storage";
import {
  loadPreferences,
  updatePreferences,
  type Preferences,
  type StatsViewMode
} from "../../../storage/preferences";
import {
  CharacterProfileForm,
  EquipmentForm,
  GameplayForm,
  SkillsAndProficienciesForm,
  SpellCastingForm,
  StatsForm
} from "./components";
import type {
  AbilitiesDraft,
  EditableSection,
  HpDraft,
  IdentityDraft,
  SkillLevel,
  SpellManagementMode,
  XpDraft
} from "./types";
import {
  alignmentOptions,
  clampNumber,
  cloneAbilityScores,
  formatCount,
  formatSpellGroupTitle,
  normalizeCustomAbilityScores,
  skillColumnLayout,
  spellSlotLevels
} from "./utils";
import styles from "./CharacterSheetPage.module.css";

type LoadoutDrawerEntry = ArmorEntry | ItemEntry | WeaponEntry;

function formatMaxDexModifier(maxDexModifier: number | null): string {
  if (maxDexModifier === null) {
    return "Full modifier";
  }

  if (maxDexModifier === 0) {
    return "No DEX modifier";
  }

  return `Capped at +${maxDexModifier}`;
}

function CharacterSheetPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const parsedCharacterId = Number(characterId);
  const [character, setCharacter] = useState<Character | null>(() =>
    Number.isFinite(parsedCharacterId) ? (findCharacter(parsedCharacterId) ?? null) : null
  );
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [hitPointStep, setHitPointStep] = useState(1);
  const [xpAddAmount, setXpAddAmount] = useState(300);
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [identityDraft, setIdentityDraft] = useState<IdentityDraft>(() => ({
    name: character?.name ?? "",
    species: character?.species ?? "",
    className: character?.className ?? "",
    level: character?.level ?? 1,
    alignment: character?.alignment ?? "True Neutral",
    background: character?.background ?? ""
  }));
  const [hpDraft, setHpDraft] = useState<HpDraft>(() => ({
    hitPoints: character?.hitPoints ?? 8,
    currentHitPoints: character?.currentHitPoints ?? 8
  }));
  const [xpDraft, setXpDraft] = useState<XpDraft>(() => ({
    level: character?.level ?? 1,
    xp: character?.xp ?? 0
  }));
  const [isXpPopupOpen, setIsXpPopupOpen] = useState(false);
  const [isXpManualEditMode, setIsXpManualEditMode] = useState(false);
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() => ({
    attributeMode: character?.attributeMode ?? "custom",
    abilities: cloneAbilityScores(character?.abilities ?? createDefaultAbilities())
  }));
  const [savingThrowProficienciesDraft, setSavingThrowProficienciesDraft] = useState<AbilityKey[]>(
    () =>
      character?.savingThrowProficiencies ?? getSavingThrowProficienciesForClass(character?.className ?? "")
  );
  const [skillsDraft, setSkillsDraft] = useState<SkillName[]>(() => character?.skills ?? []);
  const [skillExpertiseDraft, setSkillExpertiseDraft] = useState<SkillName[]>(
    () => character?.skillExpertise ?? []
  );
  const [toolProficienciesDraft, setToolProficienciesDraft] = useState<ToolProficiency[]>(
    () => normalizeToolProficiencySelections(character?.toolProficiencies ?? [])
  );
  const [equipmentDraft, setEquipmentDraft] = useState<string[]>(() => character?.equipment ?? []);
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] = useState<LoadoutDrawerEntry | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [knownSpellDraftIds, setKnownSpellDraftIds] = useState<string[]>([]);
  const [isRestPopupOpen, setIsRestPopupOpen] = useState(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useEffect(() => {
    const nextCharacter =
      Number.isFinite(parsedCharacterId) && parsedCharacterId > 0
        ? (findCharacter(parsedCharacterId) ?? null)
        : null;

    setCharacter(nextCharacter);
    setEditingSection(null);
    setSelectedLoadoutEntry(null);
    setSelectedSpell(null);
    setSpellManagementMode(null);
    setIsRestPopupOpen(false);
    setIsXpPopupOpen(false);
    setIsXpManualEditMode(false);
    setIsBackgroundVisible(false);

    if (!nextCharacter) {
      return;
    }

    hydrateDrafts(nextCharacter);
  }, [parsedCharacterId]);

  useEffect(() => {
    if (
      !selectedLoadoutEntry &&
      !selectedSpell &&
      !spellManagementMode &&
      !isRestPopupOpen &&
      !isXpPopupOpen
    ) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedLoadoutEntry(null);
        setSelectedSpell(null);
        setSpellManagementMode(null);
        setIsRestPopupOpen(false);
        setIsXpPopupOpen(false);
        setIsXpManualEditMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLoadoutEntry, selectedSpell, spellManagementMode, isRestPopupOpen, isXpPopupOpen]);

  function hydrateDrafts(nextCharacter: Character) {
    setIdentityDraft({
      name: nextCharacter.name,
      species: nextCharacter.species,
      className: nextCharacter.className,
      level: nextCharacter.level,
      alignment: nextCharacter.alignment,
      background: nextCharacter.background
    });
    setHpDraft({
      hitPoints: nextCharacter.hitPoints,
      currentHitPoints: nextCharacter.currentHitPoints
    });
    setXpDraft({
      level: nextCharacter.level,
      xp: nextCharacter.xp
    });
    setAbilitiesDraft({
      attributeMode: nextCharacter.attributeMode,
      abilities: cloneAbilityScores(nextCharacter.abilities)
    });
    setSavingThrowProficienciesDraft(
      nextCharacter.savingThrowProficiencies ??
        getSavingThrowProficienciesForClass(nextCharacter.className)
    );
    setSkillsDraft(nextCharacter.skills);
    setSkillExpertiseDraft(nextCharacter.skillExpertise ?? []);
    setToolProficienciesDraft(normalizeToolProficiencySelections(nextCharacter.toolProficiencies ?? []));
    setEquipmentDraft(nextCharacter.equipment);
  }

  function persistCharacter(nextCharacter: Character) {
    const { id, ...draft } = nextCharacter;
    const savedCharacter = upsertCharacter(draft, id);
    setCharacter(savedCharacter);
    hydrateDrafts(savedCharacter);
    setEditingSection(null);
  }

  function beginEditing(section: EditableSection) {
    if (!character) {
      return;
    }

    hydrateDrafts(character);
    setEditingSection(section);
  }

  function cancelEditing() {
    if (character) {
      hydrateDrafts(character);
    }

    setEditingSection(null);
  }

  function saveIdentity() {
    if (!character) {
      return;
    }

    const normalizedName = identityDraft.name.trim();
    const normalizedSpecies = identityDraft.species.trim();
    const normalizedClassName = identityDraft.className.trim();

    if (!normalizedName || !normalizedSpecies || !normalizedClassName) {
      return;
    }

    const normalizedSkills = normalizeManualSkillSelections(character.skills);
    const normalizedEquipment = normalizeEquipmentSelectionsForClass(
      normalizedClassName,
      character.equipment
    );
    const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
      normalizedClassName,
      normalizedSpecies,
      normalizedSkills,
      character.skillExpertise ?? []
    );

    const nextCharacter: Character = {
      ...character,
      name: normalizedName,
      species: normalizedSpecies,
      className: normalizedClassName,
      level: clampNumber(identityDraft.level, 1, 20, character.level),
      alignment: alignmentOptions.includes(identityDraft.alignment)
        ? identityDraft.alignment
        : "True Neutral",
      background: identityDraft.background.trim(),
      skills: normalizedSkills,
      skillExpertise: normalizedSkillExpertise,
      equipment: normalizedEquipment
    };

    persistCharacter(nextCharacter);
  }

  function saveHitPoints() {
    if (!character) {
      return;
    }

    const nextMaxHitPoints = clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextMaxHitPoints,
      character.currentHitPoints
    );

    persistCharacter({
      ...character,
      hitPoints: nextMaxHitPoints,
      currentHitPoints: nextCurrentHitPoints
    });
  }

  function adjustHitPoints(direction: -1 | 1) {
    if (!character) {
      return;
    }

    const amount = clampNumber(hitPointStep, 1, 999, 1);
    const nextCurrentHitPoints = clampNumber(
      character.currentHitPoints + amount * direction,
      0,
      character.hitPoints,
      character.currentHitPoints
    );

    if (nextCurrentHitPoints === character.currentHitPoints) {
      return;
    }

    persistCharacter({
      ...character,
      currentHitPoints: nextCurrentHitPoints
    });
  }

  function saveAbilities() {
    if (!character) {
      return;
    }

    const nextAbilities =
      abilitiesDraft.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(cloneAbilityScores(abilitiesDraft.abilities))
        : normalizeCustomAbilityScores(cloneAbilityScores(abilitiesDraft.abilities));

    persistCharacter({
      ...character,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    });
  }

  function normalizeSavingThrowSelections(values: AbilityKey[]): AbilityKey[] {
    const validAbilitySet = new Set(abilityKeys);
    const normalizedSelections = values.filter((ability) => validAbilitySet.has(ability));
    return [...new Set(normalizedSelections)];
  }

  function saveSavingThrows() {
    if (!character) {
      return;
    }

    const nextSavingThrowProficiencies = normalizeSavingThrowSelections(
      savingThrowProficienciesDraft
    );

    persistCharacter({
      ...character,
      savingThrowProficiencies: nextSavingThrowProficiencies
    });
  }

  function saveSkills() {
    if (!character) {
      return;
    }

    const normalizedManualSkills = normalizeManualSkillSelections(skillsDraft);
    const normalizedToolProficiencies = normalizeToolProficiencySelections(toolProficienciesDraft);
    const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
      character.className,
      character.species,
      normalizedManualSkills,
      skillExpertiseDraft
    );

    persistCharacter({
      ...character,
      skills: normalizedManualSkills,
      skillExpertise: normalizedSkillExpertise,
      toolProficiencies: normalizedToolProficiencies
    });
  }

  function saveEquipment() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      equipment: normalizeEquipmentSelectionsForClass(character.className, equipmentDraft)
    });
  }

  function updateAbilityScore(ability: AbilityKey, value: string) {
    const isPointBuy = abilitiesDraft.attributeMode === "pointBuy";
    const nextValue = clampNumber(
      value,
      isPointBuy ? 8 : 1,
      isPointBuy ? 15 : 99,
      abilitiesDraft.abilities[ability]
    );

    setAbilitiesDraft((current) => ({
      ...current,
      abilities: {
        ...current.abilities,
        [ability]: nextValue
      }
    }));
  }

  function toggleSavingThrowProficiency(ability: AbilityKey) {
    setSavingThrowProficienciesDraft((currentSelections) => {
      if (currentSelections.includes(ability)) {
        return currentSelections.filter((currentAbility) => currentAbility !== ability);
      }

      return [...currentSelections, ability];
    });
  }

  function updateStatsViewMode(nextMode: StatsViewMode) {
    setPreferences((currentPreferences) => {
      if (currentPreferences.statsViewMode === nextMode) {
        return currentPreferences;
      }

      return updatePreferences({ statsViewMode: nextMode });
    });
  }

  function toggleSelection(
    value: string,
    values: string[],
    setter: Dispatch<SetStateAction<string[]>>,
    maxSelections?: number
  ) {
    if (values.includes(value)) {
      setter(values.filter((item) => item !== value));
      return;
    }

    if (maxSelections !== undefined && values.length >= maxSelections) {
      return;
    }

    setter([...values, value]);
  }

  function updateSkillLevel(skill: SkillName, nextLevel: SkillLevel, isGrantedProficient: boolean) {
    if (!character) {
      return;
    }

    setSkillsDraft((currentSkills) => {
      const nextManualSkillSet = new Set<SkillName>(normalizeManualSkillSelections(currentSkills));

      if (nextLevel === "none" || isGrantedProficient) {
        nextManualSkillSet.delete(skill);
      } else {
        nextManualSkillSet.add(skill);
      }

      const nextManualSkills = normalizeManualSkillSelections([...nextManualSkillSet]);

      setSkillExpertiseDraft((currentExpertise) => {
        const normalizedCurrentExpertise = normalizeSkillExpertiseSelectionsForCharacter(
          character.className,
          character.species,
          nextManualSkills,
          currentExpertise
        );
        const nextExpertiseSet = new Set<SkillName>(normalizedCurrentExpertise);

        if (nextLevel === "expert") {
          nextExpertiseSet.add(skill);
        } else {
          nextExpertiseSet.delete(skill);
        }

        return normalizeSkillExpertiseSelectionsForCharacter(
          character.className,
          character.species,
          nextManualSkills,
          [...nextExpertiseSet]
        );
      });

      return nextManualSkills;
    });
  }

  function toggleToolProficiency(toolProficiency: ToolProficiency) {
    setToolProficienciesDraft((currentToolProficiencies) => {
      const nextToolSet = new Set(normalizeToolProficiencySelections(currentToolProficiencies));

      if (nextToolSet.has(toolProficiency)) {
        nextToolSet.delete(toolProficiency);
      } else {
        nextToolSet.add(toolProficiency);
      }

      return normalizeToolProficiencySelections([...nextToolSet]);
    });
  }

  function openLoadoutEntryDetails(itemName: string) {
    const entry = getLoadoutCodexEntryByName(itemName);

    if (!entry) {
      return;
    }

    setSelectedSpell(null);
    setSelectedLoadoutEntry(entry);
  }

  function closeLoadoutDrawer() {
    setSelectedLoadoutEntry(null);
  }

  function closeSpellDrawer() {
    setSelectedSpell(null);
  }

  function closeSpellManagementPopup() {
    setSpellManagementMode(null);
  }

  function closeRestPopup() {
    setIsRestPopupOpen(false);
  }

  function openXpPopup() {
    if (!character) {
      return;
    }

    setXpDraft({
      level: character.level,
      xp: character.xp
    });
    setIsXpManualEditMode(false);
    setIsXpPopupOpen(true);
  }

  function closeXpPopup() {
    setIsXpPopupOpen(false);
    setIsXpManualEditMode(false);
  }

  if (!character) {
    return (
      <section className={styles.page}>
        <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
          Go back
        </button>
        <article className={styles.notFoundCard}>
          <p className={styles.eyebrow}>Character sheet</p>
          <h2>Character not found</h2>
          <p>The selected sheet is no longer available in local storage.</p>
          <Link to="/characters" className={styles.primaryLink}>
            Back to roster
          </Link>
        </article>
      </section>
    );
  }

  const hitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;
  const availableEquipmentOptions = getAvailableEquipmentNamesForClass(character.className);
  const weaponActions = getWeaponActionsForCharacter(character);
  const mainAbility = getMainAbilityForClass(character.className);
  const savingThrowProficiencies =
    character.savingThrowProficiencies ??
    getSavingThrowProficienciesForClass(character.className);
  const grantedProficiencies = getGrantedProficienciesForCharacter(
    character.className,
    character.species
  );
  const grantedSkillProficiencies = getGrantedSkillProficienciesForCharacter(
    character.className,
    character.species
  );
  const grantedSkillSet = new Set(grantedSkillProficiencies.map((entry) => entry.skill));
  const normalizedManualSkills = normalizeManualSkillSelections(character.skills);
  const normalizedManualSkillsDraft = normalizeManualSkillSelections(skillsDraft);
  const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
    character.className,
    character.species,
    normalizedManualSkills,
    character.skillExpertise ?? []
  );
  const normalizedSkillExpertiseDraft = normalizeSkillExpertiseSelectionsForCharacter(
    character.className,
    character.species,
    normalizedManualSkillsDraft,
    skillExpertiseDraft
  );
  const normalizedManualToolProficiencies = normalizeToolProficiencySelections(
    character.toolProficiencies ?? []
  );
  const normalizedManualToolProficienciesDraft = normalizeToolProficiencySelections(
    toolProficienciesDraft
  );
  const isSkillsEditing = editingSection === "skills";
  const displayedManualSkills = isSkillsEditing ? normalizedManualSkillsDraft : normalizedManualSkills;
  const displayedSkillExpertise = isSkillsEditing
    ? normalizedSkillExpertiseDraft
    : normalizedSkillExpertise;
  const displayedManualToolProficiencies = isSkillsEditing
    ? normalizedManualToolProficienciesDraft
    : normalizedManualToolProficiencies;
  const displayedProficientSkills = [...new Set([...grantedSkillSet, ...displayedManualSkills])];
  const skillRowsByAbility = getSkillRowsByAbility(
    character,
    displayedProficientSkills,
    displayedSkillExpertise
  );
  const skillRowsByAbilityMap = new Map(skillRowsByAbility.map((group) => [group.ability, group]));
  const displayedManualSkillSet = new Set(displayedManualSkills);
  const displayedSkillExpertiseSet = new Set(displayedSkillExpertise);
  const displayedManualToolSet = new Set(displayedManualToolProficiencies);
  const displayedManualProficiencyLabels = [
    ...displayedManualSkills,
    ...displayedManualToolProficiencies.map((toolProficiency) =>
      getToolProficiencyLabel(toolProficiency)
    )
  ];
  const canCastSpells = isSpellcastingClass(character.className);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals);
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const knownSpells = getKnownSpellsForCharacter(character);
  const knownSpellsByLevel = knownSpells.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());
  const knownSpellGroups = [...knownSpellsByLevel.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, spells]) => ({
      level,
      spells: [...spells].sort((left, right) => left.name.localeCompare(right.name))
    }));
  const selectedSpellLevel = selectedSpell ? getSpellLevel(selectedSpell) : null;
  const activeSpellLevel = selectedSpellLevel ?? 0;
  const minimumSelectedSlotLevel = selectedSpellLevel !== null ? Math.max(1, selectedSpellLevel) : 1;
  const normalizedSelectedSpellSlotLevel = clampNumber(
    selectedSpellSlotLevel,
    minimumSelectedSlotLevel,
    9,
    minimumSelectedSlotLevel
  );
  const selectedSpellRemainingSlots =
    selectedSpellLevel === null || selectedSpellLevel === 0
      ? null
      : (spellSlotsRemaining[normalizedSelectedSpellSlotLevel - 1] ?? 0);
  const canCastSelectedSpell =
    selectedSpell !== null &&
    (selectedSpellLevel === 0 ||
      (selectedSpellRemainingSlots !== null &&
        normalizedSelectedSpellSlotLevel >= minimumSelectedSlotLevel &&
        selectedSpellRemainingSlots > 0));
  const highestSpellSlotLevel = spellSlotTotals.reduce(
    (highestLevel, total, index) => (total > 0 ? index + 1 : highestLevel),
    0
  );
  const editableSpellOptions = getAllSpellEntries().filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSpellSlotLevel;
  });
  const editableSpellGroups = editableSpellOptions.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());
  const editableSpellGroupRows = [...editableSpellGroups.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, spells]) => ({
      level,
      spells: [...spells].sort((left, right) => left.name.localeCompare(right.name))
    }));
  const knownSpellDraftSet = new Set(knownSpellDraftIds);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const nextLevelThreshold = getNextLevelThreshold(character.level);
  const xpProgressPercent = getXpProgressPercent(character.level, character.xp);
  const nextLevelLabel = nextLevelThreshold === null ? "MAX" : String(character.level + 1);
  const nextLevelXpLabel =
    nextLevelThreshold === null ? "MAX" : `${formatCount(nextLevelThreshold)} XP`;

  function openSpellManagementMenu() {
    if (!canCastSpells) {
      return;
    }

    setKnownSpellDraftIds(knownSpells.map((spell) => spell.id));
    setSpellManagementMode("menu");
  }

  function beginSpellEditing() {
    if (!canCastSpells) {
      return;
    }

    setSpellManagementMode("edit");
  }

  function refreshSpellSlots() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    });
    closeSpellManagementPopup();
  }

  function toggleKnownSpellDraft(spellId: string) {
    setKnownSpellDraftIds((current) =>
      current.includes(spellId)
        ? current.filter((currentSpellId) => currentSpellId !== spellId)
        : [...current, spellId]
    );
  }

  function saveKnownSpells() {
    if (!character) {
      return;
    }

    const allowedSpellIds = new Set(editableSpellOptions.map((spell) => spell.id));
    const nextKnownSpellIds = [...new Set(knownSpellDraftIds)].filter((spellId) =>
      allowedSpellIds.has(spellId)
    );

    persistCharacter({
      ...character,
      knownSpellIds: nextKnownSpellIds
    });
    closeSpellManagementPopup();
  }

  function openRestPopup() {
    setIsRestPopupOpen(true);
  }

  function takeShortRest() {
    if (!character || shortRestsRemaining <= 0) {
      return;
    }

    persistCharacter({
      ...character,
      currentHitPoints: clampNumber(
        character.currentHitPoints + shortRestHealAmount,
        0,
        character.hitPoints,
        character.currentHitPoints
      ),
      shortRestsUsedToday: shortRestsUsedToday + 1
    });
    closeRestPopup();
  }

  function takeLongRest() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      currentHitPoints: character.hitPoints,
      shortRestsUsedToday: 0,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    });
    closeRestPopup();
  }

  function addXp() {
    if (!character) {
      return;
    }

    const nextXpAmount = clampNumber(xpAddAmount, 1, 99999999, 300);

    persistCharacter({
      ...character,
      xp: character.xp + nextXpAmount
    });
    setXpAddAmount(nextXpAmount);
  }

  function addSingleLevel() {
    if (!character || character.level >= MAX_CHARACTER_LEVEL) {
      return;
    }

    const targetLevel = Math.min(MAX_CHARACTER_LEVEL, character.level + 1);

    persistCharacter({
      ...character,
      level: targetLevel,
      xp: Math.max(character.xp, getMinimumXpForLevel(targetLevel))
    });
  }

  function beginXpManualEdit() {
    if (!character) {
      return;
    }

    setXpDraft({
      level: character.level,
      xp: character.xp
    });
    setIsXpManualEditMode(true);
  }

  function cancelXpManualEdit() {
    if (character) {
      setXpDraft({
        level: character.level,
        xp: character.xp
      });
    }

    setIsXpManualEditMode(false);
  }

  function saveXpManualEdit() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      level: clampNumber(xpDraft.level, 1, MAX_CHARACTER_LEVEL, character.level),
      xp: clampNumber(xpDraft.xp, 0, 99999999, character.xp)
    });
    setIsXpManualEditMode(false);
  }

  function openSpellDetails(spell: SpellEntry) {
    if (!canCastSpells) {
      return;
    }

    const spellLevel = getSpellLevel(spell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
        : spellSlotLevels.find(
            (slotLevel) => slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
          ) ??
          spellSlotLevels.find(
            (slotLevel) => slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
          ) ??
          minimumSlotLevel;

    setSelectedSpellSlotLevel(preferredSlotLevel);
    setSelectedLoadoutEntry(null);
    setSelectedSpell(spell);
  }

  function castSelectedSpell() {
    if (!character || !selectedSpell) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);

    if (spellLevel === 0) {
      closeSpellDrawer();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);

    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

    persistCharacter({
      ...character,
      spellSlotsExpended: nextSpellSlotsExpended
    });
    closeSpellDrawer();
  }

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
        Go back
      </button>

      <div className={styles.cascadeStack}>
        <CharacterProfileForm
          className={styles.cascadeOne}
          character={character}
          identityDraft={identityDraft}
          isEditing={editingSection === "identity"}
          isBackgroundVisible={isBackgroundVisible}
          alignmentOptions={alignmentOptions}
          onBeginEdit={() => beginEditing("identity")}
          onCancel={cancelEditing}
          onSave={saveIdentity}
          onOpenXpPopup={openXpPopup}
          onToggleBackgroundVisibility={() => setIsBackgroundVisible((current) => !current)}
          setIdentityDraft={setIdentityDraft}
        />

        <GameplayForm
          className={styles.cascadeTwo}
          character={character}
          hpDraft={hpDraft}
          hitPointPercent={hitPointPercent}
          hitPointStep={hitPointStep}
          isEditing={editingSection === "hp"}
          weaponActions={weaponActions}
          onAdjustHitPoints={adjustHitPoints}
          onBeginEdit={() => beginEditing("hp")}
          onCancel={cancelEditing}
          onOpenCamp={openRestPopup}
          onRollWeaponAction={(action) =>
            openDiceRoller({
              title: `${action.name} attack`,
              formula: action.rollFormula,
              description: `${action.ability} ${formatAbilityModifier(action.abilityModifier)} | Proficiency (${action.proficiencyLabel}) ${formatAbilityModifier(action.proficiencyBonus)}`
            })
          }
          onSave={saveHitPoints}
          setHitPointStep={setHitPointStep}
          setHpDraft={setHpDraft}
        />

        <StatsForm
          className={styles.cascadeThree}
          abilitiesDraft={abilitiesDraft}
          character={character}
          isEditing={editingSection === "abilities"}
          mainAbility={mainAbility}
          savingThrowProficienciesDraft={savingThrowProficienciesDraft}
          savingThrowProficiencies={savingThrowProficiencies}
          pointBuyRemaining={pointBuyRemaining}
          statsViewMode={preferences.statsViewMode}
          onChangeStatsViewMode={updateStatsViewMode}
          onBeginEdit={() => beginEditing("abilities")}
          onCancel={cancelEditing}
          onSaveAbilities={saveAbilities}
          onSaveSavingThrows={saveSavingThrows}
          onToggleSavingThrowProficiency={toggleSavingThrowProficiency}
          onUpdateAbilityScore={updateAbilityScore}
          setAbilitiesDraft={setAbilitiesDraft}
        />

        <SkillsAndProficienciesForm
          className={styles.cascadeFour}
          displayedManualProficiencyLabels={displayedManualProficiencyLabels}
          displayedManualSkillSet={displayedManualSkillSet}
          displayedManualToolSet={displayedManualToolSet}
          displayedSkillExpertiseSet={displayedSkillExpertiseSet}
          grantedProficiencies={grantedProficiencies}
          grantedSkillSet={grantedSkillSet}
          isEditing={isSkillsEditing}
          onBeginEdit={() => beginEditing("skills")}
          onCancel={cancelEditing}
          onSave={saveSkills}
          onToggleToolProficiency={toggleToolProficiency}
          onUpdateSkillLevel={updateSkillLevel}
          resolveToolProficiencyLabel={getToolProficiencyLabel}
          skillColumnLayout={skillColumnLayout}
          skillRowsByAbilityMap={skillRowsByAbilityMap}
          toolProficiencyOptions={toolProficiencyOptions}
        />

        <EquipmentForm
          className={styles.cascadeFive}
          availableEquipmentOptions={availableEquipmentOptions}
          characterClassName={character.className}
          currentEquipment={character.equipment}
          equipmentDraft={equipmentDraft}
          isEditing={editingSection === "equipment"}
          onBeginEdit={() => beginEditing("equipment")}
          onCancel={cancelEditing}
          onOpenEquipmentEntry={openLoadoutEntryDetails}
          onSave={saveEquipment}
          onToggleEquipment={(item) => toggleSelection(item, equipmentDraft, setEquipmentDraft)}
        />

        <SpellCastingForm
          className={styles.cascadeSix}
          canCastSpells={canCastSpells}
          knownSpellGroups={knownSpellGroups}
          onOpenSpellDetails={openSpellDetails}
          onOpenSpellManagementMenu={openSpellManagementMenu}
          spellSlotLevels={spellSlotLevels}
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
        />
      </div>

      {spellManagementMode ? (
        <div
          className={styles.spellManagementBackdrop}
          role="presentation"
          onClick={closeSpellManagementPopup}
        >
          <section
            className={styles.spellManagementModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-management-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.spellManagementHeader}>
              <div>
                <p className={styles.eyebrow}>Spellcasting</p>
                <h3 id="spell-management-title">
                  {spellManagementMode === "menu" ? "Spell options" : "Edit known spells"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.spellManagementCloseButton}
                onClick={closeSpellManagementPopup}
                aria-label="Close spell options"
              >
                <X size={18} />
              </button>
            </div>

            {spellManagementMode === "menu" ? (
              <div className={styles.spellManagementOptionGrid}>
                <button
                  type="button"
                  className={styles.spellManagementOptionButton}
                  onClick={refreshSpellSlots}
                >
                  <strong>Refresh spell slots</strong>
                  <small>Restore all available spell slots without changing hit points.</small>
                </button>
                <button
                  type="button"
                  className={styles.spellManagementOptionButton}
                  onClick={beginSpellEditing}
                >
                  <strong>Edit spells</strong>
                  <small>Add or remove known spells from your current list.</small>
                </button>
              </div>
            ) : (
              <>
                <div className={styles.spellManagementList}>
                  {editableSpellGroupRows.length === 0 ? (
                    <p className={styles.emptyText}>No spells available for this class and level yet.</p>
                  ) : (
                    editableSpellGroupRows.map((group) => (
                      <div key={group.level} className={styles.spellManagementGroup}>
                        <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
                        <ul className={styles.spellManagementChoiceList}>
                          {group.spells.map((spell) => (
                            <li key={spell.id}>
                              <label className={styles.spellManagementChoice}>
                                <input
                                  type="checkbox"
                                  checked={knownSpellDraftSet.has(spell.id)}
                                  onChange={() => toggleKnownSpellDraft(spell.id)}
                                />
                                <span>{spell.name}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.spellManagementActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setSpellManagementMode("menu")}
                  >
                    Back
                  </button>
                  <button type="button" className={styles.saveButton} onClick={saveKnownSpells}>
                    Save spells
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {isRestPopupOpen ? (
        <div className={styles.restPopupBackdrop} role="presentation" onClick={closeRestPopup}>
          <section
            className={styles.restPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rest-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.restPopupHeader}>
              <div>
                <p className={styles.eyebrow}>Camp</p>
                <h3 id="rest-popup-title">Choose your rest</h3>
              </div>
              <button
                type="button"
                className={styles.spellManagementCloseButton}
                onClick={closeRestPopup}
                aria-label="Close rest options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.restOptionGrid}>
              <button
                type="button"
                className={styles.restOptionButton}
                onClick={takeShortRest}
                disabled={shortRestsRemaining <= 0}
              >
                <strong>Short rest</strong>
                <small>Heal {shortRestHealAmount} HP (half your max HP).</small>
                <div
                  className={styles.shortRestDots}
                  aria-label={`${shortRestsRemaining} short rests remaining today`}
                >
                  {Array.from({ length: 2 }, (_, index) => (
                    <span
                      key={index}
                      className={clsx(
                        styles.shortRestDot,
                        index < shortRestsRemaining && styles.shortRestDotActive
                      )}
                    />
                  ))}
                </div>
              </button>

              <button type="button" className={styles.restOptionButton} onClick={takeLongRest}>
                <strong>Long rest</strong>
                <small>Restore full HP and refresh all spell slots.</small>
                <span className={styles.longRestNote}>Also resets short rests.</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isXpPopupOpen ? (
        <div className={styles.xpPopupBackdrop} role="presentation" onClick={closeXpPopup}>
          <section
            className={styles.xpPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xp-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.restPopupHeader}>
              <div>
                <p className={styles.eyebrow}>Character progress</p>
                <h3 id="xp-popup-title">
                  Experience {character.level} -&gt; {nextLevelLabel}
                </h3>
              </div>
              <button
                type="button"
                className={styles.spellManagementCloseButton}
                onClick={closeXpPopup}
                aria-label="Close experience popup"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.xpProgressMetaRow}>
              <div className={styles.xpProgressMetaItem}>
                <span>Current XP</span>
                <strong>{formatCount(character.xp)}</strong>
              </div>
              <div className={clsx(styles.xpProgressMetaItem, styles.xpProgressMetaItemRight)}>
                <span>Next Level XP</span>
                <strong>{nextLevelXpLabel}</strong>
              </div>
            </div>

            <div className={styles.xpProgressTrack}>
              <div className={styles.xpProgressFill} style={{ width: `${xpProgressPercent}%` }} />
            </div>

            {isXpManualEditMode ? (
              <>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Level</span>
                    <NumberInput
                      min={1}
                      max={MAX_CHARACTER_LEVEL}
                      value={xpDraft.level}
                      onChange={(event) =>
                        setXpDraft((current) => ({
                          ...current,
                          level: clampNumber(event.target.value, 1, MAX_CHARACTER_LEVEL, current.level)
                        }))
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>XP</span>
                    <NumberInput
                      min={0}
                      value={xpDraft.xp}
                      onChange={(event) =>
                        setXpDraft((current) => ({
                          ...current,
                          xp: clampNumber(event.target.value, 0, 99999999, current.xp)
                        }))
                      }
                    />
                  </label>
                </div>
                <p className={styles.helperText}>
                  XP and level auto-correct on save: XP is raised to level minimum, and level increases when XP
                  reaches a higher threshold.
                </p>
                <div className={styles.formActions}>
                  <button type="button" className={styles.saveButton} onClick={saveXpManualEdit}>
                    Save values
                  </button>
                  <button type="button" className={styles.cancelButton} onClick={cancelXpManualEdit}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.xpActionGrid}>
                <label className={styles.xpAddField}>
                  <span>Add XP</span>
                  <NumberInput
                    min={1}
                    className={styles.xpAddInput}
                    value={xpAddAmount}
                    onChange={(event) =>
                      setXpAddAmount((current) =>
                        clampNumber(event.target.value, 1, 99999999, current)
                      )
                    }
                  />
                </label>
                <div className={styles.xpQuickActionRow}>
                  <button type="button" className={styles.saveButton} onClick={addXp}>
                    Add XP
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={addSingleLevel}
                    disabled={character.level >= MAX_CHARACTER_LEVEL}
                  >
                    Add 1 level
                  </button>
                  <button type="button" className={styles.editButton} onClick={beginXpManualEdit}>
                    <Pencil size={16} />
                    Edit
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {selectedLoadoutEntry ? (
        <div className={styles.spellDrawerBackdrop} role="presentation" onClick={closeLoadoutDrawer}>
          <section
            className={styles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-loadout-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.spellDrawerHandle} aria-hidden="true" />
            <div className={styles.spellDrawerHeader}>
              <div className={styles.spellDrawerHeaderContent}>
                <p className={styles.spellDrawerBadge}>{formatCodexLabel(selectedLoadoutEntry.category)}</p>
                <div className={styles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title">{selectedLoadoutEntry.name}</h3>
                  {"rarity" in selectedLoadoutEntry ? (
                    <RarityPill rarity={selectedLoadoutEntry.rarity} />
                  ) : null}
                </div>
                <p className={styles.spellDrawerSummary}>{selectedLoadoutEntry.summary}</p>
              </div>
              <button
                type="button"
                className={styles.spellDrawerCloseButton}
                onClick={closeLoadoutDrawer}
                aria-label="Close loadout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.spellDrawerDetails}>
              <div className={styles.spellDrawerDetailCard}>
                <span>Types</span>
                <strong>{formatCodexList(selectedLoadoutEntry.tags)}</strong>
              </div>

              {selectedLoadoutEntry.category === ENTRY_CATEGORIES.WEAPONS ? (
                <>
                  <div className={styles.spellDrawerDetailCard}>
                    <span>Damage</span>
                    <strong>{formatDamageDice(selectedLoadoutEntry.damage)}</strong>
                  </div>
                  <div className={styles.spellDrawerDetailCard}>
                    <span>Damage type</span>
                    <strong>
                      {selectedLoadoutEntry.damageType
                        ? formatCodexLabel(selectedLoadoutEntry.damageType)
                        : "None"}
                    </strong>
                  </div>
                </>
              ) : null}

              {selectedLoadoutEntry.category === ENTRY_CATEGORIES.ARMOR ? (
                <>
                  <div className={styles.spellDrawerDetailCard}>
                    <span>Armor base</span>
                    <strong>{selectedLoadoutEntry.armorBase > 0 ? selectedLoadoutEntry.armorBase : "-"}</strong>
                  </div>
                  <div className={styles.spellDrawerDetailCard}>
                    <span>Max DEX modifier</span>
                    <strong>{formatMaxDexModifier(selectedLoadoutEntry.maxDexModifier)}</strong>
                  </div>
                  <div className={styles.spellDrawerDetailCard}>
                    <span>Shield bonus</span>
                    <strong>
                      {selectedLoadoutEntry.shieldBonus > 0
                        ? `+${selectedLoadoutEntry.shieldBonus}`
                        : "None"}
                    </strong>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {selectedSpell ? (
        <div className={styles.spellDrawerBackdrop} role="presentation" onClick={closeSpellDrawer}>
          <section
            className={styles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-spell-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.spellDrawerHandle} aria-hidden="true" />
            <div className={styles.spellDrawerHeader}>
              <div className={styles.spellDrawerHeaderContent}>
                <p className={styles.spellDrawerBadge}>{formatCodexLabel(ENTRY_CATEGORIES.SPELLS)}</p>
                <div className={styles.spellDrawerTitleRow}>
                  <h3 id="character-spell-drawer-title">{selectedSpell.name}</h3>
                  <RarityPill rarity={selectedSpell.rarity} />
                </div>
                <p className={styles.spellDrawerSummary}>{selectedSpell.summary}</p>
              </div>
              <button
                type="button"
                className={styles.spellDrawerCloseButton}
                onClick={closeSpellDrawer}
                aria-label="Close spell details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.spellDrawerDetails}>
              <div className={styles.spellDrawerDetailCard}>
                <span>Types</span>
                <strong>{formatCodexList(selectedSpell.tags)}</strong>
              </div>
              <div className={styles.spellDrawerDetailCard}>
                <span>Spell level</span>
                <strong>{activeSpellLevel === 0 ? "Cantrip" : `Level ${activeSpellLevel}`}</strong>
              </div>
              <div className={styles.spellDrawerDetailCard}>
                <span>Damage</span>
                <strong>{formatDamageDice(selectedSpell.damage)}</strong>
              </div>
              <div className={styles.spellDrawerDetailCard}>
                <span>Damage type</span>
                <strong>
                  {selectedSpell.damageType ? formatCodexLabel(selectedSpell.damageType) : "None"}
                </strong>
              </div>
            </div>

            <div className={styles.spellDrawerActions}>
              <div className={styles.spellDrawerCastControls}>
                <p className={styles.spellDrawerSlotText}>
                  {activeSpellLevel === 0
                    ? "Cantrip: no spell slot required."
                    : `${selectedSpellRemainingSlots ?? 0} slot${
                          (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
                        } remaining at level ${normalizedSelectedSpellSlotLevel}.`}
                </p>
                <label className={styles.spellSlotSelectField}>
                  <span>Cast at slot level</span>
                  <SelectInput
                    value={normalizedSelectedSpellSlotLevel}
                    disabled={activeSpellLevel === 0}
                    className={styles.spellSlotSelect}
                    onChange={(event) =>
                      setSelectedSpellSlotLevel(clampNumber(event.target.value, 1, 9, 1))
                    }
                  >
                    {spellSlotLevels.map((slotLevel) => {
                      const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
                      const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;
                      const isDisabled =
                        activeSpellLevel !== 0 &&
                        (slotLevel < minimumSelectedSlotLevel || totalSlots === 0);

                      return (
                        <option key={slotLevel} value={slotLevel} disabled={isDisabled}>
                          Level {slotLevel} ({remainingSlots}/{totalSlots})
                        </option>
                      );
                    })}
                  </SelectInput>
                </label>
              </div>
              <button
                type="button"
                className={styles.castButton}
                onClick={castSelectedSpell}
                disabled={!canCastSelectedSpell}
              >
                Cast
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {diceRollerPopup}
    </section>
  );
}

export default CharacterSheetPage;

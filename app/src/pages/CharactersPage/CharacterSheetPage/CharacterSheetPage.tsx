import clsx from "clsx";
import { Minus, Pencil, Plus, Save, X } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NumberInput from "../../../components/CharactersPage/FormInputs/NumberInput";
import SelectInput from "../../../components/CharactersPage/FormInputs/SelectInput";
import TextAreaInput from "../../../components/CharactersPage/FormInputs/TextAreaInput";
import TextInput from "../../../components/CharactersPage/FormInputs/TextInput";
import type {
  AbilityKey,
  AbilityScores,
  AttributeMode,
  Character
} from "../../../types";
import {
  abilityKeys,
  alignmentGrid,
  createDefaultAbilities,
  equipmentOptions,
  getPointBuyRemaining,
  normalizePointBuyAbilities,
  roleOptions,
  skillsOptions,
  speciesOptions
} from "../constants";
import { findCharacter, upsertCharacter } from "../storage";
import styles from "./CharacterSheetPage.module.css";

type EditableSection = "identity" | "hp" | "abilities" | "skills" | "equipment";

type IdentityDraft = {
  name: string;
  species: string;
  role: string;
  level: number;
  alignment: Character["alignment"];
  background: string;
};

type HpDraft = {
  hitPoints: number;
  currentHitPoints: number;
};

type AbilitiesDraft = {
  attributeMode: AttributeMode;
  abilities: AbilityScores;
};

const alignmentOptions = alignmentGrid.flat();

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

function cloneAbilities(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = abilities[ability];
    return next;
  }, {} as AbilityScores);
}

function normalizeCustomAbilities(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = clampNumber(abilities[ability], 1, 99, 8);
    return next;
  }, {} as AbilityScores);
}

function formatModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function normalizeSelections(values: string[], options: string[]): string[] {
  return options.filter((option) => values.includes(option));
}

function CharacterSheetPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const parsedCharacterId = Number(characterId);
  const [character, setCharacter] = useState<Character | null>(() =>
    Number.isFinite(parsedCharacterId) ? (findCharacter(parsedCharacterId) ?? null) : null
  );
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [hitPointStep, setHitPointStep] = useState(5);
  const [identityDraft, setIdentityDraft] = useState<IdentityDraft>(() => ({
    name: character?.name ?? "",
    species: character?.species ?? "",
    role: character?.role ?? "",
    level: character?.level ?? 1,
    alignment: character?.alignment ?? "True Neutral",
    background: character?.background ?? ""
  }));
  const [hpDraft, setHpDraft] = useState<HpDraft>(() => ({
    hitPoints: character?.hitPoints ?? 8,
    currentHitPoints: character?.currentHitPoints ?? 8
  }));
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() => ({
    attributeMode: character?.attributeMode ?? "custom",
    abilities: cloneAbilities(character?.abilities ?? createDefaultAbilities())
  }));
  const [skillsDraft, setSkillsDraft] = useState<string[]>(() => character?.skills ?? []);
  const [equipmentDraft, setEquipmentDraft] = useState<string[]>(() => character?.equipment ?? []);

  useEffect(() => {
    const nextCharacter =
      Number.isFinite(parsedCharacterId) && parsedCharacterId > 0
        ? (findCharacter(parsedCharacterId) ?? null)
        : null;

    setCharacter(nextCharacter);
    setEditingSection(null);

    if (!nextCharacter) {
      return;
    }

    hydrateDrafts(nextCharacter);
  }, [parsedCharacterId]);

  function hydrateDrafts(nextCharacter: Character) {
    setIdentityDraft({
      name: nextCharacter.name,
      species: nextCharacter.species,
      role: nextCharacter.role,
      level: nextCharacter.level,
      alignment: nextCharacter.alignment,
      background: nextCharacter.background
    });
    setHpDraft({
      hitPoints: nextCharacter.hitPoints,
      currentHitPoints: nextCharacter.currentHitPoints
    });
    setAbilitiesDraft({
      attributeMode: nextCharacter.attributeMode,
      abilities: cloneAbilities(nextCharacter.abilities)
    });
    setSkillsDraft(nextCharacter.skills);
    setEquipmentDraft(nextCharacter.equipment);
  }

  function persistCharacter(nextCharacter: Character) {
    const { id, ...draft } = nextCharacter;
    upsertCharacter(draft, id);
    setCharacter(nextCharacter);
    hydrateDrafts(nextCharacter);
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
    const normalizedRole = identityDraft.role.trim();

    if (!normalizedName || !normalizedSpecies || !normalizedRole) {
      return;
    }

    const nextCharacter: Character = {
      ...character,
      name: normalizedName,
      species: normalizedSpecies,
      role: normalizedRole,
      level: clampNumber(identityDraft.level, 1, 20, character.level),
      alignment: alignmentOptions.includes(identityDraft.alignment)
        ? identityDraft.alignment
        : "True Neutral",
      background: identityDraft.background.trim()
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
        ? normalizePointBuyAbilities(cloneAbilities(abilitiesDraft.abilities))
        : normalizeCustomAbilities(cloneAbilities(abilitiesDraft.abilities));

    persistCharacter({
      ...character,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    });
  }

  function saveSkills() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      skills: normalizeSelections(skillsDraft, skillsOptions)
    });
  }

  function saveEquipment() {
    if (!character) {
      return;
    }

    persistCharacter({
      ...character,
      equipment: normalizeSelections(equipmentDraft, equipmentOptions)
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

  function toggleSelection(
    value: string,
    values: string[],
    setter: Dispatch<SetStateAction<string[]>>
  ) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
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

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
        Go back
      </button>

      <div className={styles.cascadeStack}>
        <article className={clsx(styles.sectionCard, styles.cascadeOne)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Character profile</p>
              <h2 className={styles.title}>{character.name}</h2>
            </div>
            {editingSection === "identity" ? null : (
              <button type="button" className={styles.editButton} onClick={() => beginEditing("identity")}>
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {editingSection === "identity" ? (
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Name</span>
                <TextInput
                  value={identityDraft.name}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Species</span>
                <SelectInput
                  value={identityDraft.species}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      species: event.target.value
                    }))
                  }
                >
                  <option value="">Select a species</option>
                  {speciesOptions.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <label className={styles.field}>
                <span>Role</span>
                <SelectInput
                  value={identityDraft.role}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      role: event.target.value
                    }))
                  }
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <label className={styles.field}>
                <span>Level</span>
                <NumberInput
                  min={1}
                  max={20}
                  value={identityDraft.level}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      level: clampNumber(event.target.value, 1, 20, current.level)
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Alignment</span>
                <SelectInput
                  value={identityDraft.alignment}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      alignment: event.target.value as Character["alignment"]
                    }))
                  }
                >
                  {alignmentOptions.map((alignment) => (
                    <option key={alignment} value={alignment}>
                      {alignment}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <label className={styles.fieldWide}>
                <span>Background</span>
                <TextAreaInput
                  value={identityDraft.background}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...current,
                      background: event.target.value
                    }))
                  }
                  placeholder="Background, Personal Traits, Ideals, Bonds, Flaws, etc."
                />
              </label>

              <div className={styles.formActions}>
                <button type="button" className={styles.saveButton} onClick={saveIdentity}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={styles.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <ul className={styles.metaList}>
                <li>
                  <span>Species</span>
                  <strong>{character.species}</strong>
                </li>
                <li>
                  <span>Role</span>
                  <strong>{character.role}</strong>
                </li>
                <li>
                  <span>Level</span>
                  <strong>{character.level}</strong>
                </li>
                <li>
                  <span>Alignment</span>
                  <strong>{character.alignment}</strong>
                </li>
              </ul>
              {character.background ? (
                <p className={styles.backgroundText}>{character.background}</p>
              ) : (
                <p className={styles.emptyText}>No background notes yet.</p>
              )}
            </>
          )}
        </article>

        <article className={clsx(styles.sectionCard, styles.cascadeTwo)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Vitality</p>
              <h3 className={styles.subtitle}>Hit points</h3>
            </div>
            {editingSection === "hp" ? null : (
              <button type="button" className={styles.editButton} onClick={() => beginEditing("hp")}>
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {editingSection === "hp" ? (
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Max HP</span>
                <NumberInput
                  min={1}
                  value={hpDraft.hitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      hitPoints: clampNumber(event.target.value, 1, 999, current.hitPoints)
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Current HP</span>
                <NumberInput
                  min={0}
                  max={hpDraft.hitPoints}
                  value={hpDraft.currentHitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      currentHitPoints: clampNumber(
                        event.target.value,
                        0,
                        current.hitPoints,
                        current.currentHitPoints
                      )
                    }))
                  }
                />
              </label>
              <div className={styles.formActions}>
                <button type="button" className={styles.saveButton} onClick={saveHitPoints}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={styles.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.hpSummary}>
                <strong>
                  {character.currentHitPoints}/{character.hitPoints} HP
                </strong>
                <span>
                  {character.currentHitPoints === 0
                    ? "Unconscious"
                    : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                      ? "Critical"
                      : "Stable"}
                </span>
              </div>
              <div className={styles.hpBarTrack}>
                <div className={styles.hpBarFill} style={{ width: `${Math.max(0, hitPointPercent)}%` }} />
              </div>
              <div className={styles.hpControls}>
                <NumberInput
                  min={1}
                  className={styles.hpStepInput}
                  value={hitPointStep}
                  onChange={(event) =>
                    setHitPointStep((current) => clampNumber(event.target.value, 1, 999, current))
                  }
                />
                <button
                  type="button"
                  className={clsx(styles.hpActionButton, styles.hpDamage)}
                  onClick={() => adjustHitPoints(-1)}
                  title={`Deal ${hitPointStep} hit points`}
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  className={clsx(styles.hpActionButton, styles.hpHeal)}
                  onClick={() => adjustHitPoints(1)}
                  title={`Heal ${hitPointStep} hit points`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </>
          )}
        </article>

        <article className={clsx(styles.sectionCard, styles.cascadeThree)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Ability modifiers</p>
              <h3 className={styles.subtitle}>Derived from core stats</h3>
            </div>
            {editingSection === "abilities" ? null : (
              <button
                type="button"
                className={styles.editButton}
                onClick={() => beginEditing("abilities")}
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {editingSection === "abilities" ? (
            <>
              <div className={styles.modeControl}>
                <button
                  type="button"
                  className={clsx(
                    styles.modeButton,
                    abilitiesDraft.attributeMode === "custom" && styles.modeButtonActive
                  )}
                  onClick={() =>
                    setAbilitiesDraft((current) => ({
                      ...current,
                      attributeMode: "custom"
                    }))
                  }
                >
                  Custom
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.modeButton,
                    abilitiesDraft.attributeMode === "pointBuy" && styles.modeButtonActive
                  )}
                  onClick={() =>
                    setAbilitiesDraft((current) => ({
                      ...current,
                      attributeMode: "pointBuy"
                    }))
                  }
                >
                  Point Buy
                </button>
              </div>
              {abilitiesDraft.attributeMode === "pointBuy" ? (
                <p className={styles.helperText}>{pointBuyRemaining} points remaining</p>
              ) : null}
              <div className={styles.abilityInputGrid}>
                {abilityKeys.map((ability) => (
                  <label key={ability} className={styles.abilityInputCard}>
                    <span>{ability}</span>
                    <NumberInput
                      min={abilitiesDraft.attributeMode === "pointBuy" ? 8 : 1}
                      max={abilitiesDraft.attributeMode === "pointBuy" ? 15 : 99}
                      value={abilitiesDraft.abilities[ability]}
                      onChange={(event) => updateAbilityScore(ability, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.saveButton} onClick={saveAbilities}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={styles.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className={styles.modifierGrid}>
              {abilityKeys.map((ability) => (
                <div key={ability} className={styles.modifierCard}>
                  <strong>{formatModifier(character.abilities[ability])}</strong>
                  <span>{ability}</span>
                  <small>{character.abilities[ability]} score</small>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={clsx(styles.sectionCard, styles.cascadeFour)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Skills</p>
              <h3 className={styles.subtitle}>Assigned proficiencies</h3>
            </div>
            {editingSection === "skills" ? null : (
              <button type="button" className={styles.editButton} onClick={() => beginEditing("skills")}>
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {editingSection === "skills" ? (
            <>
              <div className={styles.choiceGrid}>
                {skillsOptions.map((skill) => (
                  <label
                    key={skill}
                    className={clsx(
                      styles.choiceChip,
                      skillsDraft.includes(skill) && styles.choiceChipActive
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={skillsDraft.includes(skill)}
                      onChange={() => toggleSelection(skill, skillsDraft, setSkillsDraft)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.saveButton} onClick={saveSkills}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={styles.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </>
          ) : character.skills.length === 0 ? (
            <p className={styles.emptyText}>No skills selected.</p>
          ) : (
            <ul className={styles.tagList}>
              {character.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          )}
        </article>

        <article className={clsx(styles.sectionCard, styles.cascadeFive)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Equipment</p>
              <h3 className={styles.subtitle}>Current loadout</h3>
            </div>
            {editingSection === "equipment" ? null : (
              <button
                type="button"
                className={styles.editButton}
                onClick={() => beginEditing("equipment")}
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {editingSection === "equipment" ? (
            <>
              <div className={styles.choiceGrid}>
                {equipmentOptions.map((item) => (
                  <label
                    key={item}
                    className={clsx(
                      styles.choiceChip,
                      equipmentDraft.includes(item) && styles.choiceChipActive
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={equipmentDraft.includes(item)}
                      onChange={() => toggleSelection(item, equipmentDraft, setEquipmentDraft)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.saveButton} onClick={saveEquipment}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={styles.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </>
          ) : character.equipment.length === 0 ? (
            <p className={styles.emptyText}>No equipment selected.</p>
          ) : (
            <ul className={styles.tagList}>
              {character.equipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}

export default CharacterSheetPage;

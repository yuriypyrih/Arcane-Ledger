import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import {
  createWarlockPactTomeSelectionId,
  getWarlockPactTomeCantripOptions,
  getWarlockPactTomeRitualSpellOptions,
  getWarlockPactTomeSelectionFromSelectionId,
  getWarlockPactTomeSpellIds,
  type WarlockEldritchInvocationOption
} from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { getAlwaysPreparedSpellIds } from "../../../../pages/CharactersPage/spellcasting";
import type { Character } from "../../../../types";
import ActionButton from "../../../ActionButton";
import modalStyles from "./FeatEditorModal.module.css";
import { InlineEditorFrame, SelectField } from "./FeatEditorPrimitives";

const maxDropdownSpellOptions = 50;
const pactTomeCantripCount = 3;
const pactTomeRitualSpellCount = 2;

type EldritchInvocationPactTomeEditorProps = {
  character: Character;
  option: WarlockEldritchInvocationOption;
  selectedOptions: WarlockEldritchInvocationOption[];
  onAddInvocation: (selectionId: string) => void;
  onCancel: () => void;
};

function getSpellListLabel(spell: Pick<SpellEntry, "spellLists">): string {
  return spell.spellLists
    .map((spellList) => spellList.charAt(0) + spellList.slice(1).toLowerCase())
    .join(", ");
}

function matchesSpellSearch(spell: SpellEntry, searchText: string): boolean {
  const normalizedSearch = searchText.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return (
    spell.name.toLowerCase().includes(normalizedSearch) ||
    spell.spellLists.some((spellList) => spellList.toLowerCase().includes(normalizedSearch))
  );
}

function getLimitedSpellOptions(
  spellOptions: SpellEntry[],
  searchText: string,
  selectedSpellId: string
): SpellEntry[] {
  const filteredOptions = spellOptions.filter((spell) => matchesSpellSearch(spell, searchText));
  const selectedSpell = selectedSpellId
    ? spellOptions.find((spell) => spell.id === selectedSpellId)
    : null;
  const orderedOptions =
    selectedSpell && !filteredOptions.some((spell) => spell.id === selectedSpell.id)
      ? [selectedSpell, ...filteredOptions]
      : filteredOptions;

  return orderedOptions
    .filter(
      (spell, index, options) =>
        options.findIndex((currentSpell) => currentSpell.id === spell.id) === index
    )
    .slice(0, maxDropdownSpellOptions);
}

function getInitialPactTomeSelection(selectedOptions: WarlockEldritchInvocationOption[]) {
  return (
    selectedOptions
      .map((selectedOption) =>
        getWarlockPactTomeSelectionFromSelectionId(selectedOption.selectionId)
      )
      .find(Boolean) ?? null
  );
}

function getSelectedSpellIds(ids: string[]): string[] {
  return ids.filter((id) => id.length > 0);
}

function hasUniqueCompleteSelection(ids: string[], expectedCount: number): boolean {
  const selectedIds = getSelectedSpellIds(ids);
  return selectedIds.length === expectedCount && new Set(selectedIds).size === expectedCount;
}

function EldritchInvocationPactTomeEditor({
  character,
  option,
  selectedOptions,
  onAddInvocation,
  onCancel
}: EldritchInvocationPactTomeEditorProps) {
  const initialSelection = useMemo(
    () => getInitialPactTomeSelection(selectedOptions),
    [selectedOptions]
  );
  const [searchText, setSearchText] = useState("");
  const [cantripIds, setCantripIds] = useState<string[]>(
    () => initialSelection?.cantripIds ?? Array(pactTomeCantripCount).fill("")
  );
  const [ritualSpellIds, setRitualSpellIds] = useState<string[]>(
    () => initialSelection?.ritualSpellIds ?? Array(pactTomeRitualSpellCount).fill("")
  );
  const currentPactTomeSpellIds = useMemo(
    () => new Set(getWarlockPactTomeSpellIds(character)),
    [character]
  );
  const unavailableSpellIds = useMemo(() => {
    const alwaysPreparedSpellIds = getAlwaysPreparedSpellIds(
      character.className,
      character.level,
      character.classFeatureState,
      character.spellbookSpellIds,
      character.subclassId,
      character.statusEntries
    ).filter((spellId) => !currentPactTomeSpellIds.has(spellId));

    return new Set([
      ...(character.cantripIds ?? []),
      ...(character.preparedSpellIds ?? []),
      ...(character.spellbookSpellIds ?? []),
      ...alwaysPreparedSpellIds
    ]);
  }, [character, currentPactTomeSpellIds]);
  const cantripOptions = useMemo(() => getWarlockPactTomeCantripOptions(), []);
  const ritualSpellOptions = useMemo(() => getWarlockPactTomeRitualSpellOptions(), []);
  const cantripOptionIds = useMemo(
    () => new Set(cantripOptions.map((spell) => spell.id)),
    [cantripOptions]
  );
  const ritualSpellOptionIds = useMemo(
    () => new Set(ritualSpellOptions.map((spell) => spell.id)),
    [ritualSpellOptions]
  );

  const isSelectionValid =
    hasUniqueCompleteSelection(cantripIds, pactTomeCantripCount) &&
    hasUniqueCompleteSelection(ritualSpellIds, pactTomeRitualSpellCount) &&
    cantripIds.every(
      (spellId) => cantripOptionIds.has(spellId) && !unavailableSpellIds.has(spellId)
    ) &&
    ritualSpellIds.every(
      (spellId) => ritualSpellOptionIds.has(spellId) && !unavailableSpellIds.has(spellId)
    );

  function updateCantrip(index: number, nextSpellId: string) {
    setCantripIds((currentIds) =>
      currentIds.map((spellId, currentIndex) => (currentIndex === index ? nextSpellId : spellId))
    );
  }

  function updateRitualSpell(index: number, nextSpellId: string) {
    setRitualSpellIds((currentIds) =>
      currentIds.map((spellId, currentIndex) => (currentIndex === index ? nextSpellId : spellId))
    );
  }

  function getDisabledReason(spell: SpellEntry, siblingSpellIds: string[]): string | null {
    if (unavailableSpellIds.has(spell.id)) {
      return "already known/prepared";
    }

    return siblingSpellIds.includes(spell.id) ? "selected" : null;
  }

  function createSpellOptions(
    spellOptions: SpellEntry[],
    selectedSpellId: string,
    siblingSpellIds: string[]
  ) {
    return [
      {
        label: "-",
        value: ""
      },
      ...getLimitedSpellOptions(spellOptions, searchText, selectedSpellId).map((spell) => {
        const disabledReason = getDisabledReason(spell, siblingSpellIds);

        return {
          disabled: disabledReason !== null,
          label: `${spell.name} (${getSpellListLabel(spell)})${
            disabledReason ? ` (${disabledReason})` : ""
          }`,
          value: spell.id
        };
      })
    ];
  }

  return (
    <InlineEditorFrame
      title={option.displayName}
      cancelLabel={`Cancel ${option.displayName} selection`}
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton
            icon={<Plus size={16} />}
            fullWidth={false}
            disabled={!isSelectionValid}
            onClick={() => {
              if (!isSelectionValid) {
                return;
              }

              onAddInvocation(createWarlockPactTomeSelectionId(cantripIds, ritualSpellIds));
              onCancel();
            }}
          >
            Add Invocation
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        <label className={modalStyles.field}>
          <span>Search spells</span>
          <input
            className={modalStyles.select}
            type="search"
            value={searchText}
            placeholder="Filter by spell or class"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
      </div>

      <div className={modalStyles.fieldGrid}>
        {cantripIds.map((spellId, index) => (
          <SelectField
            key={`pact-tome-cantrip-${index}`}
            label={`Cantrip ${index + 1}`}
            value={spellId}
            options={createSpellOptions(
              cantripOptions,
              spellId,
              cantripIds.filter((_, currentIndex) => currentIndex !== index)
            )}
            onChange={(nextSpellId) => updateCantrip(index, nextSpellId)}
          />
        ))}
        {ritualSpellIds.map((spellId, index) => (
          <SelectField
            key={`pact-tome-ritual-${index}`}
            label={`Ritual ${index + 1}`}
            value={spellId}
            options={createSpellOptions(
              ritualSpellOptions,
              spellId,
              ritualSpellIds.filter((_, currentIndex) => currentIndex !== index)
            )}
            onChange={(nextSpellId) => updateRitualSpell(index, nextSpellId)}
          />
        ))}
      </div>

      {!isSelectionValid ? (
        <p className={modalStyles.validation}>
          Choose three new cantrips and two new level 1 ritual spells.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

export default EldritchInvocationPactTomeEditor;

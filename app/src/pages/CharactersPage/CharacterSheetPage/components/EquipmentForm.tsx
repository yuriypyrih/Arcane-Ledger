import clsx from "clsx";
import { ArrowDownLeft, ArrowUpRight, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import coinIcon from "../../../../assets/img/coin.png";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import RarityPill from "../../../../components/CodexPage/RarityPill";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import {
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { formatCodexLabel, formatCodexList, formatDamageDice } from "../../../../utils/codex";
import {
  getAvailableEquipmentNamesForClass,
  getLoadoutCodexEntryByName,
  normalizeEquipmentSelectionsForClass
} from "../../proficiency";
import type { PersistCharacterUpdater } from "../types";
import { clampNumber } from "../utils";
import sheetStyles from "../CharacterSheetPage.module.css";
import shared from "./CharacterSheetSectionShared.module.css";

type EquipmentFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

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

function EquipmentForm({ className, onPersistCharacter }: EquipmentFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [equipmentDraft, setEquipmentDraft] = useState<string[]>(() => character.equipment ?? []);
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] = useState<LoadoutDrawerEntry | null>(null);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);

  useBodyScrollLock(Boolean(selectedLoadoutEntry || isCurrencyDrawerOpen));

  useEffect(() => {
    if (!selectedLoadoutEntry && !isCurrencyDrawerOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedLoadoutEntry(null);
        setIsCurrencyDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLoadoutEntry, isCurrencyDrawerOpen]);

  const availableEquipmentOptions = getAvailableEquipmentNamesForClass(character.className);
  const currentGold = Math.max(0, Math.floor(character.currencies.gold));
  const normalizedCurrencyAmount = Math.max(
    0,
    Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0))
  );
  const canSpendGold = currentGold >= normalizedCurrencyAmount;

  function beginEditing() {
    setEquipmentDraft(character.equipment ?? []);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEquipmentDraft(character.equipment ?? []);
    setIsEditing(false);
  }

  function saveEquipment() {
    const normalizedEquipment = normalizeEquipmentSelectionsForClass(character.className, equipmentDraft);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      equipment: normalizedEquipment
    }));

    setIsEditing(false);
  }

  function toggleEquipment(item: string) {
    setEquipmentDraft((currentEquipment) => {
      if (currentEquipment.includes(item)) {
        return currentEquipment.filter((currentItem) => currentItem !== item);
      }

      return [...currentEquipment, item];
    });
  }

  function openLoadoutEntryDetails(itemName: string) {
    const entry = getLoadoutCodexEntryByName(itemName);

    if (!entry) {
      return;
    }

    setIsCurrencyDrawerOpen(false);
    setSelectedLoadoutEntry(entry);
  }

  function adjustGoldBalance(mode: "spend" | "gain") {
    const amount = Math.max(0, Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0)));
    const currentGoldAmount = Math.max(0, Math.floor(character.currencies.gold));

    if (mode === "spend" && currentGoldAmount < amount) {
      return;
    }

    const nextGold = mode === "spend" ? currentGoldAmount - amount : currentGoldAmount + amount;

    if (nextGold === currentGoldAmount) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currencies: {
        ...currentCharacter.currencies,
        gold: nextGold
      }
    }));
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Equipment</p>
          <h3 className={shared.subtitle}>Current loadout</h3>
        </div>
        <div className={shared.headerActions}>
          <button
            type="button"
            className={shared.currencyPill}
            onClick={() => {
              setSelectedLoadoutEntry(null);
              setCurrencyAmountDraft(0);
              setIsCurrencyDrawerOpen(true);
            }}
          >
            <img src={coinIcon} alt="" className={shared.currencyIcon} aria-hidden="true" />
            <span>{currentGold} Gold</span>
          </button>
          {isEditing ? null : (
            <button type="button" className={shared.editButton} onClick={beginEditing}>
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <>
          <p className={shared.helperText}>
            Weapons and armor are filtered by {character.className} proficiencies; items come from the codex.
          </p>
          <div className={shared.choiceGrid}>
            {availableEquipmentOptions.map((item) => (
              <label
                key={item}
                className={clsx(shared.choiceChip, equipmentDraft.includes(item) && shared.choiceChipActive)}
              >
                <input
                  type="checkbox"
                  checked={equipmentDraft.includes(item)}
                  onChange={() => toggleEquipment(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={saveEquipment}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </>
      ) : character.equipment.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <ul className={shared.tagList}>
          {character.equipment.map((item) => (
            <li key={item}>
              <button type="button" className={shared.tagButton} onClick={() => openLoadoutEntryDetails(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isCurrencyDrawerOpen ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setIsCurrencyDrawerOpen(false)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-currency-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Currency</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-currency-drawer-title">Gold balance</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>Current total: {currentGold} gold</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setIsCurrencyDrawerOpen(false)}
                aria-label="Close currency drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.currencyDrawerContent}>
              <label className={sheetStyles.currencyDrawerField}>
                <span>Amount</span>
                <NumberInput
                  min={0}
                  className={sheetStyles.currencyDrawerInput}
                  value={currencyAmountDraft}
                  onChange={(event) =>
                    setCurrencyAmountDraft((current) =>
                      clampNumber(event.target.value, 0, 999999999, current)
                    )
                  }
                />
              </label>
              <div className={sheetStyles.currencyDrawerActions}>
                <button
                  type="button"
                  className={sheetStyles.currencySpendButton}
                  disabled={!canSpendGold}
                  onClick={() => adjustGoldBalance("spend")}
                >
                  <ArrowDownLeft size={16} aria-hidden="true" />
                  Spend
                </button>
                <button
                  type="button"
                  className={sheetStyles.currencyGainButton}
                  onClick={() => adjustGoldBalance("gain")}
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                  Gain
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedLoadoutEntry ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedLoadoutEntry(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-loadout-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {formatCodexLabel(selectedLoadoutEntry.category)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title">{selectedLoadoutEntry.name}</h3>
                  {"rarity" in selectedLoadoutEntry ? (
                    <RarityPill rarity={selectedLoadoutEntry.rarity} />
                  ) : null}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedLoadoutEntry.summary}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedLoadoutEntry(null)}
                aria-label="Close loadout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerDetails}>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Types</span>
                <strong>{formatCodexList(selectedLoadoutEntry.tags)}</strong>
              </div>

              {selectedLoadoutEntry.category === ENTRY_CATEGORIES.WEAPONS ? (
                <>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Damage</span>
                    <strong>{formatDamageDice(selectedLoadoutEntry.damage)}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
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
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Armor base</span>
                    <strong>{selectedLoadoutEntry.armorBase > 0 ? selectedLoadoutEntry.armorBase : "-"}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Max DEX modifier</span>
                    <strong>{formatMaxDexModifier(selectedLoadoutEntry.maxDexModifier)}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Shield bonus</span>
                    <strong>
                      {selectedLoadoutEntry.shieldBonus > 0 ? `+${selectedLoadoutEntry.shieldBonus}` : "None"}
                    </strong>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default EquipmentForm;

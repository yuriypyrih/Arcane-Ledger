import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { PersistCharacterUpdater } from "../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getManagedSpellSlotPool,
  getManagedSpellSlotLevels,
  adjustManagedSpellSlot
} from "../../../pages/CharactersPage/spellSlotResourceManagement";
import { type ResourceManagementTarget } from "../../../pages/CharactersPage/resourceManagement";
import type { Character } from "../../../types";
import SelectInput from "../FormInputs/SelectInput";
import { counterResourceActions } from "./counterResourceActions";
import { useReadOnlySheet } from "./readOnlySheetContext";
import ResourceManagementModal from "./ResourceManagementModal";
import SpellSlotActionSheet from "./SpellCastingForm/SpellSlotActionSheet";
import HitDiceManagementModal from "./StatsForm/HitDiceManagementModal";
import { DrawerResourceContext } from "./drawerResourceManagementContext";

export function DrawerResourceManagement({
  character,
  onPersistCharacter,
  children
}: {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  children: ReactNode;
}) {
  const readOnly = useReadOnlySheet();
  const [selection, setSelection] = useState<{
    target: ResourceManagementTarget;
    trigger: HTMLButtonElement;
  } | null>(null);
  const [slotLevel, setSlotLevel] = useState<number | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  function close() {
    const trigger = selection?.trigger;
    setSelection(null);
    trigger?.focus();
  }

  // Capture dismissal before the underlying drawers' window listeners. Keep this
  // behavior local to the resource overlay rather than changing every overlay.
  useEffect(() => {
    if (!selection || readOnly) return;
    const trigger = selection.trigger;
    const dialog = panelRef.current;
    dialog?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelection(null);
        trigger.focus();
      } else if (event.key === "Tab" && dialog) {
        const controls = [
          ...dialog.querySelectorAll<HTMLElement>(
            "button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex='0']"
          )
        ];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [selection, readOnly]);

  const target = selection?.target;
  const pool =
    target?.kind === "spell-slots" ? getManagedSpellSlotPool(character, target) : undefined;
  const levels = target?.kind === "spell-slots" ? getManagedSpellSlotLevels(character, target) : [];
  const level = slotLevel !== null && levels.includes(slotLevel) ? slotLevel : (levels[0] ?? 1);
  const persistCounter = (update: (current: Character) => Character) =>
    onPersistCharacter(update, { domains: ["resources", "features"], normalize: false });
  const adjustSlot = (adjustment: "use" | "restore" | "reset") => {
    if (target?.kind !== "spell-slots") return;
    onPersistCharacter((current) => adjustManagedSpellSlot(current, target, level, adjustment), {
      domains: ["resources", "spells"],
      normalize: false
    });
  };

  return (
    <DrawerResourceContext.Provider
      value={
        readOnly
          ? null
          : (resource, trigger) => {
              setSlotLevel(null);
              setSelection({ target: resource, trigger });
            }
      }
    >
      {children}
      {!readOnly && target?.kind === "counter" ? (
        <ResourceManagementModal
          nestedInDrawer
          panelRef={panelRef}
          titleId={titleId}
          title={[
            target.label,
            `${target.remaining(character)}/${target.total(character)}`,
            target.die?.(character)?.toUpperCase()
          ]
            .filter(Boolean)
            .join(" ")}
          closeLabel={`Close ${target.label} resource management`}
          onClose={close}
          actions={counterResourceActions({
            label: target.label,
            current: target.remaining(character),
            total: target.total(character),
            onUse: () => persistCounter(target.spendOne),
            onRestore: () => persistCounter(target.restoreOne),
            onReset: () => persistCounter(target.restoreAll)
          })}
        />
      ) : null}
      {!readOnly && target?.kind === "hit-dice" ? (
        <HitDiceManagementModal
          nestedInDrawer
          panelRef={panelRef}
          character={character}
          onPersistCharacter={(update) =>
            onPersistCharacter(update, { domains: ["resources"], normalize: false })
          }
          onClose={close}
        />
      ) : null}
      {!readOnly && target?.kind === "spell-slots" ? (
        <SpellSlotActionSheet
          nestedInDrawer
          panelRef={panelRef}
          slotLevel={level}
          poolLabel={pool?.label}
          totalSlots={pool?.totals[level - 1] ?? 0}
          expendedSlots={pool?.expended[level - 1] ?? 0}
          onClose={close}
          onUseSlot={() => adjustSlot("use")}
          onResetSlot={() => adjustSlot("restore")}
          onResetAll={() => adjustSlot("reset")}
        >
          {levels.length > 1 ? (
            <label>
              Spell slot level
              <SelectInput
                aria-label="Resource spell slot level"
                value={level}
                onChange={(event) => setSlotLevel(Number(event.target.value))}
              >
                {levels.map((option) => (
                  <option key={option} value={option}>
                    Level {option}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}
          {levels.length === 0 ? <p>No eligible spell slots.</p> : null}
        </SpellSlotActionSheet>
      ) : null}
    </DrawerResourceContext.Provider>
  );
}

import { getFeatItemAdditionalDescriptionForCharacter } from "../../../pages/CharactersPage/feats/runtime";
import { useId, useRef } from "react";
import type { Character, CharacterInventoryItem } from "../../../types";
import {
  getEffectiveInventoryItemRecord,
  hasCharacterItemMods
} from "../../../pages/CharactersPage/itemMods";
import {
  createCharacterInventoryItem,
  getInventoryContainerContents,
  getInventoryContainerContentsWeightLimit,
  getInventoryItemFeatureTagLabels,
  getInventoryItemStoredSpellIds,
  isInventoryContainerItem
} from "../../../pages/CharactersPage/inventoryItems";
import { getSpellEntryById } from "../../../codex/spells";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import EquipmentInventoryItemDrawer from "../CharacterSheetPage/EquipmentForm/EquipmentInventoryItemDrawer";
import EquipmentInventoryItemDrawerHeader from "../CharacterSheetPage/EquipmentForm/EquipmentInventoryItemDrawerHeader";
import EquipmentContainerContentsList from "../CharacterSheetPage/EquipmentForm/EquipmentContainerContentsList";
import {
  getInventoryItemChargesTagLabel,
  getInventoryItemStoredSpellHeaderTagLabel
} from "../CharacterSheetPage/EquipmentForm/equipmentItemUtilityTags";
import { useInspectionFocus } from "./useInspectionFocus";
import styles from "./CharacterInspection.module.css";

type Props = {
  character: Character;
  stack: CharacterInventoryItem;
  onClose: () => void;
  onInspect: (item: CharacterInventoryItem) => void;
  canGoBack: boolean;
};

export default function ReadOnlyInventoryItem({
  character,
  stack,
  onClose,
  onInspect,
  canGoBack
}: Props) {
  const ref = useRef<HTMLElement>(null);
  useInspectionFocus(ref);
  const titleId = useId();
  const item = getEffectiveInventoryItemRecord(stack);
  const contents = getInventoryContainerContents(stack);
  return (
    <EquipmentInventoryItemDrawer
      panelRef={ref}
      titleId={titleId}
      item={item}
      status="ready"
      onClose={onClose}
      backdropClassName={styles.itemBackdrop}
      headerContent={
        <EquipmentInventoryItemDrawerHeader
          item={item}
          titleId={titleId}
          onHandCount={stack.onHandQuantity}
          worn={stack.worn}
          attuned={stack.attuned}
          chargesLabel={getInventoryItemChargesTagLabel(stack, { includeRecharge: true })}
          spellTag={getInventoryItemStoredSpellHeaderTagLabel(stack)}
          featureTags={getInventoryItemFeatureTagLabels(stack)}
          customTag={stack.customTag}
          modded={hasCharacterItemMods(stack.mods)}
        />
      }
      headerAction={
        canGoBack ? (
          <button type="button" onClick={onClose}>
            Back to container
          </button>
        ) : undefined
      }
      additionalDescription={getFeatItemAdditionalDescriptionForCharacter(character, item)}
      modEffects={stack.mods?.effects}
      bodyAfterItem={
        <>
          <p>Quantity: {stack.quantity}</p>
          {isInventoryContainerItem(stack) ? (
            <EquipmentContainerContentsList
              contents={contents}
              containerStackId={stack.id}
              contentsWeightLimit={getInventoryContainerContentsWeightLimit(stack)}
              onSelectContent={(index) => {
                const content = contents[index];
                if (content)
                  onInspect(
                    createCharacterInventoryItem(content.item, {
                      ...content,
                      id: `${stack.id}:content:${index}`
                    })
                  );
              }}
            />
          ) : null}
          {getInventoryItemStoredSpellIds(stack).map((id) => {
            const spell = getSpellEntryById(id);
            return spell ? (
              <section key={id}>
                <h4>{spell.name}</h4>
                <SpellDescriptionContent description={spell.description} />
              </section>
            ) : null;
          })}
        </>
      }
    />
  );
}

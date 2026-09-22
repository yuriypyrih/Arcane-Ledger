import type { Character, CharacterInventoryItem } from "../../../types";
import { getEffectiveInventoryItemRecord } from "../../../pages/CharactersPage/itemMods";
import { getInventoryItemTotalWeightValue } from "../../../pages/CharactersPage/inventoryItems";
import { formatEquipmentWeight } from "../../../utils/codex";
import { CurrencyBalancePill } from "../../CurrencyInlineDisplay";
import SheetSurface from "../CharacterSheetPage/SheetSurface";
import InventoryTagPill from "../CharacterSheetPage/EquipmentForm/InventoryTagPill";
import { getInventoryItemChargesTagLabel } from "../CharacterSheetPage/EquipmentForm/equipmentItemUtilityTags";
import shared from "../CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import equipment from "../CharacterSheetPage/EquipmentForm/EquipmentForm.module.css";

type Props = { character: Character; onInspect: (item: CharacterInventoryItem) => void };

export default function ReadOnlyEquipment({ character, onInspect }: Props) {
  return (
    <article className={shared.sectionCard} aria-label="Equipment">
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Equipment</p>
          <h3>Full inventory</h3>
        </div>
        <CurrencyBalancePill currencies={character.currencies} compact={false} disabled />
      </div>
      {character.inventoryItems.length === 0 ? (
        <p>No items.</p>
      ) : (
        <ul className={equipment.equipmentItemList}>
          {character.inventoryItems.map((stack) => {
            const item = getEffectiveInventoryItemRecord(stack);
            const charges = getInventoryItemChargesTagLabel(stack);
            return (
              <li key={stack.id}>
                <SheetSurface
                  as="button"
                  type="button"
                  borderSize="sm"
                  hoverBorder
                  className={equipment.equipmentItemButton}
                  onClick={() => onInspect(stack)}
                  aria-label={`Inspect ${item.name ?? "item"}`}
                >
                  <span className={equipment.equipmentItemName}>
                    {stack.quantity} × {item.name ?? "Item"}
                  </span>
                  <span className={equipment.equipmentItemTagRow}>
                    <span className={equipment.equipmentItemTagsLeft}>
                      {stack.worn ? <InventoryTagPill type="worn" /> : null}
                      {stack.onHandQuantity > 0 ? (
                        <InventoryTagPill
                          type="onHand"
                          label={`On Hand ×${stack.onHandQuantity}`}
                        />
                      ) : null}
                      {stack.attuned ? <InventoryTagPill type="attuned" /> : null}
                      {charges ? <InventoryTagPill type="charges" label={charges} /> : null}
                      {stack.containerContents ? (
                        <InventoryTagPill
                          type="container"
                          expandedText={`${stack.containerContents.length} stacks`}
                        />
                      ) : null}
                      {stack.customTag ? (
                        <InventoryTagPill type="custom" label={stack.customTag} />
                      ) : null}
                    </span>
                    <span>{formatEquipmentWeight(getInventoryItemTotalWeightValue(stack))}</span>
                  </span>
                </SheetSurface>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

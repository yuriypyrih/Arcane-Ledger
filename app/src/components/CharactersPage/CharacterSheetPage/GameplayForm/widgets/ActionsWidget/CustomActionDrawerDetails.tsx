import CellContainer from "../../../../../CellContainer/CellContainer";
import { OverlayDetailsGrid } from "../../../../../Overlay";
import type { Character, CharacterCustomAction } from "../../../../../../types";
import { STATUS_DURATION_KIND } from "../../../../../../types";
import {
  getCustomActionIdFromActionKey,
  normalizeCharacterCustomActions
} from "../../../../../../pages/CharactersPage/customActions";
import { getStatusDurationLabel } from "../../../../../../pages/CharactersPage/traits";
import CustomTraitEffectList from "../TraitsConditionsWidget/CustomTraitEffectList";
import styles from "./GameplayActionDrawer.module.css";

type CustomActionDrawerDetailsProps = {
  character: Character;
  actionKey: string;
};

function getCustomActionRecoveryLabel(action: CharacterCustomAction): string {
  if (!action.charges) {
    return "None";
  }

  return `Short Rest +${action.charges.shortRestRecovery}, Long Rest +${action.charges.longRestRecovery}`;
}

function CustomActionDrawerDetails({ character, actionKey }: CustomActionDrawerDetailsProps) {
  const actionId = getCustomActionIdFromActionKey(actionKey);

  if (!actionId) {
    return null;
  }

  const action = normalizeCharacterCustomActions(character.customActions).find(
    (entry) => entry.id === actionId
  );

  if (!action) {
    return null;
  }

  const effects = action.customEffects ?? [];
  const hasEffects = effects.length > 0;
  const hasCharges = action.charges !== undefined;

  if (!hasEffects && !hasCharges) {
    return null;
  }

  return (
    <div className={styles.customActionDetails}>
      {hasEffects ? <CustomTraitEffectList effects={effects} /> : null}

      <OverlayDetailsGrid className={styles.customActionDetailsGrid}>
        {hasEffects ? (
          <CellContainer
            label="Total Duration"
            content={getStatusDurationLabel(
              action.duration ?? { kind: STATUS_DURATION_KIND.INFINITE }
            )}
          />
        ) : null}
        <CellContainer label="Recovery" content={getCustomActionRecoveryLabel(action)} />
      </OverlayDetailsGrid>
    </div>
  );
}

export default CustomActionDrawerDetails;

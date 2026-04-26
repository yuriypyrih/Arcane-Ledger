import clsx from "clsx";
import { Swords } from "lucide-react";
import type { Character } from "../../../../../../types";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import { monkHandOfHealingActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../../GameplayWidgetShared.module.css";
import { FeatureActionCardButton, WeaponActionCard } from "./ActionCards";
import { MonkHandOfHealingActionCard } from "./MonkHandOfHealingAction";
import type { RoundTrackerAvailability } from "./types";
import styles from "./ActionsWidget.module.css";

type ActionsGridProps = {
  character: Character;
  combatActions: GameplayActionDefinition[];
  isCommonActionsOpen: boolean;
  roundTracker: RoundTrackerAvailability;
  onCommonActionsOpen: () => void;
  onActionSelect: (actionKey: string) => void;
};

function ActionsGrid({
  character,
  combatActions,
  isCommonActionsOpen,
  roundTracker,
  onCommonActionsOpen,
  onActionSelect
}: ActionsGridProps) {
  return (
    <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
      <header className={widgetShellStyles.widgetHeader}>
        <p className={widgetShellStyles.widgetTitle}>Actions</p>
        <button
          type="button"
          className={clsx(
            shared.editButton,
            styles.commonActionsButton,
            isCommonActionsOpen && styles.commonActionsButtonActive
          )}
          onClick={onCommonActionsOpen}
        >
          <Swords size={16} />
          Common Actions
        </button>
      </header>
      {combatActions.length === 0 ? (
        <p className={shared.emptyText}>No actions available. Equip a weapon to roll attacks.</p>
      ) : (
        <div className={styles.grid}>
          {combatActions.map((combatAction) =>
            combatAction.kind === "weapon" ? (
              <WeaponActionCard
                key={combatAction.key}
                action={combatAction.action}
                character={character}
                roundTracker={roundTracker}
                onClick={() => onActionSelect(combatAction.key)}
              />
            ) : combatAction.action.key === monkHandOfHealingActionKey ? (
              <MonkHandOfHealingActionCard
                key={combatAction.key}
                action={combatAction.action}
                character={character}
                roundTracker={roundTracker}
                onClick={() => onActionSelect(combatAction.key)}
              />
            ) : (
              <FeatureActionCardButton
                key={combatAction.key}
                action={combatAction.action}
                character={character}
                roundTracker={roundTracker}
                onClick={() => onActionSelect(combatAction.key)}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

export default ActionsGrid;

import clsx from "clsx";
import { Pencil, SportShoe } from "lucide-react";
import { useRenderProfiler } from "../../../../../../lib/useRenderProfiler";
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
  isCustomActionsOpen: boolean;
  roundTracker: RoundTrackerAvailability;
  onCommonActionsOpen: () => void;
  onCustomActionsOpen: () => void;
  onActionSelect: (actionKey: string) => void;
};

function ActionsGrid({
  character,
  combatActions,
  isCommonActionsOpen,
  isCustomActionsOpen,
  roundTracker,
  onCommonActionsOpen,
  onCustomActionsOpen,
  onActionSelect
}: ActionsGridProps) {
  useRenderProfiler("ActionsGrid", {
    actionCount: combatActions.length,
    isInCombat: roundTracker.isInCombat ?? false
  });

  return (
    <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
      <header className={widgetShellStyles.widgetHeader}>
        <p className={widgetShellStyles.widgetTitle}>Actions</p>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={clsx(
              shared.editButton,
              styles.commonActionsButton,
              isCommonActionsOpen && styles.commonActionsButtonActive
            )}
            onClick={onCommonActionsOpen}
          >
            <SportShoe size={16} />
            Common Actions
          </button>
          <button
            type="button"
            className={clsx(
              shared.editButton,
              styles.commonActionsButton,
              isCustomActionsOpen && styles.commonActionsButtonActive
            )}
            onClick={onCustomActionsOpen}
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
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

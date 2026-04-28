import DivinityListRow from "../../../../../DivinityListRow/DivinityListRow";
import type { Character } from "../../../../../../types";
import {
  createEconomyMultiContextForFeatureActionOption,
  getSharedEconomyMultiCountForCharacterAction
} from "../../../../../../pages/CharactersPage/classFeatures";
import { formatFeatureActionOptionRangeLabel } from "../../../../../../pages/CharactersPage/actionOutcome";
import { getEconomyShapeState } from "../../gameplayWidgetUtils";
import type { ChannelDivinityOptionRow } from "../../../channelDivinityUtils";
import styles from "./ClericChannelDivinityAction.module.css";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type ClericChannelDivinityActionProps = {
  rows: ChannelDivinityOptionRow[];
  character: Character;
  roundTracker: RoundTrackerAvailability;
  onOpenDivinity: (row: ChannelDivinityOptionRow) => void;
};

function ClericChannelDivinityAction({
  rows,
  character,
  roundTracker,
  onOpenDivinity
}: ClericChannelDivinityActionProps) {
  return (
    <ul className={styles.list}>
      {rows.map((row) => {
        const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
          character,
          createEconomyMultiContextForFeatureActionOption(row.option)
        );
        const economyShapeState = getEconomyShapeState(
          row.option.economyType,
          roundTracker,
          (row.option.economyMultiCount ?? 0) + sharedEconomyMultiCount
        );

        return (
          <li key={row.option.key}>
            <DivinityListRow
              divinity={row.entry}
              onClick={() => onOpenDivinity(row)}
              valueSummary={formatFeatureActionOptionRangeLabel(row.option)}
              actionShapeSelected={economyShapeState.isAvailable}
              actionShapeMultiCount={economyShapeState.multiCount}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default ClericChannelDivinityAction;

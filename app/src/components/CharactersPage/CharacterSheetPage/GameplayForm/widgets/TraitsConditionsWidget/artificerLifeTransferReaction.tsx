import {
  applyArtificerLifeTransfer,
  artificerLifeTransferReactionEntryId,
  getArtificerLifeTransferCompanions
} from "../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { renderCodexRichText } from "../../../../../../utils/codex/renderCodexRichText";
import RadioContainerOption from "../../../RadioContainerOption";
import type { ReactionDescriptor } from "./reactionDescriptors";
import styles from "./TraitsConditionsWidget.module.css";

export const artificerLifeTransferReaction: ReactionDescriptor = {
  id: artificerLifeTransferReactionEntryId,
  getSelectionWarning: (context) => {
    const companions = getArtificerLifeTransferCompanions(context.character);
    if (!companions.length)
      return "You need a living Reanimated Companion with Hit Points to transfer.";
    return companions.some((companion) => companion.id === context.selectedLifeTransferCompanionId)
      ? null
      : "Choose a Reanimated Companion for Life Transfer.";
  },
  renderCustomContent: (context) => {
    const companions = getArtificerLifeTransferCompanions(context.character);
    const selected = companions.find(
      (companion) => companion.id === context.selectedLifeTransferCompanionId
    );
    const deathBurst = selected?.inheritedCreatureEntry?.traits?.find(
      (trait) => trait.name?.toLowerCase() === "death burst"
    );
    return (
      <div className={styles.reactionCustomContent}>
        <div className={styles.eldritchCannonSelectorGrid}>
          {companions.map((companion) => (
            <RadioContainerOption
              key={companion.id}
              name="life-transfer-companion"
              header={companion.name}
              breakdown={`Regain ${companion.currentHitPoints} HP, up to your Hit Point maximum. The companion dies.`}
              selected={companion.id === context.selectedLifeTransferCompanionId}
              onSelect={() => context.setSelectedLifeTransferCompanionId(companion.id)}
            />
          ))}
        </div>
        {deathBurst?.desc ? (
          <p>
            <strong>Death Burst. </strong>
            {renderCodexRichText(deathBurst.desc)}
          </p>
        ) : null}
      </div>
    );
  },
  apply: (character, context) =>
    applyArtificerLifeTransfer(character, context.selectedLifeTransferCompanionId),
  skipReactionWhenUnchanged: true
};

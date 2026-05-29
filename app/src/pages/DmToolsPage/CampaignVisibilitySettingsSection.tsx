import { Eye } from "lucide-react";
import { useState } from "react";
import {
  updateCampaignVisibilitySettings,
  type CampaignDetailRecord,
  type PlayerVisibilitySettings
} from "../../api/campaigns";
import shared from "../../components/CharactersPage/CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import PlayerVisibilitySettingsModal from "./PlayerVisibilitySettingsModal";
import styles from "./DmToolsPage.module.css";

type CampaignVisibilitySettingsButtonProps = {
  campaign: CampaignDetailRecord;
};

function CampaignVisibilitySettingsButton({ campaign }: CampaignVisibilitySettingsButtonProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  async function handleSave(settings: PlayerVisibilitySettings | null) {
    const campaignPatch = await updateCampaignVisibilitySettings(
      campaign.id,
      settings ?? campaign.visibilitySettings,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
  }

  return (
    <>
      <button type="button" className={shared.editButton} onClick={() => setIsOpen(true)}>
        <Eye className={styles.visibilityEyeActive} size={16} aria-hidden="true" />
        Player Visibility Settings
      </button>

      {isOpen ? (
        <PlayerVisibilitySettingsModal
          initialSettings={campaign.visibilitySettings}
          isAlwaysOn
          scope="campaign"
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}

export default CampaignVisibilitySettingsButton;

import { ImageIcon, Pencil } from "lucide-react";
import { useState } from "react";
import type { CampaignDetailRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import ExternalImage from "../../components/ExternalImage";
import CampaignVisibilitySettingsButton from "./CampaignVisibilitySettingsSection";
import EditCampaignModal from "./EditCampaignModal";
import styles from "./CampaignSettingsTab.module.css";

type CampaignSettingsTabProps = {
  campaign: CampaignDetailRecord;
};

/**
 * Campaign settings, one card per topic so a new kind of setting is a new card. "Player defaults"
 * is what applies to your players unless an encounter or creature says otherwise.
 */
function CampaignSettingsTab({ campaign }: CampaignSettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={styles.tab}>
      <section className={styles.card} aria-labelledby="campaign-settings-general">
        <div className={styles.cardHeader}>
          <h3 id="campaign-settings-general" className={styles.cardTitle}>
            Campaign
          </h3>
          <p className={styles.cardText}>The name and picture your players see.</p>
        </div>
        <div className={styles.campaignSummary}>
          <span className={styles.thumb}>
            <ExternalImage
              src={campaign.imageUrl}
              className={styles.thumbImage}
              fallback={<ImageIcon size={26} aria-hidden="true" />}
            />
          </span>
          <div className={styles.summaryText}>
            <strong className={styles.summaryName}>{campaign.name}</strong>
            <span className={styles.cardText}>
              {campaign.imageUrl ? "Has a picture." : "No picture yet."}
            </span>
          </div>
          <ActionButton
            variant="OUTLINE"
            fullWidth={false}
            size="sm"
            icon={<Pencil size={16} aria-hidden="true" />}
            onClick={() => setIsEditing(true)}
          >
            Edit name and picture
          </ActionButton>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="campaign-settings-players">
        <div className={styles.cardHeader}>
          <h3 id="campaign-settings-players" className={styles.cardTitle}>
            Player defaults
          </h3>
          <p className={styles.cardText}>
            What your players can see about creatures by default. An encounter or a single creature
            can still change it.
          </p>
        </div>
        <div className={styles.cardAction}>
          <CampaignVisibilitySettingsButton campaign={campaign} />
        </div>
      </section>

      {isEditing ? (
        <EditCampaignModal campaign={campaign} onClose={() => setIsEditing(false)} />
      ) : null}
    </div>
  );
}

export default CampaignSettingsTab;

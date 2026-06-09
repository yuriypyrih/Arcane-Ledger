import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { listPartyGroups, type PartyGroupRecord } from "../../api/partyGroups";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignPartyPickerModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSelectParty: (partyGroupId: string) => Promise<void>;
  selectedPartyId?: string;
};

function CampaignPartyPickerModal({
  isSaving,
  onClose,
  onSelectParty,
  selectedPartyId
}: CampaignPartyPickerModalProps) {
  const titleId = "campaign-party-picker-title";
  const [partyGroups, setPartyGroups] = useState<PartyGroupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectingPartyId, setSelectingPartyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    setIsLoading(true);
    setError(null);

    void listPartyGroups({ suppressFailureToast: true })
      .then(({ partyGroups: nextPartyGroups }) => {
        if (!didCancel) {
          setPartyGroups(nextPartyGroups);
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          setError(getDmToolsApiErrorMessage(loadError, "Unable to load party groups."));
        }
      })
      .finally(() => {
        if (!didCancel) {
          setIsLoading(false);
        }
      });

    return () => {
      didCancel = true;
    };
  }, []);

  async function handleSelectParty(partyGroupId: string) {
    if (isSaving || selectingPartyId) {
      return;
    }

    setError(null);
    setSelectingPartyId(partyGroupId);

    try {
      await onSelectParty(partyGroupId);
      onClose();
    } catch (selectError) {
      setError(getDmToolsApiErrorMessage(selectError, "Unable to select party group."));
    } finally {
      setSelectingPartyId(null);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving || selectingPartyId !== null}
      busyLabel="Selecting party"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Choose Party</OverlayTitle>
          <OverlaySummary>Select one of your owned party groups for this campaign.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close choose party modal"
          disabled={isSaving || selectingPartyId !== null}
          onClick={onClose}
        />
      </OverlayHeader>

      <OverlayBody>
        {isLoading ? (
          <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
            Loading party groups...
          </DmToolsEmptyState>
        ) : partyGroups.length > 0 ? (
          <div className={styles.dmToolsList}>
            {partyGroups.map((partyGroup) => (
              <DmToolsListCard
                key={partyGroup.id}
                icon={<Users size={18} aria-hidden="true" />}
                title={partyGroup.name}
                meta={`${partyGroup.memberCount} ${
                  partyGroup.memberCount === 1 ? "member" : "members"
                }${partyGroup.id === selectedPartyId ? " · selected" : ""}`}
                tone="party"
                disabled={isSaving || selectingPartyId !== null}
                onClick={() => {
                  void handleSelectParty(partyGroup.id);
                }}
              />
            ))}
          </div>
        ) : (
          <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
            No party groups yet.
          </DmToolsEmptyState>
        )}
        {error ? <p className={styles.modalError}>{error}</p> : null}
      </OverlayBody>
    </SheetModal>
  );
}

export default CampaignPartyPickerModal;

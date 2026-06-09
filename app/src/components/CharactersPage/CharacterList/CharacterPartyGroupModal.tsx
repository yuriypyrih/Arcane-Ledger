import { Check, Copy, Link as LinkIcon, LogOut } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  getPartyGroupMemberView,
  leavePartyGroup,
  type PartyMembershipRecord
} from "../../../api/partyGroups";
import { getDmToolsApiErrorMessage } from "../../../pages/DmToolsPage/dmToolsApiErrors";
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import {
  removePartyMembership,
  setSelectedPartyGroup,
  setSelectedPartyGroupError,
  setSelectedPartyGroupLoading,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../../store";
import { copyTextToClipboard } from "../../../utils/copyTextToClipboard";
import ActionButton from "../../ActionButton";
import { CharacterRowBase } from "../CharacterRow";
import {
  DestructiveConfirmationModal,
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../Overlay";
import styles from "./CharacterPartyGroupModal.module.css";

type CharacterPartyGroupModalProps = {
  character: CharacterRosterEntry;
  membership: PartyMembershipRecord;
  onClose: () => void;
};

function CharacterPartyGroupModal({
  character,
  membership,
  onClose
}: CharacterPartyGroupModalProps) {
  const titleId = useId();
  const leaveTitleId = useId();
  const dispatch = useAppDispatch();
  const partyGroup = useAppSelector(
    (state) => state.dmTools.selectedPartyGroupsById[membership.partyGroupId]
  );
  const status = useAppSelector(
    (state) => state.dmTools.selectedPartyGroupStatusById[membership.partyGroupId] ?? "idle"
  );
  const loadError = useAppSelector(
    (state) => state.dmTools.selectedPartyGroupErrorById[membership.partyGroupId] ?? null
  );
  const [didCopyInvite, setDidCopyInvite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  useEffect(() => {
    let didCancel = false;
    const abortController = new AbortController();

    setDidCopyInvite(false);
    setActionError(null);
    dispatch(setSelectedPartyGroupLoading(membership.partyGroupId));

    void getPartyGroupMemberView(membership.partyGroupId, {
      signal: abortController.signal,
      suppressFailureToast: true
    })
      .then(({ partyGroup: nextPartyGroup }) => {
        if (!didCancel) {
          dispatch(setSelectedPartyGroup(nextPartyGroup));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setSelectedPartyGroupError({
              partyGroupId: membership.partyGroupId,
              error: getDmToolsApiErrorMessage(error, "Unable to load party group.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
      abortController.abort();
    };
  }, [dispatch, membership.partyGroupId]);

  async function handleCopyInvite() {
    if (!partyGroup) {
      return;
    }

    try {
      await copyTextToClipboard(partyGroup.inviteToken);
      setDidCopyInvite(true);
      setActionError(null);
    } catch {
      setActionError("Unable to copy invite code.");
    }
  }

  async function handleConfirmLeave() {
    if (isLeaving) {
      return;
    }

    setIsLeaving(true);
    setActionError(null);

    try {
      const { characterId } = await leavePartyGroup(
        membership.partyGroupId,
        membership.characterId,
        {
          suppressFailureToast: true
        }
      );

      dispatch(removePartyMembership(characterId));
      dispatch(
        showToast({
          text: "Character left the party.",
          type: "success"
        })
      );
      setIsLeaveConfirmOpen(false);
      onClose();
    } catch (error) {
      setActionError(getDmToolsApiErrorMessage(error, "Unable to leave party group."));
      setIsLeaveConfirmOpen(false);
    } finally {
      setIsLeaving(false);
    }
  }

  const isLoading = status === "loading" && !partyGroup;

  return (
    <>
      <SheetModal
        titleId={titleId}
        onClose={onClose}
        isBusy={isLeaving}
        busyLabel="Leaving party"
        size="small"
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayTitle id={titleId}>
              {partyGroup?.name ?? membership.partyGroupName}
            </OverlayTitle>
            <OverlaySummary>{character.name}</OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close party group modal" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.body}>
          {isLoading ? <p className={styles.emptyState}>Loading party group...</p> : null}
          {loadError && !partyGroup ? <p className={styles.error}>{loadError}</p> : null}
          {partyGroup ? (
            <>
              <section className={styles.section} aria-labelledby={`${titleId}-invite`}>
                <div className={styles.sectionHeader}>
                  <h4 id={`${titleId}-invite`} className={styles.sectionTitle}>
                    Invite Code
                  </h4>
                </div>
                <div className={styles.linkResult}>
                  <div className={styles.linkRow}>
                    <span className={styles.linkValue}>
                      <LinkIcon size={16} aria-hidden="true" />
                      <span>{partyGroup.inviteToken}</span>
                    </span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label="Copy party invite code"
                      title="Copy party invite code"
                      onClick={() => {
                        void handleCopyInvite();
                      }}
                    >
                      {didCopyInvite ? (
                        <Check size={18} aria-hidden="true" />
                      ) : (
                        <Copy size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby={`${titleId}-members`}>
                <div className={styles.sectionHeader}>
                  <h4 id={`${titleId}-members`} className={styles.sectionTitle}>
                    Members
                  </h4>
                  <span className={styles.memberCount}>
                    {partyGroup.memberCount}/{partyGroup.maxMembers} members
                  </span>
                </div>

                {partyGroup.members.length > 0 ? (
                  <div className={styles.memberList}>
                    {partyGroup.members.map((member) => (
                      <CharacterRowBase
                        key={member.characterId}
                        avatarUrl={member.avatar?.imageUrl}
                        className={member.summary.className}
                        level={member.summary.level}
                        name={member.summary.name}
                        secondaryMeta={member.user.nickname}
                        subtitle={`${member.summary.species} ${member.summary.className}`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No characters have joined yet.</p>
                )}
              </section>
            </>
          ) : null}
          {actionError ? <p className={styles.error}>{actionError}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.footerActions}>
            <ActionButton
              actionType="ERROR"
              icon={<LogOut size={16} aria-hidden="true" />}
              disabled={!partyGroup || isLeaving}
              loading={isLeaving}
              loadingLabel="Leaving party"
              onClick={() => setIsLeaveConfirmOpen(true)}
            >
              Leave Party
            </ActionButton>
          </div>
        </OverlayFooter>
      </SheetModal>

      {isLeaveConfirmOpen ? (
        <DestructiveConfirmationModal
          titleId={leaveTitleId}
          title="Leave party?"
          message={
            <>
              Remove <strong>{character.name}</strong> from{" "}
              <strong>{partyGroup?.name ?? membership.partyGroupName}</strong>. They can rejoin
              later with the current invite code.
            </>
          }
          confirmLabel={isLeaving ? "Leaving..." : "Leave"}
          closeLabel="Close leave party confirmation"
          onCancel={() => setIsLeaveConfirmOpen(false)}
          onConfirm={() => {
            void handleConfirmLeave();
          }}
        />
      ) : null}
    </>
  );
}

export default CharacterPartyGroupModal;

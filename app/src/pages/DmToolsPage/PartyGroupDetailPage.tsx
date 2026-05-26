import { ArrowLeft, Check, Copy, Link as LinkIcon, Pencil, RefreshCcw, Users, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPartyGroup,
  removePartyGroupCharacter,
  resetPartyGroupInviteToken,
  type PartyGroupMemberRecord
} from "../../api/partyGroups";
import ActionButton from "../../components/ActionButton";
import { CharacterRowBase, CharacterRowIconButton } from "../../components/CharactersPage/CharacterRow";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removePartyMembership,
  setSelectedPartyGroup,
  setSelectedPartyGroupError,
  setSelectedPartyGroupLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EditPartyGroupModal from "./EditPartyGroupModal";
import styles from "./DmToolsPage.module.css";

async function copyTextToClipboard(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const textArea = document.createElement("textarea");

  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function PartyGroupDetailPage() {
  const { partyGroupId = "" } = useParams();
  const kickTitleId = useId();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const partyGroup = useAppSelector((state) => state.dmTools.selectedPartyGroupsById[partyGroupId]);
  const status = useAppSelector(
    (state) => state.dmTools.selectedPartyGroupStatusById[partyGroupId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedPartyGroupErrorById[partyGroupId] ?? null
  );
  const [didCopyInvite, setDidCopyInvite] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResettingInvite, setIsResettingInvite] = useState(false);
  const [isKickingMember, setIsKickingMember] = useState(false);
  const [pendingKickMember, setPendingKickMember] = useState<PartyGroupMemberRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    if (!partyGroupId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    setDidCopyInvite(false);
    setActionError(null);
    dispatch(setSelectedPartyGroupLoading(partyGroupId));

    void getPartyGroup(partyGroupId, { suppressFailureToast: true })
      .then(({ partyGroup: nextPartyGroup }) => {
        if (!didCancel) {
          dispatch(setSelectedPartyGroup(nextPartyGroup));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedPartyGroupError({
              partyGroupId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load party group.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, dispatch, partyGroupId]);

  async function handleCopyInvite() {
    if (!partyGroup) {
      return;
    }

    await copyTextToClipboard(partyGroup.inviteToken);
    setDidCopyInvite(true);
  }

  async function handleResetInvite() {
    if (!partyGroup || isResettingInvite) {
      return;
    }

    setActionError(null);
    setDidCopyInvite(false);
    setIsResettingInvite(true);

    try {
      const { partyGroup: nextPartyGroup } = await resetPartyGroupInviteToken(partyGroup.id, {
        suppressFailureToast: true
      });

      dispatch(setSelectedPartyGroup(nextPartyGroup));
    } catch (resetError) {
      setActionError(getDmToolsApiErrorMessage(resetError, "Unable to reset invite code."));
    } finally {
      setIsResettingInvite(false);
    }
  }

  async function handleConfirmKickMember() {
    if (!partyGroup || !pendingKickMember || isKickingMember) {
      return;
    }

    setActionError(null);
    setIsKickingMember(true);

    try {
      const { partyGroup: nextPartyGroup } = await removePartyGroupCharacter(
        partyGroup.id,
        pendingKickMember.characterId,
        { suppressFailureToast: true }
      );

      dispatch(setSelectedPartyGroup(nextPartyGroup));
      dispatch(removePartyMembership(pendingKickMember.characterId));
      setPendingKickMember(null);
    } catch (kickError) {
      setActionError(getDmToolsApiErrorMessage(kickError, "Unable to remove party member."));
    } finally {
      setIsKickingMember(false);
    }
  }

  return (
    <section className={styles.page}>
      <section className={styles.panel} aria-labelledby="party-group-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <Users size={15} aria-hidden="true" />
              <span>Party Manager</span>
            </p>
            <h2 id="party-group-title" className={styles.title}>
              {partyGroup?.name ?? "Party Group"}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <ActionButton
              icon={<ArrowLeft size={16} aria-hidden="true" />}
              variant="OUTLINE"
              fullWidth={false}
              onClick={() => navigate("/dm-tools?tab=party-manager")}
            >
              Back
            </ActionButton>
            {partyGroup ? (
              <ActionButton
                icon={<Pencil size={16} aria-hidden="true" />}
                variant="GHOST"
                fullWidth={false}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </ActionButton>
            ) : null}
          </div>
        </div>

        {authStatus !== "authenticated" ? (
          <div className={styles.emptyState}>
            <Users size={28} aria-hidden="true" />
            <span>Sign in to view this party group.</span>
          </div>
        ) : status === "loading" ? (
          <div className={styles.emptyState}>
            <Users size={28} aria-hidden="true" />
            <span>Loading party group...</span>
          </div>
        ) : error ? (
          <p className={styles.modalError}>{error}</p>
        ) : partyGroup ? (
          <>
            <section className={styles.invitePanel} aria-labelledby="party-invite-title">
              <div>
                <h3 id="party-invite-title" className={styles.bodyTitle}>
                  Invite Code
                </h3>
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
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Reset party invite code"
                    title="Reset party invite code"
                    disabled={isResettingInvite}
                    onClick={() => {
                      void handleResetInvite();
                    }}
                  >
                    <RefreshCcw size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

            <section className={styles.membersPanel} aria-labelledby="party-members-title">
              <div className={styles.memberPanelHeader}>
                <div>
                  <p className={styles.bodyEyebrow}>Members</p>
                  <h3 id="party-members-title" className={styles.bodyTitle}>
                    Party Characters
                  </h3>
                </div>
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
                      actions={
                        <CharacterRowIconButton
                          aria-label={`Kick ${member.summary.name} from party`}
                          title={`Kick ${member.summary.name} from party`}
                          className={styles.kickButton}
                          onClick={() => setPendingKickMember(member)}
                        >
                          <X size={16} aria-hidden="true" />
                        </CharacterRowIconButton>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Users size={28} aria-hidden="true" />
                  <span>No characters have joined yet.</span>
                </div>
              )}
            </section>

            {isEditModalOpen ? (
              <EditPartyGroupModal
                partyGroup={partyGroup}
                onClose={() => setIsEditModalOpen(false)}
              />
            ) : null}
            {pendingKickMember ? (
              <DestructiveConfirmationModal
                titleId={kickTitleId}
                title="Kick character?"
                message={
                  <>
                    Remove <strong>{pendingKickMember.summary.name}</strong> from this party. They
                    can rejoin later with the current invite code.
                  </>
                }
                confirmLabel={isKickingMember ? "Kicking..." : "Kick"}
                closeLabel="Close kick character confirmation"
                onCancel={() => setPendingKickMember(null)}
                onConfirm={() => {
                  void handleConfirmKickMember();
                }}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </section>
  );
}

export default PartyGroupDetailPage;

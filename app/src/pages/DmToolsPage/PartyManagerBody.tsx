import { Plus, Trash2, Users } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePartyGroup, listPartyGroups, type PartyGroupRecord } from "../../api/partyGroups";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removePartyGroupRecord,
  setPartyGroups,
  setPartyGroupsError,
  setPartyGroupsLoading,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CreatePartyGroupModal from "./CreatePartyGroupModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import { getDmToolsQuotaForRole } from "./dmToolsQuotas";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type PartyManagerBodyProps = {
  panelId: string;
  tabId: string;
};

function getDeletePartyGroupMessage(partyGroup: PartyGroupRecord): ReactNode {
  return (
    <>
      Delete <strong>{partyGroup.name}</strong>, remove its members from the party, and clear it
      from any campaign using it.
    </>
  );
}

function PartyManagerBody({ panelId, tabId }: PartyManagerBodyProps) {
  const deleteTitleId = useId();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const partyGroups = useAppSelector((state) => state.dmTools.partyGroups);
  const partyGroupsStatus = useAppSelector((state) => state.dmTools.partyGroupsStatus);
  const partyGroupsError = useAppSelector((state) => state.dmTools.partyGroupsError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pendingDeletePartyGroup, setPendingDeletePartyGroup] = useState<PartyGroupRecord | null>(
    null
  );
  const [isDeletingPartyGroup, setIsDeletingPartyGroup] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const loadedPartyGroupsForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const partyGroupLimit = getDmToolsQuotaForRole("partyGroups", authUserRole);
  const isAtPartyGroupLimit = isAuthenticated && partyGroups.length >= partyGroupLimit;

  useEffect(() => {
    let didCancel = false;
    const loadKey = isAuthenticated ? authUserId : null;

    if (!loadKey) {
      loadedPartyGroupsForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedPartyGroupsForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedPartyGroupsForAuthRef.current = loadKey;
    dispatch(setPartyGroupsLoading());

    void listPartyGroups({ suppressFailureToast: true })
      .then(({ partyGroups: nextPartyGroups }) => {
        if (!didCancel) {
          dispatch(setPartyGroups(nextPartyGroups));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setPartyGroupsError(getDmToolsApiErrorMessage(error, "Unable to load party groups."))
          );
          loadedPartyGroupsForAuthRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, dispatch, isAuthenticated]);

  function handleCreateClick() {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          text: "Sign in to create party groups.",
          type: "warning"
        })
      );
      return;
    }

    if (isAtPartyGroupLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${partyGroupLimit} party groups.`,
          type: "warning"
        })
      );
      return;
    }

    setCreateModalOpen(true);
  }

  async function handleConfirmDeletePartyGroup() {
    if (!pendingDeletePartyGroup || isDeletingPartyGroup) {
      return;
    }

    setActionError(null);
    setIsDeletingPartyGroup(true);

    try {
      const { partyGroupId } = await deletePartyGroup(pendingDeletePartyGroup.id, {
        suppressFailureToast: true
      });

      dispatch(removePartyGroupRecord(partyGroupId));
      dispatch(
        showToast({
          text: "Party group deleted.",
          type: "success"
        })
      );
      setPendingDeletePartyGroup(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete party group."));
    } finally {
      setIsDeletingPartyGroup(false);
    }
  }

  return (
    <section
      className={styles.toolBody}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
    >
      <div className={styles.bodyHeader}>
        <div>
          <h3 className={styles.bodyTitle}>Party Groups</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {partyGroups.length}/{partyGroupLimit} party groups
            </span>
          ) : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtPartyGroupLimit}
            fullWidth={false}
            title={
              isAtPartyGroupLimit
                ? `You can create up to ${partyGroupLimit} party groups.`
                : undefined
            }
            onClick={handleCreateClick}
          >
            Create Party Group
          </ActionButton>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {partyGroupsStatus === "loading" ? (
        <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
          Loading party groups...
        </DmToolsEmptyState>
      ) : partyGroupsError ? (
        <p className={styles.modalError}>{partyGroupsError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
          Sign in to manage party groups.
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
              }`}
              tone="party"
              to={`/gm-tools/party-manager/${partyGroup.id}`}
              actions={[
                {
                  disabled: isDeletingPartyGroup,
                  icon: <Trash2 size={18} aria-hidden="true" />,
                  label: `Delete ${partyGroup.name}`,
                  onClick: () => {
                    setActionError(null);
                    setPendingDeletePartyGroup(partyGroup);
                  }
                }
              ]}
            />
          ))}
        </div>
      ) : (
        <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
          No party groups yet.
        </DmToolsEmptyState>
      )}

      {createModalOpen ? (
        <CreatePartyGroupModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(partyGroupId) => {
            setCreateModalOpen(false);
            navigate(`/gm-tools/party-manager/${partyGroupId}`);
          }}
        />
      ) : null}
      {pendingDeletePartyGroup ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete party group?"
          message={getDeletePartyGroupMessage(pendingDeletePartyGroup)}
          confirmLabel={isDeletingPartyGroup ? "Deleting..." : "Delete"}
          closeLabel="Close delete party group confirmation"
          onCancel={() => setPendingDeletePartyGroup(null)}
          onConfirm={() => {
            void handleConfirmDeletePartyGroup();
          }}
        />
      ) : null}
    </section>
  );
}

export default PartyManagerBody;

import { Plus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPartyGroups } from "../../api/partyGroups";
import ActionButton from "../../components/ActionButton";
import {
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

function PartyManagerBody({ panelId, tabId }: PartyManagerBodyProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const partyGroups = useAppSelector((state) => state.dmTools.partyGroups);
  const partyGroupsStatus = useAppSelector((state) => state.dmTools.partyGroupsStatus);
  const partyGroupsError = useAppSelector((state) => state.dmTools.partyGroupsError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
              to={`/gm-tools/party-manager/${partyGroup.id}`}
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
    </section>
  );
}

export default PartyManagerBody;

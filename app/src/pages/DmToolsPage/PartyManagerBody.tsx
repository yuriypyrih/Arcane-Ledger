import { Plus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const partyGroups = useAppSelector((state) => state.dmTools.partyGroups);
  const partyGroupsStatus = useAppSelector((state) => state.dmTools.partyGroupsStatus);
  const partyGroupsError = useAppSelector((state) => state.dmTools.partyGroupsError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const loadedPartyGroupsForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";

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
          <p className={styles.bodyEyebrow}>Party Manager</p>
          <h3 className={styles.bodyTitle}>Party Groups</h3>
        </div>
        <ActionButton
          icon={<Plus size={16} aria-hidden="true" />}
          fullWidth={false}
          onClick={handleCreateClick}
        >
          Create Party Group
        </ActionButton>
      </div>

      {partyGroupsStatus === "loading" ? (
        <div className={styles.emptyState}>
          <Users size={28} aria-hidden="true" />
          <span>Loading party groups...</span>
        </div>
      ) : partyGroupsError ? (
        <p className={styles.modalError}>{partyGroupsError}</p>
      ) : !isAuthenticated ? (
        <div className={styles.emptyState}>
          <Users size={28} aria-hidden="true" />
          <span>Sign in to manage party groups.</span>
        </div>
      ) : partyGroups.length > 0 ? (
        <div className={styles.partyList}>
          {partyGroups.map((partyGroup) => (
            <Link
              key={partyGroup.id}
              to={`/dm-tools/party-manager/${partyGroup.id}`}
              className={styles.partyListRow}
            >
              <span className={styles.partyListIcon}>
                <Users size={18} aria-hidden="true" />
              </span>
              <span className={styles.partyListMain}>
                <strong>{partyGroup.name}</strong>
                <small>
                  {partyGroup.memberCount} {partyGroup.memberCount === 1 ? "member" : "members"}
                </small>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users size={28} aria-hidden="true" />
          <span>No party groups yet.</span>
        </div>
      )}

      {createModalOpen ? (
        <CreatePartyGroupModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(partyGroupId) => {
            setCreateModalOpen(false);
            navigate(`/dm-tools/party-manager/${partyGroupId}`);
          }}
        />
      ) : null}
    </section>
  );
}

export default PartyManagerBody;

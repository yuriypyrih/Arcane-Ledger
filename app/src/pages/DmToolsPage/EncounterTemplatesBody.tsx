import { Plus, Swords } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listEncounterTemplates } from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import {
  setEncounterTemplates,
  setEncounterTemplatesError,
  setEncounterTemplatesLoading,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CreateEncounterTemplateModal from "./CreateEncounterTemplateModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type EncounterTemplatesBodyProps = {
  panelId: string;
  tabId: string;
};

function EncounterTemplatesBody({ panelId, tabId }: EncounterTemplatesBodyProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const encounterTemplates = useAppSelector((state) => state.dmTools.encounterTemplates);
  const encounterTemplatesStatus = useAppSelector(
    (state) => state.dmTools.encounterTemplatesStatus
  );
  const encounterTemplatesError = useAppSelector((state) => state.dmTools.encounterTemplatesError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const loadedEncounterTemplatesForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    let didCancel = false;
    const loadKey = isAuthenticated ? authUserId : null;

    if (!loadKey) {
      loadedEncounterTemplatesForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedEncounterTemplatesForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedEncounterTemplatesForAuthRef.current = loadKey;
    dispatch(setEncounterTemplatesLoading());

    void listEncounterTemplates({ suppressFailureToast: true })
      .then(({ encounterTemplates: nextEncounterTemplates }) => {
        if (!didCancel) {
          dispatch(setEncounterTemplates(nextEncounterTemplates));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setEncounterTemplatesError(
              getDmToolsApiErrorMessage(error, "Unable to load encounter templates.")
            )
          );
          loadedEncounterTemplatesForAuthRef.current = null;
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
          text: "Sign in to create encounter templates.",
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
          <p className={styles.bodyEyebrow}>Encounter Templates</p>
          <h3 className={styles.bodyTitle}>Templates</h3>
        </div>
        <ActionButton
          icon={<Plus size={16} aria-hidden="true" />}
          fullWidth={false}
          onClick={handleCreateClick}
        >
          Create Encounter Template
        </ActionButton>
      </div>

      {encounterTemplatesStatus === "loading" ? (
        <div className={styles.emptyState}>
          <Swords size={28} aria-hidden="true" />
          <span>Loading encounter templates...</span>
        </div>
      ) : encounterTemplatesError ? (
        <p className={styles.modalError}>{encounterTemplatesError}</p>
      ) : !isAuthenticated ? (
        <div className={styles.emptyState}>
          <Swords size={28} aria-hidden="true" />
          <span>Sign in to manage encounter templates.</span>
        </div>
      ) : encounterTemplates.length > 0 ? (
        <div className={styles.partyList}>
          {encounterTemplates.map((encounterTemplate) => (
            <Link
              key={encounterTemplate.id}
              to={`/dm-tools/encounter-templates/${encounterTemplate.id}`}
              className={styles.partyListRow}
            >
              <span className={styles.partyListIcon}>
                <Swords size={18} aria-hidden="true" />
              </span>
              <span className={styles.partyListMain}>
                <strong>{encounterTemplate.name}</strong>
                <small>
                  {encounterTemplate.creatureCount}{" "}
                  {encounterTemplate.creatureCount === 1 ? "creature" : "creatures"}
                </small>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Swords size={28} aria-hidden="true" />
          <span>No encounter templates yet.</span>
        </div>
      )}

      {createModalOpen ? (
        <CreateEncounterTemplateModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(encounterTemplateId) => {
            setCreateModalOpen(false);
            navigate(`/dm-tools/encounter-templates/${encounterTemplateId}`);
          }}
        />
      ) : null}
    </section>
  );
}

export default EncounterTemplatesBody;

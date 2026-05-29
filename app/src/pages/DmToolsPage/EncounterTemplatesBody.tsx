import { Plus, Swords } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getDmToolsQuotaForRole } from "./dmToolsQuotas";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
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
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const encounterTemplates = useAppSelector((state) => state.dmTools.encounterTemplates);
  const encounterTemplatesStatus = useAppSelector(
    (state) => state.dmTools.encounterTemplatesStatus
  );
  const encounterTemplatesError = useAppSelector((state) => state.dmTools.encounterTemplatesError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const loadedEncounterTemplatesForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const encounterTemplateLimit = getDmToolsQuotaForRole("encounterTemplates", authUserRole);
  const isAtEncounterTemplateLimit =
    isAuthenticated && encounterTemplates.length >= encounterTemplateLimit;

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

    if (isAtEncounterTemplateLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${encounterTemplateLimit} encounter templates.`,
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
          <h3 className={styles.bodyTitle}>Templates</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {encounterTemplates.length}/{encounterTemplateLimit} templates
            </span>
          ) : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtEncounterTemplateLimit}
            fullWidth={false}
            title={
              isAtEncounterTemplateLimit
                ? `You can create up to ${encounterTemplateLimit} encounter templates.`
                : undefined
            }
            onClick={handleCreateClick}
          >
            Create Encounter Template
          </ActionButton>
        </div>
      </div>

      {encounterTemplatesStatus === "loading" ? (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          Loading encounter templates...
        </DmToolsEmptyState>
      ) : encounterTemplatesError ? (
        <p className={styles.modalError}>{encounterTemplatesError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          Sign in to manage encounter templates.
        </DmToolsEmptyState>
      ) : encounterTemplates.length > 0 ? (
        <div className={styles.dmToolsList}>
          {encounterTemplates.map((encounterTemplate) => (
            <DmToolsListCard
              key={encounterTemplate.id}
              icon={<Swords size={18} aria-hidden="true" />}
              title={encounterTemplate.name}
              meta={`${encounterTemplate.creatureCount} ${
                encounterTemplate.creatureCount === 1 ? "creature" : "creatures"
              }`}
              to={`/gm-tools/encounter-templates/${encounterTemplate.id}`}
            />
          ))}
        </div>
      ) : (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          No encounter templates yet.
        </DmToolsEmptyState>
      )}

      {createModalOpen ? (
        <CreateEncounterTemplateModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(encounterTemplateId) => {
            setCreateModalOpen(false);
            navigate(`/gm-tools/encounter-templates/${encounterTemplateId}`);
          }}
        />
      ) : null}
    </section>
  );
}

export default EncounterTemplatesBody;

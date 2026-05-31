import { Plus, Swords, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteEncounterTemplate,
  listEncounterTemplates,
  type EncounterTemplateRecord
} from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removeEncounterTemplateRecord,
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

function getDeleteEncounterTemplateMessage(encounterTemplate: EncounterTemplateRecord): ReactNode {
  return (
    <>
      Delete <strong>{encounterTemplate.name}</strong> and all creatures saved in this template.
    </>
  );
}

function EncounterTemplatesBody({ panelId, tabId }: EncounterTemplatesBodyProps) {
  const deleteTitleId = useId();
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
  const [pendingDeleteEncounterTemplate, setPendingDeleteEncounterTemplate] =
    useState<EncounterTemplateRecord | null>(null);
  const [isDeletingEncounterTemplate, setIsDeletingEncounterTemplate] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
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

  async function handleConfirmDeleteEncounterTemplate() {
    if (!pendingDeleteEncounterTemplate || isDeletingEncounterTemplate) {
      return;
    }

    setActionError(null);
    setIsDeletingEncounterTemplate(true);

    try {
      const { encounterTemplateId } = await deleteEncounterTemplate(
        pendingDeleteEncounterTemplate.id,
        { suppressFailureToast: true }
      );

      dispatch(removeEncounterTemplateRecord(encounterTemplateId));
      dispatch(
        showToast({
          text: "Encounter template deleted.",
          type: "success"
        })
      );
      setPendingDeleteEncounterTemplate(null);
    } catch (deleteError) {
      setActionError(
        getDmToolsApiErrorMessage(deleteError, "Unable to delete encounter template.")
      );
    } finally {
      setIsDeletingEncounterTemplate(false);
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

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

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
              actions={[
                {
                  disabled: isDeletingEncounterTemplate,
                  icon: <Trash2 size={18} aria-hidden="true" />,
                  label: `Delete ${encounterTemplate.name}`,
                  onClick: () => {
                    setActionError(null);
                    setPendingDeleteEncounterTemplate(encounterTemplate);
                  }
                }
              ]}
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
      {pendingDeleteEncounterTemplate ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete encounter template?"
          message={getDeleteEncounterTemplateMessage(pendingDeleteEncounterTemplate)}
          confirmLabel={isDeletingEncounterTemplate ? "Deleting..." : "Delete"}
          closeLabel="Close delete encounter template confirmation"
          onCancel={() => setPendingDeleteEncounterTemplate(null)}
          onConfirm={() => {
            void handleConfirmDeleteEncounterTemplate();
          }}
        />
      ) : null}
    </section>
  );
}

export default EncounterTemplatesBody;

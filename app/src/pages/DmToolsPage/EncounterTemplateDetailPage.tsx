import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncounterTemplate,
  removeEncounterTemplateCreature,
  upsertEncounterTemplateCreature,
  type EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";
import {
  setSelectedEncounterTemplate,
  setSelectedEncounterTemplateError,
  setSelectedEncounterTemplateLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EditEncounterTemplateModal from "./EditEncounterTemplateModal";
import EncounterCreatureBuilder from "./EncounterCreatureBuilder";

function EncounterTemplateDetailPage() {
  const { encounterTemplateId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const encounterTemplate = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplatesById[encounterTemplateId]
  );
  const status = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplateStatusById[encounterTemplateId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplateErrorById[encounterTemplateId] ?? null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    if (!encounterTemplateId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    setActionError(null);
    dispatch(setSelectedEncounterTemplateLoading(encounterTemplateId));

    void getEncounterTemplate(encounterTemplateId, { suppressFailureToast: true })
      .then(({ encounterTemplate: nextEncounterTemplate }) => {
        if (!didCancel) {
          dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedEncounterTemplateError({
              encounterTemplateId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load encounter template.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, dispatch, encounterTemplateId]);

  async function handleSaveCreature(creature: EncounterTemplateCreatureRecord) {
    if (!encounterTemplate) {
      return;
    }

    const { encounterTemplate: nextEncounterTemplate } = await upsertEncounterTemplateCreature(
      encounterTemplate.id,
      creature,
      { suppressFailureToast: true }
    );

    dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
    setActionError(null);
  }

  async function handleRemoveCreature(creatureId: string) {
    if (!encounterTemplate) {
      return;
    }

    const { encounterTemplate: nextEncounterTemplate } = await removeEncounterTemplateCreature(
      encounterTemplate.id,
      creatureId,
      { suppressFailureToast: true }
    );

    dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
    setActionError(null);
  }

  return (
    <>
      <EncounterCreatureBuilder
        actionError={actionError}
        authRequiredLabel="Sign in to view this encounter template."
        error={error}
        isAuthenticated={authStatus === "authenticated"}
        loadingLabel="Loading encounter template..."
        resource={encounterTemplate}
        resourceFallbackName="Encounter Template"
        sectionTitle="Creatures"
        setActionError={setActionError}
        status={status}
        titleId="encounter-template-title"
        toolLabel="Encounter Templates"
        onBack={() => navigate("/dm-tools?tab=encounter-templates")}
        onEditResource={() => setIsEditModalOpen(true)}
        onRemoveCreature={handleRemoveCreature}
        onSaveCreature={handleSaveCreature}
      />
      {encounterTemplate && isEditModalOpen ? (
        <EditEncounterTemplateModal
          encounterTemplate={encounterTemplate}
          onClose={() => setIsEditModalOpen(false)}
        />
      ) : null}
    </>
  );
}

export default EncounterTemplateDetailPage;

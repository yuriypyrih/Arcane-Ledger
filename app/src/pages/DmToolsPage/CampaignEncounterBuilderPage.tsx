import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaign,
  removeCampaignPreparedEncounterCreature,
  updateCampaignPreparedEncounter,
  updateCampaignPreparedEncounterCreatureVisibilitySettings,
  updateCampaignPreparedEncounterVisibilitySettings,
  upsertCampaignPreparedEncounterCreature,
  type CampaignPreparedEncounterRecord,
  type PlayerVisibilitySettings
} from "../../api/campaigns";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import { ENCOUNTER_MAX_CREATURES } from "../../constants/QUOTAS";
import {
  patchSelectedCampaign,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CampaignPreparedEncounterModal from "./CampaignPreparedEncounterModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EncounterCreatureBuilder from "./EncounterCreatureBuilder";
import PlayerVisibilitySettingsModal from "./PlayerVisibilitySettingsModal";

function toBuilderResource(preparedEncounter: CampaignPreparedEncounterRecord | null) {
  if (!preparedEncounter) {
    return null;
  }

  return {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    creatures: preparedEncounter.creatures,
    maxCreatures: ENCOUNTER_MAX_CREATURES
  };
}

function CampaignEncounterBuilderPage() {
  const { campaignId = "", preparedEncounterId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const campaign = useAppSelector((state) => state.dmTools.selectedCampaignsById[campaignId]);
  const status = useAppSelector(
    (state) => state.dmTools.selectedCampaignStatusById[campaignId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedCampaignErrorById[campaignId] ?? null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [visibilityCreatureId, setVisibilityCreatureId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const preparedEncounter =
    campaign?.preparedEncounters.find((encounter) => encounter.id === preparedEncounterId) ?? null;
  const visibilityCreature =
    visibilityCreatureId && preparedEncounter
      ? (preparedEncounter.creatures.find((creature) => creature.id === visibilityCreatureId) ??
        null)
      : null;
  const builderError =
    error ??
    (campaign && !preparedEncounter ? "Prepared encounter was not found." : null);

  useEffect(() => {
    let didCancel = false;

    if (!campaignId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    setActionError(null);
    dispatch(setSelectedCampaignLoading(campaignId));

    void getCampaign(campaignId, { suppressFailureToast: true })
      .then(({ campaign: nextCampaign }) => {
        if (!didCancel) {
          dispatch(setSelectedCampaign(nextCampaign));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedCampaignError({
              campaignId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load campaign.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, campaignId, dispatch]);

  async function handleSaveCreature(creature: EncounterTemplateCreatureRecord) {
    if (!campaign || !preparedEncounter) {
      return;
    }

    const campaignPatch = await upsertCampaignPreparedEncounterCreature(
      campaign.id,
      preparedEncounter.id,
      creature,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleRemoveCreature(creatureId: string) {
    if (!campaign || !preparedEncounter) {
      return;
    }

    const campaignPatch = await removeCampaignPreparedEncounterCreature(
      campaign.id,
      preparedEncounter.id,
      creatureId,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleUpdatePreparedEncounter(name: string) {
    if (!campaign || !preparedEncounter) {
      return;
    }

    const campaignPatch = await updateCampaignPreparedEncounter(
      campaign.id,
      preparedEncounter.id,
      name,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleUpdatePreparedEncounterVisibility(
    visibilitySettings: PlayerVisibilitySettings | null
  ) {
    if (!campaign || !preparedEncounter) {
      return;
    }

    const campaignPatch = await updateCampaignPreparedEncounterVisibilitySettings(
      campaign.id,
      preparedEncounter.id,
      visibilitySettings,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleUpdateCreatureVisibility(
    creatureId: string,
    visibilitySettings: PlayerVisibilitySettings | null
  ) {
    if (!campaign || !preparedEncounter) {
      return;
    }

    const campaignPatch =
      await updateCampaignPreparedEncounterCreatureVisibilitySettings(
        campaign.id,
        preparedEncounter.id,
        creatureId,
        visibilitySettings,
        { suppressFailureToast: true }
      );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  return (
    <>
      <EncounterCreatureBuilder
        actionError={actionError}
        authRequiredLabel="Sign in to view this campaign encounter."
        backLabel="Back to the Campaign Manager"
        error={builderError}
        isAuthenticated={authStatus === "authenticated"}
        isCreatureVisibilitySettingsActive={
          preparedEncounter
            ? (creatureId) =>
                preparedEncounter.creatures.some(
                  (creature) =>
                    creature.id === creatureId &&
                    creature.visibilitySettings !== null &&
                    creature.visibilitySettings !== undefined
                )
            : undefined
        }
        isVisibilitySettingsActive={
          preparedEncounter
            ? preparedEncounter.visibilitySettings !== null &&
              preparedEncounter.visibilitySettings !== undefined
            : false
        }
        loadingLabel="Loading campaign encounter..."
        resource={toBuilderResource(preparedEncounter)}
        resourceFallbackName="Campaign Encounter"
        sectionTitle="Creatures"
        setActionError={setActionError}
        status={status}
        titleId="campaign-encounter-title"
        toolLabel="Campaign Encounter"
        onBack={() => navigate(`/dm-tools/campaign-manager/${campaignId}`)}
        onEditCreatureVisibilitySettings={
          preparedEncounter ? (creatureId) => setVisibilityCreatureId(creatureId) : undefined
        }
        onEditResource={preparedEncounter ? () => setIsEditModalOpen(true) : undefined}
        onEditVisibilitySettings={
          preparedEncounter ? () => setIsVisibilityModalOpen(true) : undefined
        }
        onRemoveCreature={handleRemoveCreature}
        onSaveCreature={handleSaveCreature}
      />
      {preparedEncounter && isEditModalOpen ? (
        <CampaignPreparedEncounterModal
          encounter={preparedEncounter}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdatePreparedEncounter}
        />
      ) : null}
      {preparedEncounter && isVisibilityModalOpen ? (
        <PlayerVisibilitySettingsModal
          initialSettings={preparedEncounter.visibilitySettings}
          scope="encounter"
          onClose={() => setIsVisibilityModalOpen(false)}
          onSave={handleUpdatePreparedEncounterVisibility}
        />
      ) : null}
      {visibilityCreature ? (
        <PlayerVisibilitySettingsModal
          initialSettings={visibilityCreature.visibilitySettings ?? null}
          scope="creature"
          onClose={() => setVisibilityCreatureId(null)}
          onSave={(settings) => handleUpdateCreatureVisibility(visibilityCreature.id, settings)}
        />
      ) : null}
    </>
  );
}

export default CampaignEncounterBuilderPage;

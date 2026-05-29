import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  copyEncounterTemplateToCampaign,
  createCampaignPreparedEncounter,
  createCampaignSessionNote,
  createOwnedCampaign,
  getOwnedCampaignDetail,
  listOwnedCampaigns,
  normalizeCampaignName,
  removeCampaignPreparedEncounter,
  removeCampaignPreparedEncounterCreature,
  removeCampaignSessionNote,
  updateCampaignPreparedEncounterCreatureVisibilitySettings,
  updateCampaignPreparedEncounterName,
  updateCampaignPreparedEncounterVisibilitySettings,
  updateCampaignSelectedParty,
  updateCampaignSessionNote,
  updateCampaignVisibilitySettings,
  updateOwnedCampaignName,
  upsertCampaignPreparedEncounterCreature
} from "../services/campaignService.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertObjectBody(value: unknown) {
  if (!isObjectRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_CAMPAIGN_INPUT");
  }

  return value;
}

export const listCampaigns = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      campaigns: await listOwnedCampaigns(response.locals.authUser._id)
    });
  }
);

export const createCampaign = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);
    const campaign = await createOwnedCampaign({
      name: normalizeCampaignName(body.name),
      ownerId: response.locals.authUser._id,
      ownerRole: response.locals.authUser.role
    });

    response.status(201).json({ campaign });
  }
);

export const getCampaign = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      campaign: await getOwnedCampaignDetail({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const updateCampaign = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);

    response.json(
      await updateOwnedCampaignName({
        campaignId: request.params.campaignId ?? "",
        name: normalizeCampaignName(body.name),
        ownerId: response.locals.authUser._id
      })
    );
  }
);

export const updateCampaignVisibility = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    assertObjectBody(request.body);

    response.json(
      await updateCampaignVisibilitySettings({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        visibilitySettings: request.body
      })
    );
  }
);

export const updateCampaignParty = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);

    response.json(
      await updateCampaignSelectedParty({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        partyGroupId: body.partyGroupId
      })
    );
  }
);

export const createCampaignSessionNoteById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.status(201).json(
      await createCampaignSessionNote({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        sessionNote: request.body
      })
    );
  }
);

export const updateCampaignSessionNoteById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await updateCampaignSessionNote({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        sessionNote: request.body,
        sessionNoteId: request.params.sessionNoteId ?? ""
      })
    );
  }
);

export const removeCampaignSessionNoteById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await removeCampaignSessionNote({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        sessionNoteId: request.params.sessionNoteId ?? ""
      })
    );
  }
);

export const createCampaignPreparedEncounterById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);

    response.status(201).json(
      await createCampaignPreparedEncounter({
        campaignId: request.params.campaignId ?? "",
        name: body.name,
        ownerId: response.locals.authUser._id
      })
    );
  }
);

export const copyEncounterTemplateToCampaignById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);

    response.status(201).json(
      await copyEncounterTemplateToCampaign({
        campaignId: request.params.campaignId ?? "",
        encounterTemplateId: typeof body.encounterTemplateId === "string" ? body.encounterTemplateId : "",
        ownerId: response.locals.authUser._id
      })
    );
  }
);

export const updateCampaignPreparedEncounterById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const body = assertObjectBody(request.body);

    response.json(
      await updateCampaignPreparedEncounterName({
        campaignId: request.params.campaignId ?? "",
        name: body.name,
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? ""
      })
    );
  }
);

export const updateCampaignPreparedEncounterVisibilityById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await updateCampaignPreparedEncounterVisibilitySettings({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? "",
        visibilitySettings: request.body
      })
    );
  }
);

export const removeCampaignPreparedEncounterById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await removeCampaignPreparedEncounter({
        campaignId: request.params.campaignId ?? "",
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? ""
      })
    );
  }
);

export const upsertCampaignPreparedEncounterCreatureById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await upsertCampaignPreparedEncounterCreature({
        campaignId: request.params.campaignId ?? "",
        creature: request.body,
        creatureId: request.params.creatureId ?? "",
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? ""
      })
    );
  }
);

export const updateCampaignPreparedEncounterCreatureVisibilityById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await updateCampaignPreparedEncounterCreatureVisibilitySettings({
        campaignId: request.params.campaignId ?? "",
        creatureId: request.params.creatureId ?? "",
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? "",
        visibilitySettings: request.body
      })
    );
  }
);

export const removeCampaignPreparedEncounterCreatureById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await removeCampaignPreparedEncounterCreature({
        campaignId: request.params.campaignId ?? "",
        creatureId: request.params.creatureId ?? "",
        ownerId: response.locals.authUser._id,
        preparedEncounterId: request.params.preparedEncounterId ?? ""
      })
    );
  }
);

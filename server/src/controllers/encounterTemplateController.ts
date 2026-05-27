import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  createOwnedEncounterTemplate,
  getOwnedEncounterTemplateDetail,
  listOwnedEncounterTemplates,
  normalizeEncounterTemplateName,
  removeEncounterTemplateCreature,
  updateOwnedEncounterTemplateName,
  upsertEncounterTemplateCreature
} from "../services/encounterTemplateService.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const listEncounterTemplates = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      encounterTemplates: await listOwnedEncounterTemplates(response.locals.authUser._id)
    });
  }
);

export const createEncounterTemplate = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_ENCOUNTER_TEMPLATE_INPUT");
    }

    const encounterTemplate = await createOwnedEncounterTemplate({
      name: normalizeEncounterTemplateName(request.body.name),
      ownerId: response.locals.authUser._id
    });

    response.status(201).json({ encounterTemplate });
  }
);

export const getEncounterTemplate = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      encounterTemplate: await getOwnedEncounterTemplateDetail({
        encounterTemplateId: request.params.encounterTemplateId ?? "",
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const updateEncounterTemplate = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_ENCOUNTER_TEMPLATE_INPUT");
    }

    response.json({
      encounterTemplate: await updateOwnedEncounterTemplateName({
        encounterTemplateId: request.params.encounterTemplateId ?? "",
        name: normalizeEncounterTemplateName(request.body.name),
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const upsertEncounterTemplateCreatureById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      encounterTemplate: await upsertEncounterTemplateCreature({
        creature: request.body,
        creatureId: request.params.creatureId ?? "",
        encounterTemplateId: request.params.encounterTemplateId ?? "",
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const removeEncounterTemplateCreatureById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      encounterTemplate: await removeEncounterTemplateCreature({
        creatureId: request.params.creatureId ?? "",
        encounterTemplateId: request.params.encounterTemplateId ?? "",
        ownerId: response.locals.authUser._id
      })
    });
  }
);

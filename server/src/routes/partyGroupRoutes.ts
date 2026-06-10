import { Router } from "express";
import {
  createPartyGroup,
  deletePartyGroup,
  getPartyGroup,
  getPartyGroupLiveEncounter,
  getPartyGroupMemberView,
  joinPartyGroupByInvite,
  leavePartyGroupMembership,
  listMyPartyMemberships,
  listPartyGroups,
  removePartyGroupCharacterById,
  resetPartyGroupInviteToken,
  updatePartyGroup
} from "../controllers/partyGroupController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const partyGroupRoutes = Router();

partyGroupRoutes.get("/", requireAuth, listPartyGroups);
partyGroupRoutes.post("/", requireAuth, createPartyGroup);
partyGroupRoutes.post("/join", requireAuth, joinPartyGroupByInvite);
partyGroupRoutes.get("/my-memberships", requireAuth, listMyPartyMemberships);
partyGroupRoutes.delete("/:partyGroupId", requireAuth, deletePartyGroup);
partyGroupRoutes.patch("/:partyGroupId", requireAuth, updatePartyGroup);
partyGroupRoutes.get("/:partyGroupId/member-view", requireAuth, getPartyGroupMemberView);
partyGroupRoutes.get("/:partyGroupId/live-encounter", requireAuth, getPartyGroupLiveEncounter);
partyGroupRoutes.delete(
  "/:partyGroupId/memberships/:characterSheetId",
  requireAuth,
  leavePartyGroupMembership
);
partyGroupRoutes.post("/:partyGroupId/invite-token/reset", requireAuth, resetPartyGroupInviteToken);
partyGroupRoutes.delete(
  "/:partyGroupId/characters/:characterSheetId",
  requireAuth,
  removePartyGroupCharacterById
);
partyGroupRoutes.get("/:partyGroupId", requireAuth, getPartyGroup);

export { partyGroupRoutes };

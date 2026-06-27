import { Router } from "express";
import {
  createPartyGroup,
  deletePartyGroup,
  getPartyGroup,
  getPartyGroupInventoryContent,
  getPartyGroupLiveEncounter,
  getPartyGroupMasterChestContent,
  getPartyGroupMemberView,
  joinPartyGroupByInvite,
  leavePartyGroupMembership,
  listMyPartyMemberships,
  listPartyGroups,
  removePartyGroupCharacterById,
  resetPartyGroupInviteToken,
  updatePartyGroupMasterChestContent,
  updatePartyGroupLiveEncounterTurn,
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
partyGroupRoutes.patch(
  "/:partyGroupId/live-encounter/turn",
  requireAuth,
  updatePartyGroupLiveEncounterTurn
);
partyGroupRoutes.get("/:partyGroupId/inventories", requireAuth, getPartyGroupInventoryContent);
partyGroupRoutes.get("/:partyGroupId/master-chest", requireAuth, getPartyGroupMasterChestContent);
partyGroupRoutes.put(
  "/:partyGroupId/master-chest",
  requireAuth,
  updatePartyGroupMasterChestContent
);
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

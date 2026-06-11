import crypto from "node:crypto";
import { Types } from "mongoose";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import {
  CharacterSheet,
  type CharacterAvatarRecord,
  type CharacterSheetSummaryRecord
} from "../models/CharacterSheet.js";
import { Campaign } from "../models/Campaign.js";
import {
  PartyGroup,
  type PartyGroupDocument,
  type PartyGroupRecord
} from "../models/PartyGroup.js";
import { User } from "../models/User.js";
import type { UserRole } from "../types/auth.js";
import { PARTY_GROUP_MAX_MEMBERS as PARTY_GROUP_MAX_MEMBERS_QUOTA } from "../constants/QUOTAS.js";
import { toMemberVisibleCampaignLiveEncounterTrackerDetailRecord } from "./campaignLiveEncounterTrackerService.js";
import { assertCreatedDmToolWithinLimit, assertDmToolCreationLimit } from "./dmToolLimits.js";

const PARTY_GROUP_INVITE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const PARTY_GROUP_INVITE_TOKEN_LENGTH = 12;
const PARTY_GROUP_INVITE_CREATE_ATTEMPTS = 5;
const PARTY_GROUP_NAME_MIN_LENGTH = 2;
const PARTY_GROUP_NAME_MAX_LENGTH = 128;
export const PARTY_GROUP_MAX_MEMBERS = PARTY_GROUP_MAX_MEMBERS_QUOTA;

type PartyGroupSource = PartyGroupRecord & {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type PartyGroupListSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
  name: string;
  ownerId: Types.ObjectId | { toString(): string } | string;
  characterIds?: Types.ObjectId[];
  memberCount?: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type CharacterSheetMemberSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
  ownerId: Types.ObjectId | { toString(): string } | string;
  summary: CharacterSheetSummaryRecord;
  avatar?: CharacterAvatarRecord | null;
  updatedAt?: Date | string | null;
};

type PartyGroupMemberUser = {
  id: string;
  nickname: string;
};

type PartyGroupOwnerUser = PartyGroupMemberUser;

function getDocumentId(
  document: Pick<PartyGroupSource | CharacterSheetMemberSource, "_id" | "id">
) {
  return document.id ?? document._id?.toString() ?? "";
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function createPartyGroupInviteToken() {
  let token = "";

  for (let index = 0; index < PARTY_GROUP_INVITE_TOKEN_LENGTH; index += 1) {
    const alphabetIndex = crypto.randomInt(PARTY_GROUP_INVITE_ALPHABET.length);
    token += PARTY_GROUP_INVITE_ALPHABET[alphabetIndex] ?? "";
  }

  return token;
}

async function findOwnedPartyGroupDocument(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  if (!options.partyGroupId || !Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const partyGroup = await PartyGroup.findOne({
    _id: options.partyGroupId,
    ownerId: options.ownerId
  }).exec();

  if (!partyGroup) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  return partyGroup;
}

async function findMemberVisiblePartyGroupSource(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  if (!options.partyGroupId || !Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const partyGroup = (await PartyGroup.findById(options.partyGroupId)
    .lean()
    .exec()) as PartyGroupSource | null;

  if (!partyGroup) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  if (partyGroup.ownerId.toString() !== options.ownerId.toString()) {
    const ownedMember = await CharacterSheet.exists({
      ownerId: options.ownerId,
      deletedAt: null,
      partyGroupId: new Types.ObjectId(options.partyGroupId)
    }).exec();

    if (!ownedMember) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
    }
  }

  return partyGroup;
}

function createPartyInviteUrl(inviteToken: string) {
  const { frontendUrl } = getAppConfig();
  const inviteUrl = new URL("/", frontendUrl);

  inviteUrl.searchParams.set("partyInvite", inviteToken);
  return inviteUrl.toString();
}

export function normalizePartyGroupName(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Party group name is required.", 400, "INVALID_PARTY_GROUP_NAME");
  }

  const name = value.trim();

  if (name.length < PARTY_GROUP_NAME_MIN_LENGTH || name.length > PARTY_GROUP_NAME_MAX_LENGTH) {
    throw new AppError(
      `Party group name must be ${PARTY_GROUP_NAME_MIN_LENGTH}-${PARTY_GROUP_NAME_MAX_LENGTH} characters.`,
      400,
      "INVALID_PARTY_GROUP_NAME",
      {
        minLength: PARTY_GROUP_NAME_MIN_LENGTH,
        maxLength: PARTY_GROUP_NAME_MAX_LENGTH
      }
    );
  }

  return name;
}

export function normalizePartyInviteToken(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Party invite link is required.", 400, "INVALID_PARTY_INVITE");
  }

  const rawValue = value.trim();

  if (!rawValue) {
    throw new AppError("Party invite link is required.", 400, "INVALID_PARTY_INVITE");
  }

  let token = rawValue;

  try {
    const inviteUrl = new URL(rawValue);
    token =
      inviteUrl.searchParams.get("partyInvite") ?? inviteUrl.pathname.split("/").pop() ?? rawValue;
  } catch {
    token = rawValue;
  }

  const normalizedToken = token.trim().toUpperCase();

  if (
    normalizedToken.length !== PARTY_GROUP_INVITE_TOKEN_LENGTH ||
    !/^[A-Z0-9]+$/.test(normalizedToken)
  ) {
    throw new AppError(
      "Party invite link must use capital letters and numbers.",
      400,
      "INVALID_PARTY_INVITE"
    );
  }

  return normalizedToken;
}

export function toPartyGroupListRecord(partyGroup: PartyGroupListSource) {
  return {
    id: getDocumentId(partyGroup),
    name: partyGroup.name,
    ownerId: partyGroup.ownerId.toString(),
    memberCount: partyGroup.memberCount ?? partyGroup.characterIds?.length ?? 0,
    createdAt: toIsoTimestamp(partyGroup.createdAt),
    updatedAt: toIsoTimestamp(partyGroup.updatedAt)
  };
}

function toPartyGroupDetailRecord(partyGroup: PartyGroupSource) {
  const inviteToken = partyGroup.inviteToken;
  const characterIds = partyGroup.characterIds.map((characterId) => characterId.toString());

  return {
    ...toPartyGroupListRecord(partyGroup),
    adminUserIds: partyGroup.adminUserIds.map((adminUserId) => adminUserId.toString()),
    inviteToken,
    inviteUrl: createPartyInviteUrl(inviteToken),
    characterIds,
    maxMembers: PARTY_GROUP_MAX_MEMBERS
  };
}

function toAvatarResponse(avatar: CharacterAvatarRecord | null | undefined) {
  if (!avatar) {
    return null;
  }

  return {
    objectKey: avatar.objectKey,
    imageUrl: avatar.imageUrl,
    mimeType: avatar.mimeType,
    sizeBytes: avatar.sizeBytes,
    updatedAt: toIsoTimestamp(avatar.updatedAt) ?? new Date().toISOString()
  };
}

function toPartyGroupMemberRecord(
  character: CharacterSheetMemberSource,
  userById: Map<string, PartyGroupMemberUser>
) {
  const ownerId = character.ownerId.toString();

  return {
    characterId: getDocumentId(character),
    ownerId,
    user: userById.get(ownerId) ?? {
      id: ownerId,
      nickname: "Unknown Player"
    },
    summary: character.summary,
    avatar: toAvatarResponse(character.avatar),
    updatedAt: toIsoTimestamp(character.updatedAt)
  };
}

async function getPartyGroupDetailFromSource(partyGroup: PartyGroupSource) {
  const characters = (await CharacterSheet.find({
    _id: { $in: partyGroup.characterIds },
    deletedAt: null
  })
    .select("_id ownerId summary avatar updatedAt")
    .lean()
    .exec()) as CharacterSheetMemberSource[];
  const partyOwnerId = partyGroup.ownerId.toString();
  const ownerIds = [
    ...new Set([partyOwnerId, ...characters.map((character) => character.ownerId.toString())])
  ];
  const users = await User.find({
    _id: { $in: ownerIds }
  })
    .select("_id nickname")
    .lean()
    .exec();
  const userById = new Map(
    users.map((user) => [
      user._id.toString(),
      {
        id: user._id.toString(),
        nickname: user.nickname
      }
    ])
  );
  const owner: PartyGroupOwnerUser = userById.get(partyOwnerId) ?? {
    id: partyOwnerId,
    nickname: "Unknown Player"
  };

  return {
    ...toPartyGroupDetailRecord(partyGroup),
    owner,
    members: characters.map((character) => toPartyGroupMemberRecord(character, userById))
  };
}

export async function listOwnedPartyGroups(ownerId: Types.ObjectId) {
  const partyGroups = (await PartyGroup.aggregate<PartyGroupListSource>([
    { $match: { ownerId } },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        name: 1,
        ownerId: 1,
        memberCount: { $size: { $ifNull: ["$characterIds", []] } },
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]).exec()) as PartyGroupListSource[];

  return partyGroups.map(toPartyGroupListRecord);
}

export async function createOwnedPartyGroup(options: {
  name: string;
  ownerId: Types.ObjectId;
  ownerRole: UserRole;
}) {
  const name = normalizePartyGroupName(options.name);
  const countOwnedPartyGroups = () =>
    PartyGroup.countDocuments({ ownerId: options.ownerId }).exec();
  const currentCount = await countOwnedPartyGroups();

  assertDmToolCreationLimit({
    currentCount,
    kind: "partyGroups",
    role: options.ownerRole
  });

  for (let attempt = 0; attempt < PARTY_GROUP_INVITE_CREATE_ATTEMPTS; attempt += 1) {
    const inviteToken = createPartyGroupInviteToken();

    try {
      const partyGroup = await PartyGroup.create({
        name,
        ownerId: options.ownerId,
        adminUserIds: [options.ownerId],
        inviteToken,
        characterIds: []
      });

      await assertCreatedDmToolWithinLimit({
        countDocuments: countOwnedPartyGroups,
        isCreatedWithinLimit: async (limit) => {
          const retainedPartyGroups = await PartyGroup.find({ ownerId: options.ownerId })
            .sort({ createdAt: 1, _id: 1 })
            .limit(limit)
            .select("_id")
            .lean()
            .exec();

          return retainedPartyGroups.some(
            (retainedPartyGroup) => retainedPartyGroup._id.toString() === partyGroup._id.toString()
          );
        },
        kind: "partyGroups",
        removeCreated: () =>
          PartyGroup.deleteOne({
            _id: partyGroup._id,
            ownerId: options.ownerId
          }).exec(),
        role: options.ownerRole
      });

      return toPartyGroupListRecord(partyGroup);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    "Unable to create a unique party invite link.",
    500,
    "PARTY_INVITE_CREATE_FAILED"
  );
}

export async function getOwnedPartyGroupDetail(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  if (!options.partyGroupId || !Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const partyGroup = (await PartyGroup.findOne({
    _id: options.partyGroupId,
    ownerId: options.ownerId
  })
    .lean()
    .exec()) as PartyGroupSource | null;

  if (!partyGroup) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  return getPartyGroupDetailFromSource(partyGroup);
}

export async function getMemberVisiblePartyGroupDetail(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  const partyGroup = await findMemberVisiblePartyGroupSource(options);

  return getPartyGroupDetailFromSource(partyGroup);
}

export async function getMemberVisiblePartyGroupLiveEncounter(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  const partyGroup = await findMemberVisiblePartyGroupSource(options);
  const partyGroupObjectId = new Types.ObjectId(options.partyGroupId);
  const campaign = await Campaign.findOne({
    "liveEncounterTracker.partyGroupId": partyGroupObjectId,
    "liveEncounterTracker.preparedEncounterId": { $exists: true }
  })
    .sort({
      "liveEncounterTracker.updatedAt": -1,
      updatedAt: -1,
      _id: -1
    })
    .exec();

  return {
    partyGroupId: getDocumentId(partyGroup),
    liveEncounterTracker: campaign
      ? await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(campaign)
      : null
  };
}

export async function deleteOwnedPartyGroup(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  const partyGroup = await findOwnedPartyGroupDocument(options);
  const partyGroupObjectId = partyGroup._id;
  const partyGroupId = partyGroup.id;

  await CharacterSheet.updateMany(
    {
      partyGroupId: partyGroupObjectId
    },
    {
      $set: {
        partyGroupId: null
      }
    }
  ).exec();
  await Campaign.updateMany(
    {
      ownerId: options.ownerId,
      selectedPartyId: partyGroupObjectId
    },
    {
      $set: {
        selectedPartyId: null
      }
    }
  ).exec();
  await partyGroup.deleteOne();

  return {
    partyGroupId
  };
}

export async function updateOwnedPartyGroupName(options: {
  name: string;
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  const partyGroup = await findOwnedPartyGroupDocument({
    ownerId: options.ownerId,
    partyGroupId: options.partyGroupId
  });

  partyGroup.name = normalizePartyGroupName(options.name);
  await partyGroup.save();

  return getOwnedPartyGroupDetail({
    ownerId: options.ownerId,
    partyGroupId: partyGroup.id
  });
}

export async function resetOwnedPartyGroupInviteToken(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  const partyGroup = await findOwnedPartyGroupDocument({
    ownerId: options.ownerId,
    partyGroupId: options.partyGroupId
  });
  const previousToken = partyGroup.inviteToken;

  for (let attempt = 0; attempt < PARTY_GROUP_INVITE_CREATE_ATTEMPTS; attempt += 1) {
    const inviteToken = createPartyGroupInviteToken();

    if (inviteToken === previousToken) {
      continue;
    }

    try {
      partyGroup.inviteToken = inviteToken;
      await partyGroup.save();

      return getOwnedPartyGroupDetail({
        ownerId: options.ownerId,
        partyGroupId: partyGroup.id
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    "Unable to create a unique party invite link.",
    500,
    "PARTY_INVITE_CREATE_FAILED"
  );
}

export async function removePartyGroupCharacter(options: {
  characterSheetId: string;
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  if (!options.characterSheetId || !Types.ObjectId.isValid(options.characterSheetId)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  const partyGroup = await findOwnedPartyGroupDocument({
    ownerId: options.ownerId,
    partyGroupId: options.partyGroupId
  });
  const characterObjectId = new Types.ObjectId(options.characterSheetId);
  const isMember = partyGroup.characterIds.some((characterId) =>
    characterId.equals(characterObjectId)
  );

  if (!isMember) {
    throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
  }

  partyGroup.characterIds = partyGroup.characterIds.filter(
    (characterId) => !characterId.equals(characterObjectId)
  );
  await CharacterSheet.updateOne(
    {
      _id: characterObjectId,
      partyGroupId: partyGroup._id
    },
    {
      $set: {
        partyGroupId: null
      }
    }
  ).exec();
  await partyGroup.save();

  return getOwnedPartyGroupDetail({
    ownerId: options.ownerId,
    partyGroupId: partyGroup.id
  });
}

export async function leavePartyGroup(options: {
  characterSheetId: string;
  ownerId: Types.ObjectId;
  partyGroupId: string;
}) {
  if (!options.partyGroupId || !Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  if (!options.characterSheetId || !Types.ObjectId.isValid(options.characterSheetId)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  const partyGroup = await PartyGroup.findById(options.partyGroupId).exec();

  if (!partyGroup) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  const characterObjectId = new Types.ObjectId(options.characterSheetId);
  const character = await CharacterSheet.findOne({
    _id: characterObjectId,
    ownerId: options.ownerId,
    deletedAt: null,
    partyGroupId: partyGroup._id
  }).exec();

  if (!character) {
    throw new AppError("Party membership was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
  }

  character.partyGroupId = null;
  partyGroup.characterIds = partyGroup.characterIds.filter(
    (characterId) => !characterId.equals(characterObjectId)
  );

  await character.save();
  await partyGroup.save();

  return {
    partyGroupId: partyGroup.id,
    characterId: character.id
  };
}

export async function joinPartyGroup(options: {
  invite: string;
  characterSheetId: string;
  ownerId: Types.ObjectId;
}) {
  if (!options.characterSheetId || !Types.ObjectId.isValid(options.characterSheetId)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  const inviteToken = normalizePartyInviteToken(options.invite);
  const partyGroup = await PartyGroup.findOne({ inviteToken }).exec();

  if (!partyGroup) {
    throw new AppError("Party invite link is invalid.", 404, "PARTY_GROUP_INVITE_NOT_FOUND");
  }

  const character = await CharacterSheet.findOne({
    _id: options.characterSheetId,
    ownerId: options.ownerId,
    deletedAt: null
  }).exec();

  if (!character) {
    throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
  }

  if (character.partyGroupId) {
    if (character.partyGroupId.toString() === partyGroup.id) {
      throw new AppError("Character is already in this party.", 409, "CHARACTER_ALREADY_IN_PARTY");
    }

    throw new AppError(
      "Character already belongs to another party.",
      409,
      "CHARACTER_ALREADY_IN_PARTY"
    );
  }

  const claimedCharacter = await CharacterSheet.findOneAndUpdate(
    {
      _id: character._id,
      ownerId: options.ownerId,
      deletedAt: null,
      $or: [{ partyGroupId: null }, { partyGroupId: { $exists: false } }]
    },
    {
      $set: {
        partyGroupId: partyGroup._id
      }
    },
    {
      new: true
    }
  ).exec();

  if (!claimedCharacter) {
    const currentCharacter = await CharacterSheet.findOne({
      _id: character._id,
      ownerId: options.ownerId,
      deletedAt: null
    }).exec();

    if (currentCharacter?.partyGroupId?.toString() === partyGroup.id) {
      throw new AppError("Character is already in this party.", 409, "CHARACTER_ALREADY_IN_PARTY");
    }

    throw new AppError(
      "Character already belongs to another party.",
      409,
      "CHARACTER_ALREADY_IN_PARTY"
    );
  }

  const updatedPartyGroup = await PartyGroup.findOneAndUpdate(
    {
      _id: partyGroup._id,
      [`characterIds.${PARTY_GROUP_MAX_MEMBERS - 1}`]: { $exists: false },
      characterIds: { $ne: character._id }
    },
    {
      $addToSet: {
        characterIds: character._id
      }
    },
    {
      new: true
    }
  ).exec();

  if (!updatedPartyGroup) {
    await CharacterSheet.updateOne(
      {
        _id: character._id,
        partyGroupId: partyGroup._id
      },
      {
        $set: {
          partyGroupId: null
        }
      }
    ).exec();

    const currentPartyGroup = await PartyGroup.findById(partyGroup._id).lean().exec();

    if ((currentPartyGroup?.characterIds?.length ?? 0) >= PARTY_GROUP_MAX_MEMBERS) {
      throw new AppError("Party group is full.", 409, "PARTY_GROUP_FULL", {
        maxMembers: PARTY_GROUP_MAX_MEMBERS
      });
    }

    throw new AppError("Unable to join party group.", 409, "PARTY_GROUP_JOIN_CONFLICT");
  }

  return {
    partyGroup: toPartyGroupListRecord(updatedPartyGroup as PartyGroupDocument),
    membership: {
      characterId: claimedCharacter.id,
      partyGroupId: updatedPartyGroup.id,
      partyGroupName: updatedPartyGroup.name
    }
  };
}

export async function listCharacterPartyMemberships(ownerId: Types.ObjectId) {
  const characters = await CharacterSheet.find({
    ownerId,
    deletedAt: null,
    partyGroupId: { $ne: null }
  })
    .select("_id partyGroupId")
    .lean()
    .exec();
  const partyGroupIds = [
    ...new Set(
      characters
        .map((character) => character.partyGroupId?.toString())
        .filter((partyGroupId): partyGroupId is string => Boolean(partyGroupId))
    )
  ];
  const partyGroups = await PartyGroup.find({
    _id: { $in: partyGroupIds }
  })
    .select("_id name")
    .lean()
    .exec();
  const partyNameById = new Map(
    partyGroups.map((partyGroup) => [partyGroup._id.toString(), partyGroup.name])
  );

  return characters
    .map((character) => {
      const partyGroupId = character.partyGroupId?.toString();

      if (!partyGroupId) {
        return null;
      }

      return {
        characterId: character._id.toString(),
        partyGroupId,
        partyGroupName: partyNameById.get(partyGroupId) ?? "Party Group"
      };
    })
    .filter((membership): membership is NonNullable<typeof membership> => membership !== null);
}

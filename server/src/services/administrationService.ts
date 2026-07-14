import { Types, type FilterQuery, type SortOrder } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { User, type UserRecord } from "../models/User.js";
import type {
  AdministrationAssignableRole,
  AdministrationUser,
  AdministrationUserListQuery,
  AdministrationUserOrdering
} from "../types/administration.js";

export const ADMINISTRATION_USERS_PER_PAGE = 20;

type AdministrationUserRecord = Pick<
  UserRecord,
  "nickname" | "email" | "role" | "createdAt" | "lastInteractedAt"
> & {
  _id: Types.ObjectId;
};

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeAdministrationUser(user: AdministrationUserRecord): AdministrationUser {
  return {
    id: user._id.toString(),
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt?.toISOString() ?? null,
    lastActive: user.lastInteractedAt?.toISOString() ?? null
  };
}

function buildAdministrationUserFilter(search: string | undefined): FilterQuery<UserRecord> {
  if (!search) {
    return { emailVerifiedAt: { $ne: null } };
  }

  const searchPattern = new RegExp(escapeRegularExpression(search), "i");

  return {
    emailVerifiedAt: { $ne: null },
    $or: [{ nickname: searchPattern }, { email: searchPattern }]
  };
}

function buildAdministrationUserSort(ordering: AdministrationUserOrdering): [string, SortOrder][] {
  const isDescending = ordering.startsWith("-");
  const direction: SortOrder = isDescending ? -1 : 1;
  const field = ordering.replace(/^-/, "");
  const databaseField = field === "lastActive" ? "lastInteractedAt" : field;

  return [
    [databaseField, direction],
    ["_id", direction]
  ];
}

export async function listAdministrationUsers(query: AdministrationUserListQuery) {
  const filter = buildAdministrationUserFilter(query.search);
  const sort = buildAdministrationUserSort(query.ordering);
  const skip = (query.page - 1) * ADMINISTRATION_USERS_PER_PAGE;

  const [count, users] = await Promise.all([
    User.countDocuments(filter).exec(),
    User.find(filter)
      .select("_id nickname email role createdAt lastInteractedAt")
      .collation({ locale: "en", strength: 2 })
      .sort(sort)
      .skip(skip)
      .limit(ADMINISTRATION_USERS_PER_PAGE)
      .lean<AdministrationUserRecord[]>()
      .exec()
  ]);

  return {
    count,
    page: query.page,
    limit: ADMINISTRATION_USERS_PER_PAGE,
    results: users.map(serializeAdministrationUser)
  };
}

export async function updateAdministrationUserRole(
  userId: string,
  role: AdministrationAssignableRole
): Promise<AdministrationUser> {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new AppError("User id is invalid.", 400, "INVALID_USER_ID");
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      role: { $in: ["user", "keeper"] }
    },
    {
      $set: { role }
    },
    {
      new: true,
      runValidators: true
    }
  )
    .select("_id nickname email role createdAt lastInteractedAt")
    .lean<AdministrationUserRecord | null>()
    .exec();

  if (updatedUser) {
    return serializeAdministrationUser(updatedUser);
  }

  const existingUser = await User.findById(userId)
    .select("_id role")
    .lean<{ role: UserRecord["role"] } | null>()
    .exec();

  if (!existingUser) {
    throw new AppError("User was not found.", 404, "USER_NOT_FOUND");
  }

  if (existingUser.role === "admin") {
    throw new AppError("Admin roles cannot be changed.", 403, "ADMIN_ROLE_PROTECTED");
  }

  throw new AppError(
    "The user role changed before this update completed.",
    409,
    "USER_ROLE_UPDATE_CONFLICT"
  );
}

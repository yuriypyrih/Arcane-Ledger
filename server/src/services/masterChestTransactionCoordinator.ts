import { supportsMongoTransactions } from "../config/database.js";
import {
  executeStandaloneMasterChestTransaction,
  hasPendingStandaloneMasterChestOperations
} from "./masterChestStandaloneTransactionService.js";
import {
  executeAtomicMasterChestTransaction,
  type MasterChestTransactionRequest
} from "./masterChestTransactionService.js";
import type { Types } from "mongoose";

type MasterChestTransactionOptions = {
  actorNickname: string;
  actorUserId: Types.ObjectId;
  partyGroupId: string;
  request: MasterChestTransactionRequest;
};

export async function executeMasterChestTransaction(options: MasterChestTransactionOptions) {
  if (
    supportsMongoTransactions() &&
    !(await hasPendingStandaloneMasterChestOperations(options.partyGroupId))
  ) {
    return executeAtomicMasterChestTransaction(options);
  }

  return executeStandaloneMasterChestTransaction(options);
}

import { disconnectFromDatabase, connectToDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { DEFAULT_USER_NICKNAME } from "../services/authNicknameService.js";

async function backfillUserNicknames() {
  await connectToDatabase();

  const result = await User.updateMany(
    {
      $or: [
        { nickname: { $exists: false } },
        { nickname: null },
        { nickname: "" },
        { nickname: { $regex: /^\s*$/ } }
      ]
    },
    {
      $set: {
        nickname: DEFAULT_USER_NICKNAME
      }
    }
  );

  console.log(
    `Backfilled user nicknames for ${result.modifiedCount} of ${result.matchedCount} matched users.`
  );
}

void backfillUserNicknames()
  .catch((error: unknown) => {
    console.error("Failed to backfill user nicknames.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });

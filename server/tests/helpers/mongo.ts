import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToDatabase, disconnectFromDatabase } from "../../src/config/database.js";

let mongoServer: MongoMemoryServer | null = null;

export async function connectTestDatabase(dbName = "dnd_companion_test") {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.DB_NAME = dbName;
  await connectToDatabase();
  return mongoServer;
}

export async function clearTestDatabase() {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
  );
}

export async function disconnectTestDatabase() {
  await disconnectFromDatabase();

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

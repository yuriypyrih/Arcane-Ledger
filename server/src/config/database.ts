import mongoose from "mongoose";
import { requireMongoConfig } from "./env.js";

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { mongodbUri, dbName } = requireMongoConfig();

  await mongoose.connect(mongodbUri, {
    dbName
  });

  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}

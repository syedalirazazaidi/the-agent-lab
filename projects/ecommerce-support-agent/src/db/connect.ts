import { MongoClient } from "mongodb";
import { config } from "../config/env";

const client = new MongoClient(config.mongoUri);

export async function connectMongo() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
    return client.db(config.dbName);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

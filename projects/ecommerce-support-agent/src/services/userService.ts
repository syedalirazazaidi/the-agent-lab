import { Db, ObjectId } from "mongodb";
import type { User } from "../models/userModel";

type UserInsert = Omit<User, "_id"> & { _id?: ObjectId };

export async function createUser(db: Db, user: UserInsert) {
  const users = db.collection("users");
  const document: UserInsert = {
    ...user,
    _id: user._id ?? new ObjectId(),
  };

  const result = await users.insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function getUsers(db: Db) {
  const users = db.collection("users");
  return await users.find({}).toArray();
}

export async function getUserByEmail(db: Db, email: string) {
  const users = db.collection("users");
  return await users.findOne({ email });
}

export async function getUsersByRole(db: Db, role: "buyer" | "seller" | "admin") {
  const users = db.collection("users");
  return await users.find({ role }).toArray();
}

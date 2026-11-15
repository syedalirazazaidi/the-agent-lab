import type { ObjectId } from "mongodb";

export type UserRole = "buyer" | "seller" | "admin";

export type User = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
};

export const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
  createdAt: { type: Date, default: Date.now },
};

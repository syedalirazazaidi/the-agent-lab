import type { ObjectId } from "mongodb";

export type Product = {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  sellerId: ObjectId | string;
  createdAt: Date;
};

export const productSchema = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  sellerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
};

import { Db, ObjectId } from "mongodb";
import type { Product } from "../models/productModel";

type ProductInsert = Omit<Product, "_id"> & { _id?: ObjectId };

export async function createProduct(db: Db, product: ProductInsert) {
  const products = db.collection("products");
  const document: ProductInsert = {
    ...product,
    _id: product._id ?? new ObjectId(),
  };

  const result = await products.insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function getProducts(db: Db) {
  const products = db.collection("products");
  return await products.find({}).toArray();
}

export async function getProductsBySeller(db: Db, sellerId: string) {
  const products = db.collection("products");
  return await products.find({ sellerId }).toArray();
}

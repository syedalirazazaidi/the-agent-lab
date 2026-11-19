import { MongoClient } from "mongodb";
import { config } from "./config/env";

const products = [
  {
    name: "Laptop",
    description: "A fast laptop for work and study",
    price: 1200,
    stock: 10,
    sellerId: "seller_123",
  },
  {
    name: "Wireless Mouse",
    description: "A comfortable wireless mouse",
    price: 25,
    stock: 50,
    sellerId: "seller_123",
  },
  {
    name: "Mechanical Keyboard",
    description: "A keyboard with tactile switches",
    price: 75,
    stock: 30,
    sellerId: "seller_456",
  },
  {
    name: "Smartphone",
    description: "A new smartphone with a sharp display",
    price: 699,
    stock: 20,
    sellerId: "seller_456",
  },
  {
    name: "Headphones",
    description: "Wireless headphones with clear sound",
    price: 150,
    stock: 25,
    sellerId: "seller_123",
  },
];

async function seedProducts() {
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("products");

    await collection.createIndex({ name: 1 }, { unique: true });

    const operations = products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: {
          $set: {
            ...product,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);

    console.log("Products seeded successfully");
    console.log({
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedProducts();

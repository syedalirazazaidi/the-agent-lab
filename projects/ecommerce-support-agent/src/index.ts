import express from "express";
import { config } from "./config/env";
import { connectMongo } from "./db/connect";
import { createUser, getUsersByRole } from "./services/userService";
import { createProduct, getProducts, getProductsBySeller } from "./services/productService";

const app = express();
app.use(express.json());

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/users", async (req, res) => {
  try {
    const db = await connectMongo();
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please send name, email, password, and role" });
    }

    const newUser = await createUser(db, {
      name,
      email,
      password,
      role,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
});

app.get("/users/:role", async (req, res) => {
  try {
    const db = await connectMongo();
    const role = req.params.role as "buyer" | "seller" | "admin";

    const users = await getUsersByRole(db, role);
    res.json({ role, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

app.post("/products", async (req, res) => {
  try {
    const db = await connectMongo();
    const { name, description, price, stock, sellerId } = req.body;

    if (!name || !description || !price || !stock || !sellerId) {
      return res.status(400).json({
        message: "Please send name, description, price, stock, and sellerId",
      });
    }

    const newProduct = await createProduct(db, {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      sellerId,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
});

app.get("/products", async (req, res) => {
  try {
    const db = await connectMongo();
    const products = await getProducts(db);

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

app.get("/products/:sellerId", async (req, res) => {
  try {
    const db = await connectMongo();
    const { sellerId } = req.params;

    const products = await getProductsBySeller(db, sellerId);
    res.json({ sellerId, products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

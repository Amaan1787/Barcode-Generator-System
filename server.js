const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// MongoDB connection (we'll set this up later)
const MONGODB_URL =
  "mongodb+srv://admin:admin@hospital-cluster.91dwrdy.mongodb.net/?appName=hospital-cluster";
const DB_NAME = "clothingshop";
let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URL)
  .then((client) => {
    console.log("✅ Connected to MongoDB");
    db = client.db(DB_NAME);
  })
  .catch((error) => {
    console.log("❌ MongoDB connection error:", error);
    console.log("💡 We will install MongoDB in the next step");
  });

// Generate unique barcode
function generateBarcode() {
  return "CLO" + Date.now();
}

// API Route: Add new product
app.post("/add-product", async (req, res) => {
  try {
    const { name, category, brand, price, stock } = req.body;

    const product = {
      name,
      category,
      brand,
      price: parseFloat(price),
      stock: parseInt(stock),
      barcode: generateBarcode(),
      createdAt: new Date(),
    };

    await db.collection("products").insertOne(product);

    res.json({
      success: true,
      message: "Product added successfully",
      barcode: product.barcode,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// API Route: Search product by barcode
app.get("/search/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await db.collection("products").findOne({ barcode });

    if (product) {
      res.json({ success: true, product });
    } else {
      res.json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// API Route: Get all products
app.get("/all-products", async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend.html");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("📖 Open your browser and go to: http://localhost:3000");
  console.log("🛑 Press Ctrl+C to stop the server");
});

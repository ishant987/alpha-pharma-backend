const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./src/models/Product");

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

app.post("/verify", async (req, res) => {
  try {
    const token = req.body?.token?.trim();
    const code = req.body?.code?.trim();
    const serial = req.body?.serial?.trim();
    const mfg = req.body?.mfg?.trim();

    let product = null;

    if (token) {
      product = await Product.findOne({ token });
    } else if (code && serial && mfg) {
      product = await Product.findOne({ code, serial, mfg });
    } else {
      return res.json({ status: "fail" });
    }

    if (!product) {
      return res.json({ status: "fail" });
    }

    if (product.verified === true) {
      return res.json({
        status: "duplicate",
        productName: product.name,
        verifiedAt: product.verifiedAt,
      });
    }

    product.verified = true;
    product.verifiedAt = new Date();
    await product.save();

    return res.json({
      status: "success",
      productName: product.name,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ status: "fail" });
  }
});

app.get("/", (req, res) => {
  res.send("Alpha Pharma verification API is running.");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

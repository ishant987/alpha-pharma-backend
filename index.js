const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ===================== PRODUCT DATABASE =====================
const PRODUCTS = [
    { serial: "SN1001", code: "ALPHA123", mfg: "02/2022 or before", name: "Astralean 40mcg - 50 tablets", token: "01" },
    { serial: "SN1002", code: "BRAVO457", mfg: "02/2022 or before", name: "Cardioplus 10mg - 30 tablets", token: "02" },
    { serial: "SN1003", code: "CHARLIE892", mfg: "02/2022 or before", name: "Neurovita B12 - 60 capsules", token: "03" },
    { serial: "SN1004", code: "DELTA310", mfg: "02/2022 or before", name: "GastroCare 20mg - 15 tablets", token: "04" },
    { serial: "SN1005", code: "ECHO765", mfg: "02/2022 or before", name: "ImmunoShield C - 100 tablets", token: "05" },
    { serial: "SN1006", code: "FOXTROT221", mfg: "02/2022 or before", name: "PainRelief XR 500mg - 10 tablets", token: "06" },
    { serial: "SN1007", code: "GOLF908", mfg: "02/2022 or before", name: "RespiraClear 5mg - 20 tablets", token: "07" },
    { serial: "SN1008", code: "HOTEL634", mfg: "02/2022 or before", name: "Dermacalm Lotion - 100ml", token: "08" },
    { serial: "SN1009", code: "INDIA519", mfg: "02/2022 or before", name: "OcuVision Plus - 30 softgels", token: "09" },
    { serial: "SN1010", code: "JULIET842", mfg: "02/2022 or before", name: "VitaBoost Zinc - 90 tablets", token: "10" },
    { serial: "SN1011", code: "BETA456", mfg: "03/2022 or after", name: "Alphabol 10mg - 50 tablets", token: "11" },
    { serial: "SN1012", code: "LIMA204", mfg: "03/2022 or after", name: "GlucoGuard 500mg - 30 tablets", token: "12" },
    { serial: "SN1013", code: "MIKE639", mfg: "03/2022 or after", name: "NeuroCalm 25mg - 15 tablets", token: "13" },
    { serial: "SN1014", code: "NOVEMBER115", mfg: "03/2022 or after", name: "HeartSafe 75mg - 14 tablets", token: "014" },
    { serial: "SN1015", code: "OSCAR903", mfg: "03/2022 or after", name: "AllerFree 5mg - 10 tablets", token: "15" },
    { serial: "SN1016", code: "PAPA472", mfg: "03/2022 or after", name: "VitaD3 Max - 8 capsules", token: "16" },
    { serial: "SN1017", code: "QUEBEC388", mfg: "03/2022 or after", name: "LiverCare Forte - 60 tablets", token: "17" },
    { serial: "SN1018", code: "ROMEO726", mfg: "03/2022 or after", name: "RespiraAid Syrup - 100ml", token: "18" },
    { serial: "SN1019", code: "SIERRA550", mfg: "03/2022 or after", name: "PainBlock Gel - 30g", token: "19" },
];

// ===================== MONGOOSE SCHEMA =====================
const verificationSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now },
});

const Verification = mongoose.model("Verification", verificationSchema);

// ===================== HELPER: build lookup key =====================
const makeKey = (product) => {
    const code = product.code.trim().toUpperCase();
    const mfg = product.mfg.trim();
    if (mfg === "03/2022 or after") return `auth_${code}_${mfg}`;
    const serial = product.serial.trim().toUpperCase();
    return `auth_${code}_${serial}_${mfg}`;
};

// ===================== HELPER: find product =====================
const findProduct = ({ token, code, serial, mfg }) => {
    if (token) {
        return PRODUCTS.find((p) => p.token === token.trim());
    }
    const cleanCode = (code || "").trim().toUpperCase();
    const cleanSerial = (serial || "").trim().toUpperCase();
    const cleanMfg = (mfg || "").trim();

    return PRODUCTS.find((p) => {
        const serialRequired = p.mfg !== "03/2022 or after";
        return (
            p.code.toUpperCase() === cleanCode &&
            p.mfg === cleanMfg &&
            (serialRequired ? p.serial.toUpperCase() === cleanSerial : true)
        );
    });
};

// ===================== VERIFY ENDPOINT =====================
app.post("/verify", async (req, res) => {
    try {
        const { token, code, serial, mfg } = req.body;

        const product = findProduct({ token, code, serial, mfg });

        if (!product) {
            return res.json({ status: "fail" });
        }

        const key = makeKey(product);

        const existing = await Verification.findOne({ key });

        if (existing) {
            return res.json({
                status: "duplicate",
                productName: existing.productName,
                verifiedAt: existing.verifiedAt,
            });
        }

        const record = new Verification({ key, productName: product.name });
        await record.save();

        return res.json({ status: "success", productName: product.name });

    } catch (err) {
        console.error("Verify error:", err);
        return res.status(500).json({ status: "fail", error: "Server error" });
    }
});

// ===================== HEALTH CHECK =====================
app.get("/", (req, res) => res.send("Alpha Pharma verification API is running."));

// ===================== START =====================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT || 5000, () =>
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        );
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
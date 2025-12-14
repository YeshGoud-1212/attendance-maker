import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { getAttendance } from "./attendance.js";
import {
    calculateRemainingClasses,
    calculateBunksAndReachability,
    simulateBunk
} from "./bunkCalculator.js";

const app = express();

// -------- MongoDB Connection --------
mongoose.connect(process.env.DB_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// -------- User Config Schema --------
const userConfigSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    semesterEnd: { type: String, required: true },
    timetable: {
        Mon: Number,
        Tue: Number,
        Wed: Number,
        Thu: Number,
        Fri: Number,
        Sat: Number,
        Sun: Number
    },
    holidays: [String],
    targetPercent: { type: Number, default: 75 },
    simulate: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const UserConfig = mongoose.model("UserConfig", userConfigSchema);

// -------- CORS --------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(o => o.trim());

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Postman, curl

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));


app.use(express.json());

// -------- FETCH ATTENDANCE (LOGIN) --------
app.post("/fetch-attendance", async (req, res) => {
    try {
        console.log("🔵 /fetch-attendance HIT");

        const { username, password } = req.body;

        // Fetch attendance data from ERP
        const data = await getAttendance(username, password);

        const { pastAttended, pastTotal, studentId, subjects } = data;

        res.json({
            studentId,
            pastAttended,
            pastTotal,
            subjects,
            currentAttendance: ((pastAttended / pastTotal) * 100).toFixed(2)
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// -------- GET SAVED CONFIG --------
app.get("/get-config/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const config = await UserConfig.findOne({ username });
        
        if (config) {
            res.json({ config });
        } else {
            res.json({ config: null });
        }
    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// -------- SAVE CONFIG & CALCULATE --------
app.post("/save-config", async (req, res) => {
    try {
        console.log("🔵 /save-config HIT");

        const {
            username,
            password,
            semesterEnd,
            timetable,
            holidays = [],
            targetPercent = 75,
            simulate = 0
        } = req.body;

        // Save/Update config in MongoDB
        await UserConfig.findOneAndUpdate(
            { username },
            {
                username,
                semesterEnd,
                timetable,
                holidays,
                targetPercent,
                simulate,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        // Fetch fresh attendance data
        const data = await getAttendance(username, password);
        const { pastAttended, pastTotal, studentId, subjects } = data;

        // Calculate remaining classes
        const { remainingClasses, startDate } =
            calculateRemainingClasses(timetable, semesterEnd, holidays);

        // Calculate bunkable classes and reachability
        const result = calculateBunksAndReachability({
            pastAttended,
            pastTotal,
            remainingClasses,
            targetPercent
        });

        // Simulate bunking if requested
        const simulation = simulate > 0
            ? simulateBunk(pastAttended, pastTotal, remainingClasses, simulate)
            : null;

        res.json({
            studentId,
            pastAttended,
            pastTotal,
            subjects,
            remainingClasses,
            startDate,
            ...result,
            simulatedAttendance: simulation
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// -------- START SERVER --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

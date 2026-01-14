const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect to DB
const connectDB = require("./config/db");
connectDB();

// Init app
const app = express();

// ===== MIDDLEWARE (ONLY ONCE) =====
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    /\.vercel\.app$/,  // Accept any Vercel subdomain
    process.env.FRONTEND_URL || ""  // Accept custom domain from env
  ],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ===== ROUTES =====

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Test routes
const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);

// Student routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

// Batch routes
const batchRoutes = require("./routes/batchRoutes");
app.use("/api/batches", batchRoutes);

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Fee routes
const feeRoutes = require("./routes/feeRoutes");
app.use("/api/fees", feeRoutes);

// Dashboard routes
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Test/Score routes
const testScoreRoutes = require("./routes/testRoutes");
app.use("/api/tests", testScoreRoutes);

// Parent routes
const parentRoutes = require("./routes/parentRoutes");
app.use("/api/parents", parentRoutes);

// Announcement routes
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);

// Credential routes
const credentialRoutes = require("./routes/credentialRoutes");
app.use("/api/credentials", credentialRoutes);

// Coaching config routes
const coachingConfigRoutes = require("./routes/coachingConfigRoutes");
app.use("/api/coaching", coachingConfigRoutes);

// Test root route
app.get("/", (req, res) => {
  res.send("Coaching Management System API is running...");
});

// ===== SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

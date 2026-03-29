const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { swaggerUi, swaggerSpec } = require("./swagger");

// Load environment variables from .env file
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const initAdmin = require("./config/initAdmin");

// Connect to MongoDB Atlas using connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("✅ Connected to MongoDB Atlas");
   // Call admin init logic
  await initAdmin();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : "missing",
});

app.get("/test-open", (req, res) => {
  res.send("OPEN OK");
});

// Use JSON parser middleware
app.use(express.json());

//test routes


// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // added by me

// Use /api/auth for all auth-related routes
const userRoutes = require("./routes/userRoutes"); // <- you'll create this soon
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/PrescriptionRoutes');
const reportRoutes = require('./routes/LabreportsRoutes');
const medicineReminderRoutes = require('./routes/medicineReminderRoutes');

// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // protected routes
app.use("/api/admin", adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminder", medicineReminderRoutes);
app.use("/tmp", express.static("/tmp"));
// Export app for use in server.js

// ✅ ADD THIS before module.exports = app;
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.message);
  console.error("❌ Stack:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;


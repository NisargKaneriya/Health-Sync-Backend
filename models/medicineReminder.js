// models/MedicineReminder.js
const mongoose = require("mongoose");

const medicineReminder = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String }, // optional
  reminderTimes: [{ type: String }], // ["08:00", "14:00"]
  startDate: { type: String, required: true }, // "2026-03-28"
  endDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicineReminder", medicineReminder);
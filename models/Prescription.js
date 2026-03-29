// models/Prescription.js
const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorName: { type: String, required: true }, // Store doctor's name
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  prescription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);

// controllers/prescriptionController.js
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const user = require("../models/User");
const mongoose = require("mongoose");

class PrescriptionController {
  // Add Prescription
  async addPrescription(req, res) {
    try {
      const { doctorId, appointmentId, prescription } = req.body;

      // Validate appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      const doctor = await user.findById(doctorId);
      if (!doctor || doctor.role !== 'D') {
        return res.status(400).json({ success: false, message: "Invalid doctor" });
      }

      const patient = await user.findById(appointment.patientId);
      if (!patient || patient.role !== 'U') {
        return res.status(400).json({ success: false, message: "Invalid Patient" });
      }

      // Create prescription
      const newPrescription = new Prescription({
        doctorId,
        patientId: appointment.patientId,
        doctorName: doctor.name,
        patientName: patient.name, 
        appointmentId,
        prescription
      });

      await newPrescription.save();

      res.status(201).json({ success: true, message: "Prescription added successfully", data: newPrescription });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Get prescriptions by doctor
//   async getPrescriptionsByDoctorId(req, res) {
//   try {
//     // const { doctorId } = req.params;
//         if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: No user data' });
//     }

//     const doctorId = req.user.id;
//     // Find prescriptions by doctorId
//     const prescriptions = await Prescription.find({ doctorId }).populate("appointmentId");

//     if (!prescriptions || prescriptions.length === 0) {
//       return res.status(404).json({ message: "No prescriptions found for this doctor" });
//     }

//     res.status(200).json(prescriptions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
async getPrescriptionsByDoctorId(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user data"
      });
    }

    const doctorId = new mongoose.Types.ObjectId(req.user.id);

    const prescriptions = await Prescription.find({ doctorId })
      .populate("appointmentId")
      .populate("patientId")   // optional but useful
      .populate("doctorId");   // optional

    if (!prescriptions.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No prescriptions found for this doctor"
      });
    }

    res.status(200).json({
      success: true,
      data: prescriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

//   async getPrescriptionsByPatient(req, res) {
//   try {
//     const { patientId } = req.params;
//      const prescriptions = await Prescription.find({ patientId })
//         .populate("doctorId")  // Populate doctor information from User model
//         .populate("patientId")  // Populate patient information from User model
//         .populate("appointmentId");  // Optionally, you can populate appointmentId if needed

//     if (!prescriptions.length) {
//       return res.status(404).json({ success: false, message: "No prescriptions found" });
//     }
//     res.status(200).json({ success: true, data: prescriptions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// }
async getPrescriptionsByPatient(req, res) {
  try {
    // const { patientId } = req.params;
        if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user data' });
    }

    const patientId = req.user.id;
    const prescriptions = await Prescription.find({
      patientId: new mongoose.Types.ObjectId(patientId)
    })
      .populate("doctorId")
      .populate("patientId")
      .populate("appointmentId");

    if (!prescriptions.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No prescriptions found"
      });
    }

    res.status(200).json({ success: true, data: prescriptions });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
}

module.exports = new PrescriptionController();

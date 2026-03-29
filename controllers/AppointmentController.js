// controllers/AppointmentController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const sendNotification = require("../services/sendNotification");

// Book Appointment
// const bookAppointment = async (req, res) => {
//   try { 
//     const { patientId, patientName, doctorId, date, timeSlot } = req.body;

//     // Check if slot is already booked
//     const existing = await Appointment.findOne({
//       doctorId,
//       date,
//       timeSlot,
//       status: { $ne: 'cancelled' } // exclude cancelled appointments
//     });

//     if (existing) {
//       return res.status(409).json({ message: 'Slot already booked. Please choose another.' });
//     }

//     const appointment = new Appointment({
//       patientId,
//       patientName,
//       doctorId,
//       date,
//       timeSlot,
//       status: "Booked"
//     });

//     await appointment.save();

//     res.status(201).json({ message: 'Appointment booked successfully', appointment });
//   } catch (err) {
//     res.status(500).json({ message: 'Booking failed', error: err.message });
//   }
// };

const bookAppointment = async (req, res) => {
  try {
    // 🔐 Get patientId from token
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user data' });
    }

    const patientId = req.user.id;

    const { patientName, doctorId, date, timeSlot } = req.body;

    // 🔹 Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctorId' });
    }

    // 🔹 Fetch users
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
    }

    // 🔹 Role validation
    if (patient.role !== 'U') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    if (doctor.role !== 'D') {
      return res.status(400).json({ message: 'No Such Doctor Present' });
    }

    // 🔹 Check slot
    const existing = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (existing) {
      return res.status(409).json({ message: 'Slot already booked' });
    }

    // 🔹 Create appointment
    const appointment = new Appointment({
      patientId,
      patientName,
      doctorId,
      date,
      timeSlot,
      status: "Booked"
    });

    await appointment.save();
     // 🔔 Notify Patient
    await sendNotification(
      patient.fcmToken,
      "Appointment Confirmed",
      `Your appointment is booked on ${date} at ${timeSlot}`
    );

    // 🔔 Notify Doctor
    await sendNotification(
      doctor.fcmToken,
      "New Appointment",
      `New patient ${patientName} booked appointment`
    );
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

   

  } catch (err) {
    res.status(500).json({
      message: 'Booking failed',
      error: err.message
    });
  }
};

module.exports = { bookAppointment };
// Cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();
           // 🔔 Notify Patient
    await sendNotification(
      patient.fcmToken,
      "Appointment Cancelled",
      "Your appointment has been cancelled"
    );

    // 🔔 Notify Doctor
    await sendNotification(
      doctor.fcmToken,
      "Appointment Cancelled",
      "A patient cancelled the appointment"
    );
    res.status(200).json({ message: 'Appointment cancelled', appointment });

  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
};

// Reschedule Appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId, newDate, newTimeSlot } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if new slot is available
    const isBooked = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (isBooked) {
      return res.status(409).json({ message: 'New time slot already booked. Choose another.' });
    }

    // Optional: Only allow reschedule before 1 hour of original appointment
    const originalTime = new Date(`${appointment.date}T${appointment.timeSlot}`);
    const now = new Date();
    const diffMinutes = (originalTime - now) / (1000 * 60);

    if (diffMinutes < 60) {
      return res.status(400).json({ message: 'Reschedule not allowed within 1 hour of appointment' });
    }

    appointment.date = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'Rescheduled';
    await appointment.save();
        // 🔔 Notify Patient
    await sendNotification(
      patient.fcmToken,
      "Appointment Rescheduled",
      `New time: ${newDate} at ${newTimeSlot}`
    );

    // 🔔 Notify Doctor
    await sendNotification(
      doctor.fcmToken,
      "Appointment Updated",
      "Appointment has been rescheduled"
    );
    res.status(200).json({ message: 'Appointment rescheduled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Reschedule failed', error: err.message });
  }
};

// Get Appointments by User
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await Appointment.find({ patientId: userId })
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization phone')   // Populate doctor details
      .populate('patientId', 'name');                      // (Optional) Populate patient name

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

// Get Appointments by Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId  = req.user.id;


    const query = { doctorId };

    const appointments = await Appointment.find(query).sort({ timeSlot: 1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor appointments', error: err.message });
  }
};

// Get Doctor Dashboard Statistics
const getDoctorDashboardStats = async (req, res) => {
  try {
    // const { doctorId } = req.params;
    const doctorId = req.user.id;

    const today = new Date().toISOString().split("T")[0];

    // Total Appointments
    const totalAppointments = await Appointment.countDocuments({
      doctorId: doctorId
    });

    // Today's Appointments
    const todaysAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      date: today,
      status: { $ne: "Cancelled" }
    });

    // Cancelled Appointments
    const cancelledAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      status: "Cancelled"
    });

    res.status(200).json({
      doctorId,
      totalAppointments,
      todaysAppointments,
      cancelledAppointments
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message
    });
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getDoctorDashboardStats
};

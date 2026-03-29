const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/AppointmentController');
const auth = "../middlewares/authMiddleware";
// Auth middlewares
const authenticate = require(auth);
// const authenticate = require("../middlewares/authenticateMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
// Routes
/**
 * @swagger
 * /api/appointments/book:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - patientName
 *               - doctorId
 *               - date
 *               - timeSlot
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: 65cfa91c1a2b3c4d5e6f1111
 *               patientName:
 *                 type: string
 *                 example: John Doe
 *               doctorId:
 *                 type: string
 *                 example: 65cfa91c1a2b3c4d5e6f2222
 *               date:
 *                 type: string
 *                 example: "2026-02-10"
 *               timeSlot:
 *                 type: string
 *                 example: "10:00"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment booked successfully
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       409:
 *         description: Slot already booked
 *       500:
 *         description: Server error
 */
// router.post('/book', appointmentController.bookAppointment);
router.post('/book', authenticate,appointmentController.bookAppointment);

/**
 * @swagger
 * /api/appointments/cancel:
 *   post:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 example: 65cfa91c1a2b3c4d5e6f7890
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment cancelled
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/cancel', appointmentController.cancelAppointment);

/**
 * @swagger
 * /api/appointments/reschedule:
 *   post:
 *     summary: Reschedule an appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - newDate
 *               - newTimeSlot
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 example: 65cfa91c1a2b3c4d5e6f7890
 *               newDate:
 *                 type: string
 *                 example: "2026-02-12"
 *               newTimeSlot:
 *                 type: string
 *                 example: "11:00"
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Reschedule not allowed within 1 hour
 *       409:
 *         description: Time slot already booked
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/reschedule', appointmentController.rescheduleAppointment);

/**
 * @swagger
 * /api/appointments/user/{userId}:
 *   get:
 *     summary: Get appointments for a patient
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65cfa91c1a2b3c4d5e6f1111
 *     responses:
 *       200:
 *         description: List of patient appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Server error
 */
router.get('/user/', authenticate,appointmentController.getUserAppointments);

/**
 * @swagger
 * /api/appointments/doctor:
 *   get:
 *     summary: Get appointments for a doctor
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65cfa91c1a2b3c4d5e6f2222
 *     responses:
 *       200:
 *         description: Doctor appointment list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Server error
 */
router.get('/doctor',authenticate, appointmentController.getDoctorAppointments); // ?doctorId=123&date=2025-07-28

router.get("/doctor/dashboard",authenticate,authorizeRoles("D"),appointmentController.getDoctorDashboardStats);

module.exports = router;
    
// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/PrescriptionController");
const newLocal = "../middlewares/authMiddleware";
const authenticate = require(newLocal);



// POST: Add new prescription
/**
 * @swagger
 * /api/prescriptions/addPrescription:
 *   post:
 *     summary: Add a prescription for an appointment
 *     tags: [Prescriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - appointmentId
 *               - prescription
 *             properties:
 *               doctorId:
 *                 type: string
 *                 example: 65cfa91c1a2b3c4d5e6f2222
 *               appointmentId:
 *                 type: string
 *                 example: 65d09c3e8a2f3b001234abcd
 *               prescription:
 *                 type: string
 *                 example: Take Amoxicillin 500mg twice daily for 5 days
 *     responses:
 *       201:
 *         description: Prescription added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Prescription added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Invalid doctor or patient
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.post("/addPrescription", prescriptionController.addPrescription);

/**
 * @swagger
 * /api/prescriptions/doctor/{doctorId}:
 *   get:
 *     summary: Get prescriptions written by a doctor
 *     tags: [Prescriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65cfa91c1a2b3c4d5e6f2222
 *     responses:
 *       200:
 *         description: List of prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: No prescriptions found for this doctor
 *       500:
 *         description: Internal server error
 */
router.get("/doctor", authenticate, prescriptionController.getPrescriptionsByDoctorId);

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}/prescriptions:
 *   get:
 *     summary: Get prescriptions for a patient
 *     tags: [Prescriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65cfa91c1a2b3c4d5e6f1111
 *     responses:
 *       200:
 *         description: Prescriptions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: No prescriptions found
 *       500:
 *         description: Internal server error
 */
router.get("/patient", authenticate, prescriptionController.getPrescriptionsByPatient);

module.exports = router;

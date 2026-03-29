const express = require("express");
const router = express.Router();

const newLocal = "../middlewares/authMiddleware";
// Import JWT auth middleware
const authenticate = require(newLocal);
// Import role-checking middleware
const authorizeRoles = require("../middlewares/roleMiddleware");
// Import the User model to fetch user info from DB
const User = require("../models/User");
const AdminController = require("../controllers/AdminController");
const UserController = require("../controllers/UserController");

// ✅ GET /api/users/me - returns current user's profile
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile fetched successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    // Step 1: Get user ID from JWT decoded data (injected by middleware)
    const userId = req.user.id;

    // Step 2: Find user in DB (exclude password for security)
    const user = await User.findById(userId).select("-password");

    // Step 3: If not found, return 404
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 4: Send user profile
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Example Admin-only route
/**
 * @swagger
 * /api/users/admin-only:
 *   get:
 *     summary: Admin-only test route
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access successful
 *         content:
 *           application/json:
 *             example:
 *               message: Welcome, Admin!
 *       403:
 *         description: Forbidden
 */
router.get("/admin-only", authenticate, authorizeRoles("A"), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

/**
 * @swagger
 * /api/users/add-doctor:
 *   post:
 *     summary: Add a new doctor (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - specialization
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Doctor added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/add-doctor", authenticate, authorizeRoles("A"), AdminController.addDoctor);

/**
 * @swagger
 * /api/users/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   specialization:
 *                     type: string
 *                   phone:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/doctors', UserController.getDoctors);

/**
 * @swagger
 * /api/users/prescriptions/{userId}:
 *   get:
 *     summary: Get prescriptions for a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescriptions fetched successfully
 *       404:
 *         description: No prescriptions found
 *       500:
 *         description: Server error
 */
router.get('/prescriptions/:userId', UserController.getPrescriptionsByUser);

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users (patients)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get("/all", UserController.getAllUsers);

/**
 * @swagger
 * /api/users/getUserById/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/getUserById/:id", UserController.getProfileById);

/**
 * @swagger
 * /api/users/updateDetails/{id}:
 *   put:
 *     summary: Update user profile details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/updateDetails/:id", UserController.updateProfile);

router.get("/doctor-patients", authenticate, authorizeRoles("D"),UserController.getDoctorPatients);

router.delete("/delete/:userId", authenticate, authorizeRoles("A"), UserController.deleteUser);
router.patch("/status/:userId", authenticate, authorizeRoles("A"), UserController.updateUserStatus);

module.exports = router;

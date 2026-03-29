// routes/reportRoutes.js
// const express = require("express");
// const multer = require("multer");
// const ReportController = require("../controllers/LabreportsController");

// const router = express.Router();

// // Multer setup (store in uploads folder)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // unique file name
//   }
// });     

// const upload = multer({ storage: storage });

// // Upload API
// router.post("/upload", upload.single("report"), ReportController.uploadReport);
// router.get("/reports",ReportController.getLabReports);
// module.exports = router;

// routes/reportRoutes.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const ReportController = require("../controllers/LabreportsController");
const newLocal = "../middlewares/authMiddleware";
const authenticate = require(newLocal);

const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Reports
//  *   description: Lab report APIs
//  */

// // Configure cloudinary (keep credentials in .env)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer storage directly to cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "health-sync/reports", // optional folder in Cloudinary
//     allowed_formats: ["jpg", "png", "pdf"], // restrict types
//     public_id: (req, file) => Date.now() + "-" + file.originalname,
//   },
// });

// const upload = multer({ storage });

// // Upload API
// /**
//  * @swagger
//  * /api/reports/upload:
//  *   post:
//  *     summary: Upload a lab report for a user
//  *     tags: [Reports]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *               - doctorId
//  *               - report
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 example: 65cfa91c1a2b3c4d5e6f1111
//  *               doctorId:
//  *                 type: string
//  *                 example: 65cfa91c1a2b3c4d5e6f2222
//  *               report:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       201:
//  *         description: Report uploaded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Report uploaded successfully
//  *                 data:
//  *                   $ref: '#/components/schemas/Report'
//  *       400:
//  *         description: No file uploaded or missing parameters
//  *       404:
//  *         description: User or Doctor not found
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/upload", authenticate,upload.single("report"), ReportController.uploadReport);

// /**
//  * @swagger
//  * /api/reports/reports:
//  *   post:
//  *     summary: Get lab reports by role (User or Doctor)
//  *     tags: [Reports]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - id
//  *               - role
//  *             properties:
//  *               id:
//  *                 type: string
//  *                 example: 65cfa91c1a2b3c4d5e6f1111
//  *               role:
//  *                 type: string
//  *                 enum: [U, D]
//  *                 example: U
//  *     responses:
//  *       200:
//  *         description: Reports fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 count:
//  *                   type: number
//  *                   example: 2
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Report'
//  *       400:
//  *         description: Missing or invalid role parameter
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/reports", authenticate, ReportController.getReportsByRole);


// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "health-sync/reports",
    resource_type: "auto",  // ✅ supports pdf, images, docs
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage });

// ✅ Upload
router.post(
  "/upload",
  authenticate,
  upload.single("report"),
  ReportController.uploadReport
);

// ✅ Patient reports
router.get(
  "/patient",
  authenticate,
  ReportController.getReportsForPatient
);

// ✅ Doctor reports
router.get(
  "/doctor",
  authenticate,
  ReportController.getReportsForDoctor
);

router.get(
  "/patient/count",
  authenticate,
  ReportController.getReportCountForPatient
);
module.exports = router;


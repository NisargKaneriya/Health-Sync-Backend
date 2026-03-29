const express = require("express");
const router = express.Router();

const auth = "../middlewares/authMiddleware";
const authenticate = require(auth);
const authorizeRoles = require("../middlewares/roleMiddleware");
const medicineReminderSchemaController = require("../controllers/MedicineReminderController");

router.post("/createreminder", authenticate,medicineReminderSchemaController.createReminder);

module.exports = router;
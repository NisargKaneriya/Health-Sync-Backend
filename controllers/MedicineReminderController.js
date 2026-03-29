const MedicineReminder = require("../models/medicineReminder");
const sendNotification = require("../services/sendNotification");
const User = require("../models/User");
const cron = require("node-cron");

class MedicineReminderController {

  createReminder = async (req, res) => {
    try {
      const patientId = req.user.id;

      const { medicineName, dosage, reminderTimes, startDate, endDate } = req.body;

      const reminder = new MedicineReminder({
        patientId,
        medicineName,
        dosage,
        reminderTimes,
        startDate,
        endDate
      });

      await reminder.save();

      res.status(201).json({
        success: true,
        message: "Reminder created",
        reminder
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

}

// ✅ CRON MUST BE OUTSIDE CLASS
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split("T")[0];

    const reminders = await MedicineReminder.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
      reminderTimes: currentTime
    }).populate("patientId");

    for (const reminder of reminders) {
      const patient = reminder.patientId;

      if (!patient?.fcmToken) continue;

      await sendNotification(
        patient.fcmToken,
        "Medicine Reminder 💊",
        `Take ${reminder.medicineName} (${reminder.dosage || ""})`
      );
    }

  } catch (err) {
    console.error("Cron Error:", err.message);
  }
});

module.exports = new MedicineReminderController();
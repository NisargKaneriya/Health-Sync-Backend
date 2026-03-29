const User = require("../models/User"); // Mongoose model
const bcrypt = require("bcryptjs"); // For hashing passwords
const Joi = require("joi"); // For validating input
const Appointment = require("../models/Appointment");

// Class to handle admin-specific logic
class AdminController {
    // Method to add a new doctor (Admin-only)
    async addDoctor(req, res) {
        try {
            // Step 1: Validate input using Joi
            const schema = Joi.object({
                name: Joi.string().min(3).required(),
                email: Joi.string().email().required(),
                password: Joi.string().pattern(
                    new RegExp(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/)
                ).required(),
                specialization: Joi.string().min(3).required().messages({
                    'any.required': "Specialization is required for doctors"
                }),
                phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
                    'string.pattern.base': "Phone must be 10 digits"
                }),
                availableDays: Joi.array().items(
                    
                    Joi.string().valid("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
                ).min(1).required().messages({
                    'any.required': "At least one available day is required"
                })
            });


            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            // 🆕 Assign request body to variables 
            const { name, email, password, specialization, phone, availableDays } = req.body;

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new doctor document
            const doctor = new User({
                name,
                email,
                password: hashedPassword,
                role: "D", // fixed role for doctors
                specialization,
                phone,
                availableDays
            });

            // Save doctor to DB
            await doctor.save();

            // Return success response
            res.status(201).json({ message: "Doctor registered successfully" });


            // Step 6: Respond with success
            res.status(201).json({ message: "Doctor registered successfully" });

        } catch (err) {
            console.error("Add Doctor Error:", err.message);
            res.status(500).json({ error: "Server error while adding doctor" });
        }
    }

    async getCounts(req, res) {
    try {
      const totalDoctors = await User.countDocuments({ role: "D" });
      const totalPatients = await User.countDocuments({ role: "U" }); // Patients only
      const totalAppointments = await Appointment.countDocuments();//await Appointment.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          totalDoctors,
          totalPatients,
          totalAppointments
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching counts", error });
    }
  }
}

// Export instance
module.exports = new AdminController();

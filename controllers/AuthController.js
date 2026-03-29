// Import dependencies
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const User = require("../models/User.js"); // User Mongoose model
const Joi = require("joi"); // For input validation

// Define AuthController class to handle auth-related logic
class AuthController {
  // Method to register a new user (only role 'U' - Patient)
  async registerUser(req, res) {
    try {
      // Step 1: Validate input using Joi schema
      const schema = Joi.object({
        name: Joi.string().min(3).required().messages({
          'string.min': "Name should be at least 3 characters",
          'any.required': "Name is required"
        }),
        email: Joi.string().email().required().messages({
          'string.email': "Please enter a valid email",
          'any.required': "Email is required"
        }),
        password: Joi.string().pattern(
          new RegExp(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/)
        ).required().messages({
          'string.pattern.base': "Password must be at least 12 characters long, include 1 uppercase letter and 1 special character",
          'any.required': "Password is required"
        }),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
          'string.pattern.base': "Phone number must be exactly 10 digits",
          'any.required': "Phone number is required"
        })
      });

      // Step 2: Run validation on incoming request body
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password } = req.body;

      // Step 3: Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" });
      }

      // Step 4: Hash the password securely
      const hashedPassword = await bcrypt.hash(password, 10);

      // Step 5: Create new user (role = 'U' by default)
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'U'
      });

      // Step 6: Save user to DB
      await newUser.save();

      // Step 7: Respond with success message
      res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
      // Catch and handle unexpected errors
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }

//   async loginUser(req, res) {
//     console.log("LOGIN API CALLED FROM:", req.ip);
//   try {
//     const schema = Joi.object({
//       email: Joi.string().email().required().messages({
//         'string.email': "Enter a valid email",
//         'any.required': "Email is required"
//       }),
//       password: Joi.string().required().messages({
//         'any.required': "Password is required"
//       })
//     });

//     const { error } = schema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Create user response object
//     let userResponse = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     // If doctor, add specialization
//     if (user.role === "D") {
//       console.log("LOGIN REQUEST FROM:", req.ip);
//       console.log("USER SPECIALIZATION:", user.specialization);
//       userResponse.specialization = user.specialization;
//     }

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: userResponse
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
async loginUser(req, res) {
  console.log("LOGIN API CALLED FROM:", req.ip);
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': "Enter a valid email",
        'any.required': "Email is required"
      }),
      password: Joi.string().required().messages({
        'any.required': "Password is required"
      })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Check user status
    if (user.status === 3) {
      return res.status(403).json({ error: "Your account has been deleted. Contact admin." });
    }

    if (user.status === 2) {
      return res.status(403).json({ error: "Your account is inactive. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status, // ✅ include status in response
    };

    if (user.role === "D") {
      userResponse.specialization = user.specialization;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
  async forgotPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found with this email");

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return res.status(400).json({ message: "Something went wrong" });
    }
  };

  // Logout (common for Admin, Doctor, Patient)
  async logout(req, res) {
    try {
      // If token is valid, authentication middleware already passed
      return res.status(200).json({
        message: "Logout successful"
      });
    } catch (err) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }
  }

   saveFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "Token missing" });
    }

        const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true } // 👈 IMPORTANT
    );

    console.log("UPDATED USER:", updatedUser);

    // await User.findByIdAndUpdate(userId, { fcmToken });

    res.json({ message: "Token saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
}

// Export an instance of the controller class
module.exports = new AuthController();

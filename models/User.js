// Import Mongoose to define the schema
const mongoose = require("mongoose");

// Define the user schema structure
const userSchema = new mongoose.Schema({
  name: {
    type: String, // Name of the user
    required: true, // Required field
    minlength: 3 // Minimum length validation
  },
  email: {
    type: String, // Email address
    required: true, // Required field
    unique: true // Email must be unique
  },
  password: {
    type: String, // Hashed password
    required: true
  },
  role: {
    type: String, // A = Admin, D = Doctor, U = User
    enum: ['A', 'D', 'U'],
    default: 'U'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  specialization: {
  type: String,
  required: function () {
    return this.role === "D"; // Only required for doctors
  },
  phone: { type: String, required: true }, // ✅ Added phone field
},
phone: {
  type: String,
  required: function () {
    return this.role === "D";
  }
},
availableDays: {
  type: [String], // List of available days
  required: function () {
    return this.role === "D";
  }
},
  fcmToken: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 1,  // 1 = Active, 2 = Inactive, 3 = Deleted
    enum: [1, 2, 3]
  }
});

// Export the model to use in controllers
module.exports = mongoose.model("User", userSchema);

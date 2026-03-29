// Load required modules
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// This function checks if an admin exists and creates one if not
async function initAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "A" });

    // If admin already exists, skip
    if (existingAdmin) {
      console.log("✅ Admin already exists.");
      return;
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash("Admin@1234", 10);

    // Create a default admin user
    const adminUser = new User({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "A"
    });

    await adminUser.save();
    console.log("✅ Default admin user created: admin@gmail.com / Admin@1234");
  } catch (error) {
    console.error("❌ Error initializing admin:", error.message);
  }
}

module.exports = initAdmin;

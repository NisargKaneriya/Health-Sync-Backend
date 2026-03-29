const Report = require("../models/Labreports");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Cloudinary config (make sure your .env has these values)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ReportController {
//   static async uploadReport(req, res) {
//     try {
//         console.log(req);
//       const { userId, doctorId } = req.body;

//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//       }

//       // Find doctor
//       const doctor = await User.findById(doctorId);
//       if (!doctor) {
//         return res.status(404).json({ message: "Doctor not found" });
//       }

//       // Find user
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // Upload to Cloudinary
//     //   const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//     //     folder: "reports", // creates "reports" folder in Cloudinary
//     //     resource_type: "auto", // supports images, pdf, docs, etc.
//     //   });

//       // Save report entry in DB with Cloudinary URL
//       const newReport = new Report({
//         userName: user.name,
//         doctorName: doctor.name,
//         userId,
//         doctorId,
//         fileUrl: req.file?.path || req.file?.secure_url,
//         uploadedAt: new Date(),
//       });

//       await newReport.save();

//       res.status(201).json({
//         message: "Report uploaded successfully",
//         data: newReport,
//       });
//     } catch (error) {
//         console.error("Upload error:", error); // logs full object in server console
//         res.status(500).json({
//             message: "Error uploading report",
//             error: error, // return full error
//             stack: error.stack, // shows stack trace
//         });
//     }

//   }

//   static async getReportsByRole(req, res) {
//   try {
//     const { id, role } = req.body;

//     if (!id || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing id or role parameter",
//       });
//     }

//     let filter = {};

//     if (role === "U") {
//       filter = { userId: id };
//     } else if (role === "D") {
//       filter = { doctorId: id };
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid role. Must be 'user' or 'doctor'",
//       });
//     }

//     const reports = await Report.find(filter).sort({ uploadedAt: -1 });

//     res.json({
//       success: true,
//       count: reports.length,
//       data: reports,
//     });
//   } catch (error) {
//     console.error("Error fetching reports by role:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// }
// ✅ Upload Report
  //   static async uploadReport(req, res) {
  //   try {
  //     const doctorId = req.user.id; // from token
  //     const { userId } = req.body;

  //     if (!userId) {
  //       return res.status(400).json({ message: "userId is required" });
  //     }

  //     if (!req.file) {
  //       return res.status(400).json({ message: "No file uploaded" });
  //     }

  //     const doctor = await User.findById(doctorId);
  //     const user = await User.findById(userId);

  //     if (!doctor || !user) {
  //       return res.status(404).json({ message: "User or Doctor not found" });
  //     }

  //     const newReport = new Report({
  //       userId,
  //       doctorId,
  //       userName: user.name,
  //       doctorName: doctor.name,
  //       fileUrl: req.file.path, // ✅ cloudinary url
  //     });

  //     await newReport.save();

  //     res.status(201).json({
  //       success: true,
  //       message: "Report uploaded successfully",
  //       data: newReport,
  //     });

  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Error uploading report",
  //       error: error.message,
  //     });
  //   }
  // }
  static async uploadReport(req, res) {
  try {
    console.log("📦 req.body:", req.body);
    console.log("📦 req.file:", req.file);

    const { userId, doctorId } = req.body; // ✅ both from body now

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!doctorId) return res.status(400).json({ message: "doctorId is required" }); // ✅ validate
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const doctor = await User.findById(doctorId);
    const user = await User.findById(userId);

    if (!doctor || !user) {
      return res.status(404).json({ message: "User or Doctor not found" });
    }

    const newReport = new Report({
      userId,
      doctorId,
      userName: user.name,
      doctorName: doctor.name,
      fileUrl: req.file.path,
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      data: newReport,
    });

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error uploading report",
      error: error.message,
    });
  }
}

  // ✅ Get Reports by Role
  static async getReportsForPatient(req, res) {
    try {
      const userId = req.user.id;

      const reports = await Report.find({ userId })
        .sort({ uploadedAt: -1 });

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });

    } catch (error) {
      console.error("Patient reports error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching patient reports",
        error: error.message,
      });
    }
  }

    static async getReportsForDoctor(req, res) {
    try {
      const doctorId = req.user.id;

      const reports = await Report.find({ doctorId })
        .sort({ uploadedAt: -1 });

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });

    } catch (error) {
      console.error("Doctor reports error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching doctor reports",
        error: error.message,
      });
    }
  }
  
  static async getReportCountForPatient(req, res) {
  try {
    const userId = req.user.id; // ✅ from JWT

    const count = await Report.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: count,
    });

  } catch (error) {
    console.error("Error fetching report count:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching report count",
      error: error.message,
    });
  }
}

}

module.exports = ReportController;




const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee"); // apna actual Employee model path

// PUT /api/users/profile
// multipart/form-data: name, password (optional), confirmPassword (optional), image (optional file)
const updateProfile = async (req, res) => {
  try {
    const userId = req.employee.id; // authMiddleware "req.employee" set karta hai
    const { name, password, confirmPassword } = req.body;

    const user = await Employee.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Naam update
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Email jaanbujh kar update nahi hone dete - security ke liye
    // (agar req.body.email aaya bhi to usko ignore kar rahe hain)

    // Password update - sirf tab jab dono fields bheji ho
    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          // message: "Password aur confirm password dono chahiye",
          message: "Please enter both password and confirm password."

        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          // message: "Password match nahi ho raha",
          message: "Password and confirm password do not match."

        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          // message: "Password kam se kam 6 digit ka hona chahiye",
          message: "Password must contain at least 6 characters."
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Image - multer-storage-cloudinary ne already Cloudinary pe upload kar diya hai
    // req.file.path me hi Cloudinary ka secure URL milta hai
    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/users/account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.employee.id;
    await Employee.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { updateProfile, deleteAccount };

// const bcrypt = require("bcryptjs");
// const User = require("../models/Employee"); // apna actual User model path daal dena agar alag hai

// // PUT /api/users/profile
// // multipart/form-data: name, password (optional), confirmPassword (optional), image (optional file)
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // authMiddleware se aayega
//     const { name, password, confirmPassword } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Naam update
//     if (name && name.trim()) {
//       user.name = name.trim();
//     }

//     // Email jaanbujh kar update nahi hone dete - security ke liye
//     // (agar req.body.email aaya bhi to usko ignore kar rahe hain)

//     // Password update - sirf tab jab dono fields bheji ho
//     if (password || confirmPassword) {
//       if (!password || !confirmPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "Password aur confirm password dono chahiye",
//         });
//       }
//       if (password !== confirmPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "Password match nahi ho raha",
//         });
//       }
//       if (password.length < 6) {
//         return res.status(400).json({
//           success: false,
//           message: "Password kam se kam 6 digit ka hona chahiye",
//         });
//       }
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     // Image - multer-storage-cloudinary ne already Cloudinary pe upload kar diya hai
//     // req.file.path me hi Cloudinary ka secure URL milta hai
//     if (req.file) {
//       user.avatar = req.file.path;
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // DELETE /api/users/account
// const deleteAccount = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     await User.findByIdAndDelete(userId);

//     return res.status(200).json({
//       success: true,
//       message: "Account deleted successfully",
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// module.exports = { updateProfile, deleteAccount };



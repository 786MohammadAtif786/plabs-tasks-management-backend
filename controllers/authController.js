/** @format */

const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// JWT token generate karne ka helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route  POST /api/auth/signup
// @desc   Naya employee register karo
// @access Public
const signup = async (req, res) => {
  try {
    const { name, email, password, department, designation, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        // message: "Name, email aur password zaroori hai",
        message: "Please provide your name, email, and password."

      });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        // message: "Is email se employee pehle se registered hai",
        message: "An account with this email address already exists."

      });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      department,
      designation,
      // role sirf admin khud assign kar sake, isliye default 'employee' rakha
      role: role === "admin" ? "employee" : role || "employee",
    });

    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/auth/login
// @desc   Employee login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        // message: "Email aur password dono zaroori hai",
        message: "Please provide both email and password."

      });
    }

    // Password field select("+password") se explicitly leni padegi
    const employee = await Employee.findOne({ email }).select("+password");

    if (!employee || !(await employee.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        // message: "Email ya password galat hai",
        message: "The email address or password you entered is incorrect."

      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        // message: "Aapka account deactivate kar diya gaya hai",
        message: "Your account has been deactivated. Please contact your administrator for assistance."
      });
    }

    const token = generateToken(employee._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/auth/me
// @desc   Login employee ki profile
// @access Private
const getProfile = async (req, res) => {
  res.status(200).json({ success: true, employee: req.employee });
};

module.exports = { signup, login, getProfile };

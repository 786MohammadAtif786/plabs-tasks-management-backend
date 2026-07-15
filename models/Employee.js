
/** @format */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // password kabhi bhi query me default nahi aayega
    },
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },
    department: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
  },
   
  },
  { timestamps: true },
);

// Password hash karne se pehle (save hook)
// NOTE: async function mein "next" pass nahi hota (mongoose promise ka wait karta hai),
// isliye next() call NAHI karna - bas function return ho jaye, mongoose khud aage badh jayega.
employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login ke waqt password compare karne ke liye method
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
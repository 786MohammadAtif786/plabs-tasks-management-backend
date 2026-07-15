// /** @format */

// const mongoose = require("mongoose");

// const taskSchema = new mongoose.Schema(
//   {
//     // Jo employee ne task banaya (login se milega, req.employee.id)
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     // "Task Name / Meeting / Blocker" column
//     taskName: {
//       type: String,
//       required: [true, "Task name is required"],
//       trim: true,
//     },

//     // "Task Type" column e.g. Break, Research, Meeting, Bug
//     taskType: {
//       type: String,
//       enum: ["Break", "Research", "Feature", "Meeting", "Bug", "Task"],
//       default: "Task",
//     },

//     // "Frontend / Backend" column
//     department: {
//       type: String,
//       enum: ["Frontend", "Backend", "Design", "DevOps", "QA", "Other"],
//       default: "Other",
//     },

//     // "Task Category" column e.g. Debugging, Research, Feature
//     taskCategory: {
//       type: String,
//       enum: ["Debugging", "Research", "Feature", "Development", "Testing", "Other"],
//       default: "Other",
//     },

//     // "UI Element Type / Integration" column e.g. Component, API, Integration
//     uiElementType: {
//       type: String,
//       default: "",
//     },

//     // "Detail" column - rich description of the work done
//     description: {
//       type: String,
//       default: "",
//     },

//     // In hours (e.g. 2, 1.5)
//     estimateTime: {
//       type: Number,
//       default: 0,
//     },
//     actualTime: {
//       type: Number,
//       default: 0,
//     },

//     startTime: {
//       type: Date,
//       required: true,
//     },
//     endTime: {
//       type: Date,
//     },

//     status: {
//       type: String,
//       enum: ["Pending", "In Progress", "Completed", "Blocked"],
//       default: "Pending",
//     },
//      ,approvalStatus: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected"],
//       default: "Pending",
//     },

//     approvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       default: null,
//     },

//     approvalRemark: {
//       type: String,
//       default: "",
//     },

//     approvedAt: {
//       type: Date,
//       default: null,
//     },
  

//     // Task jis din ka hai (spreadsheet me date-wise tabs jaisa)
//     taskDate: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Task", taskSchema);



/** @format */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Employee jisne task create kiya
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Task Name
    taskName: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
    },

    // Task Type
    taskType: {
      type: String,
      enum: ["Break", "Research", "Feature", "Meeting", "Bug", "Task"],
      default: "Task",
    },

    // Department
    department: {
      type: String,
      enum: ["Frontend", "Backend", "Design", "DevOps", "QA", "Other"],
      default: "Other",
    },

    // Task Category
    taskCategory: {
      type: String,
      enum: [
        "Debugging",
        "Research",
        "Feature",
        "Development",
        "Testing",
        "Other",
      ],
      default: "Other",
    },

    // UI Element Type
    uiElementType: {
      type: String,
      default: "",
    },

    // Description
    description: {
      type: String,
      default: "",
    },

    // Time
    estimateTime: {
      type: Number,
      default: 0,
    },

    actualTime: {
      type: Number,
      default: 0,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    // Work Status
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Blocked"],
      default: "Pending",
    },

    // Approval Status
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    approvalRemark: {
      type: String,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    // Task Date
    taskDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
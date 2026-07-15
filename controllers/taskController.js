
// /** @format */

// const Task = require("../models/Task");
// const { getIO } = require("../config/socket");


// // @route  POST /api/tasks
// // @desc   Naya task banao (logged-in employee ke naam se)
// // @access Private
// const createTask = async (req, res) => {
//   try {
//     const {
//       taskName,
//       taskType,
//       department,
//       taskCategory,
//       uiElementType,
//       description,
//       estimateTime,
//       actualTime,
//       startTime,
//       endTime,
//       status,
//       taskDate,
//     } = req.body;

//     if (!taskName || !startTime) {
//       return res.status(400).json({
//         success: false,
//         // message: "Task name aur start time zaroori hai",
//         message: "Please provide the task name and start time."

//       });
//     }

//     console.log(taskName,
//       taskType,
//       department,
//       taskCategory,
//       uiElementType,
//       description,
//       estimateTime,
//       actualTime,
//       startTime,
//       endTime,
//       status,
//       taskDate,)

//     const task = await Task.create({
//       employee: req.employee._id,
//       taskName,
//       taskType,
//       department,
//       taskCategory,
//       uiElementType,
//       description,
//       estimateTime,
//       actualTime,
//       startTime,
//       endTime,
//       status,
//       taskDate,
//     });

//     // Employee ka naam/email HR ke card me dikhana hai, isliye populate karke bhejo
//     await task.populate("employee", "name email department designation");

//     // --- SOCKET EMIT ---
//     // Sirf HR/manager room ko naya task bhejo, taaki unke Task Approval page
//     // par bina refresh kiye naya card turant aa jaye
//     try {
//       getIO().to("hr-room").emit("taskCreated", task);
//     } catch (socketErr) {
//       // Socket fail bhi ho jaye to task creation fail nahi hona chahiye
//       console.error("Socket emit error (taskCreated):", socketErr.message);
//     }

//     res.status(201).json({ success: true, message: "Task created", task });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @route  GET /api/tasks/my
// // @desc   Login employee ke apne saare tasks (optionally date/status filter)
// // @access Private
// const getMyTasks = async (req, res) => {
//   try {
//     const { date, status, taskType } = req.query;
//     const filter = { employee: req.employee._id };

//     if (status) filter.status = status;
//     if (taskType) filter.taskType = taskType;

//     if (date) {
//       const start = new Date(date);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(date);
//       end.setHours(23, 59, 59, 999);
//       filter.taskDate = { $gte: start, $lte: end };
//     }

//     const tasks = await Task.find(filter).sort({ startTime: 1 });

//     res.status(200).json({ success: true, count: tasks.length, tasks });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @route  GET /api/tasks
// // @desc   Saare employees ke tasks (sirf admin/manager)
// // @access Private (admin, manager)
// const getAllTasks = async (req, res) => {
//   try {
//     const { employeeId, date, status } = req.query;
//     const filter = {};

//     if (employeeId) filter.employee = employeeId;
//     if (status) filter.status = status;
//     if (date) {
//       const start = new Date(date);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(date);
//       end.setHours(23, 59, 59, 999);
//       filter.taskDate = { $gte: start, $lte: end };
//     }

//     const tasks = await Task.find(filter)
//       .populate("employee", "name email department designation")
//       .sort({ startTime: 1 });

//     res.status(200).json({ success: true, count: tasks.length, tasks });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @route  GET /api/tasks/:id
// // @desc   Ek task ki detail
// // @access Private (owner ya admin/manager)
// const getTaskById = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id).populate(
//       "employee",
//       "name email department designation",
//     );

//     if (!task) {
//       return res.status(404).json({ success: false, message: "Task not found" });
//     }

//     const isOwner = task.employee._id.toString() === req.employee._id.toString();
//     const isPrivileged = ["admin", "manager"].includes(req.employee.role);

//     if (!isOwner && !isPrivileged) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     res.status(200).json({ success: true, task });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @route  PUT /api/tasks/:id
// // @desc   Task update karo (sirf apna, ya admin/manager)
// // @access Private
// const updateTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ success: false, message: "Task not found" });
//     }

//     const isOwner = task.employee.toString() === req.employee._id.toString();
//     const isPrivileged = ["admin", "manager"].includes(req.employee.role);

//     if (!isOwner && !isPrivileged) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     // Normal fields jo koi bhi owner/admin/manager seedhe update kar sakta hai
//     const updatableFields = [
//       "taskName",
//       "taskType",
//       "department",
//       "taskCategory",
//       "uiElementType",
//       "description",
//       "estimateTime",
//       "actualTime",
//       "startTime",
//       "endTime",
//       "status",
//       "taskDate",
//     ];

//     updatableFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         task[field] = req.body[field];
//       }
//     });

//     // --- RESEND LOGIC ---
//     // approvalStatus/approvalRemark ko is route se seedhe "Approved" karne ki
//     // permission nahi dete (wo sirf approveTask se ho, manager/admin ke through).
//     // Yahan sirf ek special case allow hai: owner apna REJECTED task
//     // wapas "Pending" par resend kar sakta hai.
//     let isResend = false;
//     if (req.body.approvalStatus !== undefined) {
//       const isResendToPending = req.body.approvalStatus === "Pending";

//       if (isResendToPending && isOwner && task.approvalStatus === "Rejected") {
//         task.approvalStatus = "Pending";
//         task.approvalRemark = req.body.approvalRemark || "";
//         task.approvedBy = undefined;
//         task.approvedAt = undefined;
//         isResend = true;
//       } else if (isPrivileged) {
//         // Admin/manager chaahe to yahan se bhi approvalStatus set kar sakte hain
//         if (["Pending", "Approved", "Rejected"].includes(req.body.approvalStatus)) {
//           task.approvalStatus = req.body.approvalStatus;
//           if (req.body.approvalRemark !== undefined) {
//             task.approvalRemark = req.body.approvalRemark;
//           }
//         }
//       } else {
//         return res.status(403).json({
//           success: false,
//           message: "Approval status yahan se change nahi kar sakte",
//         });
//       }
//     }

//     await task.save();

//     // Resend hua to HR/manager ko bhi turant pata chalna chahiye (bina refresh)
//     if (isResend) {
//       try {
//         await task.populate("employee", "name email department designation");
//         getIO().to("hr-room").emit("taskResent", task);
//       } catch (socketErr) {
//         console.error("Socket emit error (taskResent):", socketErr.message);
//       }
//     }

//     res.status(200).json({ success: true, message: "Task updated", task });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @route  DELETE /api/tasks/:id
// // @desc   Task delete karo (sirf apna, ya admin/manager)
// // @access Private
// const deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ success: false, message: "Task not found" });
//     }

//     const isOwner = task.employee.toString() === req.employee._id.toString();
//     const isPrivileged = ["admin", "manager"].includes(req.employee.role);

//     if (!isOwner && !isPrivileged) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     await task.deleteOne();

//     res.status(200).json({ success: true, message: "Task deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const approveTask = async (req, res) => {
//   try {
//     const { approvalStatus, approvalRemark } = req.body;

//     // Validate approval status
//     if (!["Approved", "Rejected"].includes(approvalStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Approval status must be 'Approved' or 'Rejected'",
//       });
//     }

//     // Find task
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     // Update approval details
//     task.approvalStatus = approvalStatus;
//     task.approvalRemark = approvalRemark || "";
//     task.approvedBy = req.employee.id;
//     task.approvedAt = new Date();

//     // Update task status
//     if (approvalStatus === "Approved") {
//       task.status = "Completed";
//     } else {
//       task.status = "Pending";
//     }

//     await task.save();

//     // Populate approver details
//     await task.populate("approvedBy", "name email role");

//     return res.status(200).json({
//       success: true,
//       message: `Task ${approvalStatus} successfully`,
//       data: task,
//     });
//   } catch (error) {
//     console.error("Approve Task Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   createTask,
//   getMyTasks,
//   getAllTasks,
//   getTaskById,
//   updateTask,
//   deleteTask,
//   approveTask
// };



/** @format */

const Task = require("../models/Task");
const { getIO } = require("../config/socket");


// @route  POST /api/tasks
// @desc   Naya task banao (logged-in employee ke naam se)
// @access Private
const createTask = async (req, res) => {
  try {
    const {
      taskName,
      taskType,
      department,
      taskCategory,
      uiElementType,
      description,
      estimateTime,
      actualTime,
      startTime,
      endTime,
      status,
      taskDate,
    } = req.body;

    if (!taskName || !startTime) {
      return res.status(400).json({
        success: false,
        // message: "Task name aur start time zaroori hai",
        message: "Please provide the task name and start time."

      });
    }

    console.log(taskName,
      taskType,
      department,
      taskCategory,
      uiElementType,
      description,
      estimateTime,
      actualTime,
      startTime,
      endTime,
      status,
      taskDate,)

    const task = await Task.create({
      employee: req.employee._id,
      taskName,
      taskType,
      department,
      taskCategory,
      uiElementType,
      description,
      estimateTime,
      actualTime,
      startTime,
      endTime,
      status,
      taskDate,
    });

    // Employee ka naam/email HR ke card me dikhana hai, isliye populate karke bhejo
    await task.populate("employee", "name email department designation");

    // --- SOCKET EMIT ---
    // Sirf HR/manager room ko naya task bhejo, taaki unke Task Approval page
    // par bina refresh kiye naya card turant aa jaye
    try {
      getIO().to("hr-room").emit("taskCreated", task);
    } catch (socketErr) {
      // Socket fail bhi ho jaye to task creation fail nahi hona chahiye
      console.error("Socket emit error (taskCreated):", socketErr.message);
    }

    res.status(201).json({ success: true, message: "Task created", task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/tasks/my
// @desc   Login employee ke apne saare tasks (optionally date/status filter)
// @access Private
const getMyTasks = async (req, res) => {
  try {
    const { date, status, taskType } = req.query;
    const filter = { employee: req.employee._id };

    if (status) filter.status = status;
    if (taskType) filter.taskType = taskType;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.taskDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).sort({ startTime: 1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/tasks
// @desc   Saare employees ke tasks (sirf admin/manager)
// @access Private (admin, manager)
const getAllTasks = async (req, res) => {
  try {
    const { employeeId, date, status } = req.query;
    const filter = {};

    if (employeeId) filter.employee = employeeId;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.taskDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter)
      .populate("employee", "name email department designation")
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/tasks/:id
// @desc   Ek task ki detail
// @access Private (owner ya admin/manager)
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "employee",
      "name email department designation",
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isOwner = task.employee._id.toString() === req.employee._id.toString();
    const isPrivileged = ["admin", "manager"].includes(req.employee.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/tasks/:id
// @desc   Task update karo (sirf apna, ya admin/manager)
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isOwner = task.employee.toString() === req.employee._id.toString();
    const isPrivileged = ["admin", "manager"].includes(req.employee.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Normal fields jo koi bhi owner/admin/manager seedhe update kar sakta hai
    const updatableFields = [
      "taskName",
      "taskType",
      "department",
      "taskCategory",
      "uiElementType",
      "description",
      "estimateTime",
      "actualTime",
      "startTime",
      "endTime",
      "status",
      "taskDate",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // --- RESEND LOGIC ---
    // approvalStatus/approvalRemark ko is route se seedhe "Approved" karne ki
    // permission nahi dete (wo sirf approveTask se ho, manager/admin ke through).
    // Yahan sirf ek special case allow hai: owner apna REJECTED task
    // wapas "Pending" par resend kar sakta hai.
    let isResend = false;
    if (req.body.approvalStatus !== undefined) {
      const isResendToPending = req.body.approvalStatus === "Pending";

      if (isResendToPending && isOwner && task.approvalStatus === "Rejected") {
        task.approvalStatus = "Pending";
        task.approvalRemark = req.body.approvalRemark || "";
        task.approvedBy = undefined;
        task.approvedAt = undefined;
        isResend = true;
      } else if (isPrivileged) {
        // Admin/manager chaahe to yahan se bhi approvalStatus set kar sakte hain
        if (["Pending", "Approved", "Rejected"].includes(req.body.approvalStatus)) {
          task.approvalStatus = req.body.approvalStatus;
          if (req.body.approvalRemark !== undefined) {
            task.approvalRemark = req.body.approvalRemark;
          }
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Approval status yahan se change nahi kar sakte",
        });
      }
    }

    await task.save();

    // Employee ka naam HR card me chahiye, isliye populate karke bhejo
    await task.populate("employee", "name email department designation");

    // --- SOCKET EMIT ---
    // Har update (status change, resend, admin edit) HR/manager ko turant
    // bina refresh dikhna chahiye
    try {
      getIO().to("hr-room").emit("taskUpdated", task);
    } catch (socketErr) {
      console.error("Socket emit error (taskUpdated):", socketErr.message);
    }

    res.status(200).json({ success: true, message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/tasks/:id
// @desc   Task delete karo (sirf apna, ya admin/manager)
// @access Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isOwner = task.employee.toString() === req.employee._id.toString();
    const isPrivileged = ["admin", "manager"].includes(req.employee.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveTask = async (req, res) => {
  try {
    const { approvalStatus, approvalRemark } = req.body;

    // Validate approval status
    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be 'Approved' or 'Rejected'",
      });
    }

    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update approval details
    task.approvalStatus = approvalStatus;
    task.approvalRemark = approvalRemark || "";
    task.approvedBy = req.employee.id;
    task.approvedAt = new Date();

    // Update task status
    if (approvalStatus === "Approved") {
      task.status = "Completed";
    } else {
      task.status = "Pending";
    }

    await task.save();

    // Populate approver details
    await task.populate("approvedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: `Task ${approvalStatus} successfully`,
      data: task,
    });
  } catch (error) {
    console.error("Approve Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getMyTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  approveTask
};
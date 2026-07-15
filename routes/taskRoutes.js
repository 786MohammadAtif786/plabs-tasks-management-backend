/** @format */

const express = require("express");
const router = express.Router();
const {
  createTask,
  getMyTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  approveTask
} = require("../controllers/taskController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Sabhi task routes ke liye login zaroori hai
router.use(protect);

router.post("/", createTask);
router.get("/my", getMyTasks);
router.get("/", authorizeRoles("admin", "manager"), getAllTasks);
router.put(
  "/:id/approval",
  authorizeRoles("admin", "manager"),
  approveTask
);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);


module.exports = router;

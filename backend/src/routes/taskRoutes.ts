import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getTasks, createTask, updateTask, deleteTask } from "../services/taskService";

const router = express.Router();

router.get("/", authenticateUser, getTasks);
router.post("/", authenticateUser, createTask);
router.put("/:taskNumber", authenticateUser, updateTask);
router.delete("/:taskNumber", authenticateUser, deleteTask);

export default router;

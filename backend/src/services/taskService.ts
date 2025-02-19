import { Request, Response } from "express";
import prisma from "../config/db";

// Fetch all tasks for the authenticated user
export const getTasks = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const tasks = await prisma.task.findMany({ where: { userId } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const { title, description } = req.body;

    // Find the last task number for this user
    const lastTask = await prisma.task.findFirst({
      where: { userId },
      orderBy: { taskNumber: "desc" },
    });

    const newTaskNumber = lastTask ? lastTask.taskNumber + 1 : 1;

    const newTask = await prisma.task.create({
      data: {
        userId,
        taskNumber: newTaskNumber,
        title,
        description,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Update a task (mark as complete or edit)
export const updateTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const { taskNumber } = req.params;
    const { title, description, isComplete } = req.body;

    const task = await prisma.task.updateMany({
      where: { userId, taskNumber: Number(taskNumber) },
      data: { title, description, isComplete },
    });

    if (task.count === 0) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const { taskNumber } = req.params;

    const task = await prisma.task.deleteMany({
      where: { userId, taskNumber: Number(taskNumber) },
    });

    if (task.count === 0) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

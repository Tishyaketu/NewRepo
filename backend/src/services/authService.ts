import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../config/db";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Register User
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

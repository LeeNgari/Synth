import { clerkClient } from "@clerk/express";
import { user } from "../models/user-model.js";

export const protectRoute = async (req, res, next) => {
  if (!req.auth.userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - you must be logged in",
    });
    return;
  }
  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.auth.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const dbUser = await user.findOne({ clerkId: req.auth.userId });

    if (!dbUser) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    const isAdmin = dbUser.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - admin access required",
      });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during admin verification",
    });
  }
};

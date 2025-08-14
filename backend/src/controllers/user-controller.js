import { user } from "../models/user-model.js";
export const fetchAllUsers = async (req, res) => {
  try {
    const currentUserId = req.auth.userId;
    const users = await user.find({ clerkID: { $ne: currentUserId } });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

import {user} from "../models/user-model.js";
export const fetchAllUsers = async (req, res) => {
  try {
    const currentUserId = req.auth.userId;
    const users = await user.find({clerkID: {$ne: currentUserId}})
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}
export const addToHistory = async (req, res, next) => {
  try {
    const currentUser = await user.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { $addToSet: { listeningHistory: req.params.songId } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Added to history' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
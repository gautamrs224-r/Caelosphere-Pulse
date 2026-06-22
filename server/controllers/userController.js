import User from "../models/User.js";
import Message from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

// @route   GET /api/users
// Returns all users except the requester, each with last message + unread count
export const getAllUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("name email profilePic isOnline lastSeen theme")
    .sort({ name: 1 })
    .lean();

  const userIds = users.map((u) => u._id);

  // Pull the most recent message + unread count per conversation in one pass
  const lastMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: currentUserId, receiverId: { $in: userIds } },
          { senderId: { $in: userIds }, receiverId: currentUserId },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$senderId", currentUserId] },
            "$receiverId",
            "$senderId",
          ],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", currentUserId] },
                  { $eq: ["$seen", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const lastMessageMap = {};
  lastMessages.forEach((entry) => {
    lastMessageMap[entry._id.toString()] = entry;
  });

  const enrichedUsers = users.map((user) => {
    const entry = lastMessageMap[user._id.toString()];
    return {
      ...user,
      lastMessage: entry?.lastMessage || null,
      unreadCount: entry?.unreadCount || 0,
    };
  });

  // Sort by most recent activity, users with no messages go last (alphabetical)
  enrichedUsers.sort((a, b) => {
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    }
    if (a.lastMessage) return -1;
    if (b.lastMessage) return 1;
    return a.name.localeCompare(b.name);
  });

  res.status(200).json({
    success: true,
    users: enrichedUsers,
  });
});

// @route   GET /api/users/search?q=
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user._id;

  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .select("name email profilePic isOnline lastSeen")
    .limit(20);

  res.status(200).json({
    success: true,
    users,
  });
});

// @route   PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, theme } = req.body;

  if (name !== undefined) {
    if (name.trim().length < 2) {
      throw new ApiError(400, "Name must be at least 2 characters");
    }
    req.user.name = name.trim();
  }

  if (bio !== undefined) {
    req.user.bio = bio;
  }

  if (theme !== undefined) {
    if (!["dark-purple", "dark-blue", "dark-gray"].includes(theme)) {
      throw new ApiError(400, "Invalid theme value");
    }
    req.user.theme = theme;
  }

  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: req.user.toSafeObject(),
  });
});

// @route   PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user.password) {
    throw new ApiError(
      400,
      "This account uses Google Sign-In and has no password to change"
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

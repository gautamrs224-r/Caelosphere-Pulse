import mongoose from "mongoose";
import Message from "../models/Message.js";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";

// @route   GET /api/messages/:userId
// Fetch full conversation history between the current user and :userId
export const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userId },
      { senderId: userId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  // Mark all messages from that user to me as seen
  await Message.updateMany(
    { senderId: userId, receiverId: myId, seen: false },
    { seen: true, seenAt: new Date() }
  );

  res.status(200).json({
    success: true,
    messages,
  });
});

// @route   POST /api/messages/:userId
// Send a text or emoji message (image messages go through sendImageMessage)
export const sendMessage = asyncHandler(async (req, res) => {
  const { userId: receiverId } = req.params;
  const { text, messageType } = req.body;
  const senderId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid recipient");
  }

  if (!text || !text.trim()) {
    throw new ApiError(400, "Message text cannot be empty");
  }

  if (receiverId === senderId.toString()) {
    throw new ApiError(400, "You cannot send a message to yourself");
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text: text.trim(),
    messageType: messageType === "emoji" ? "emoji" : "text",
  });

  // Emit in real-time to the receiver if they're online
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    getIO().to(receiverSocketId).emit("newMessage", message);
  }

  res.status(201).json({
    success: true,
    message,
  });
});

// @route   POST /api/messages/:userId/image
// Send an image message — image is uploaded to Cloudinary first
export const sendImageMessage = asyncHandler(async (req, res) => {
  const { userId: receiverId } = req.params;
  const senderId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid recipient");
  }

  if (!req.file) {
    throw new ApiError(400, "No image file provided");
  }

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "chatsphere/chat-images",
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  });

  const message = await Message.create({
    senderId,
    receiverId,
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
    text: req.body.caption?.trim() || "",
    messageType: "image",
  });

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    getIO().to(receiverSocketId).emit("newMessage", message);
  }

  res.status(201).json({
    success: true,
    message,
  });
});

// @route   PUT /api/messages/:userId/seen
// Mark messages from :userId as seen (called when chat window is opened/focused)
export const markAsSeen = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  await Message.updateMany(
    { senderId: userId, receiverId: myId, seen: false },
    { seen: true, seenAt: new Date() }
  );

  const senderSocketId = getReceiverSocketId(userId);
  if (senderSocketId) {
    getIO().to(senderSocketId).emit("messagesSeen", { by: myId });
  }

  res.status(200).json({ success: true });
});

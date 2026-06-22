import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      // Cloudinary public_id, kept so we can delete the asset later if needed
      type: String,
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "emoji"],
      default: "text",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Speeds up fetching a conversation between two users, sorted by time
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

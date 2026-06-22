import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be under 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required because Google OAuth users won't have a local password
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 160,
      default: "",
    },
    theme: {
      type: String,
      enum: ["dark-purple", "dark-blue", "dark-gray"],
      default: "dark-purple",
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text" });

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    profilePic: this.profilePic,
    bio: this.bio,
    theme: this.theme,
    authProvider: this.authProvider,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;

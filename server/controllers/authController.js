import bcrypt from "bcryptjs";
import crypto from "crypto";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    authProvider: "local",
  });

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: user.toSafeObject(),
    token,
  });
});

// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.isOnline = true;
  await user.save();

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: user.toSafeObject(),
    token,
  });
});

// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
  }

  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

// @route   POST /api/auth/google
// Frontend sends the Google ID token obtained from Google Identity Services
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

  if (user) {
    // Link Google to an existing local account if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      if (!user.profilePic) user.profilePic = picture;
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      googleId,
      authProvider: "google",
      profilePic: picture || "",
    });
  }

  user.isOnline = true;
  await user.save();

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Logged in with Google successfully",
    user: user.toSafeObject(),
    token,
  });
});

// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists for this email, a reset link has been sent",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  res.status(200).json({
    success: true,
    message: "If an account exists for this email, a reset link has been sent",
  });
});

// @route   POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully. You can now log in.",
  });
});

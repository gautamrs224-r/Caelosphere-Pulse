import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route   POST /api/users/profile-picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file provided");
  }

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "chatsphere/profile-pictures",
    public_id: `user_${req.user._id}`,
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  req.user.profilePic = result.secure_url;
  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    profilePic: result.secure_url,
    user: req.user.toSafeObject(),
  });
});

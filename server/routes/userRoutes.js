import express from "express";
import {
  getAllUsers,
  searchUsers,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";
import { uploadProfilePicture } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllUsers);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/profile-picture", upload.single("image"), uploadProfilePicture);

export default router;

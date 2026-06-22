import express from "express";
import {
  getConversation,
  sendMessage,
  sendImageMessage,
  markAsSeen,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.get("/:userId", getConversation);
router.post("/:userId", sendMessage);
router.post("/:userId/image", upload.single("image"), sendImageMessage);
router.put("/:userId/seen", markAsSeen);

export default router;

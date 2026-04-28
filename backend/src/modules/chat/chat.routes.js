import express from "express";
import { getMyChats } from "./chat.controller.js";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

router.get(
  "/chats",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyChats,
);

export default router;

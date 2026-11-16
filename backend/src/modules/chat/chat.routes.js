/**
 * Router pro správu chatů a komunikace.
 * @module modueles/chat/chat.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";
import { getMyChats } from "./chat.controller.js";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Získání seznamu všech aktivních chatů přihlášeného uživatele.
 * Přístup omezen pouze pro administrátory a manažery.
 * @route GET /chat/chats
 */
router.get(
  "/chats",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyChats,
);

export default router;

/**
 * Router pro autentizaci a správu uživatelských účtů.
 * @module modules/auth/auth.routes
 * @returns {import('express').Router} Express router s definovanými trasami.
 */

import express from "express";
import {
  register,
  registerFull,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  fullRegisterSchema,
} from "./auth.validation.js";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";

import { checkRole } from "../../middlewares/roleMiddleware.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Registrace nového uživatele (pouze pro administrátora).
 * @route POST /api/auth/register
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN]),
  register,
);

/**
 * Kompletní registrace firmy a administrátora.
 * @route POST /api/auth/full-registration
 */
router.post(
  "/full-registration",
  validateRequest(fullRegisterSchema),
  registerFull,
);

/**
 * Přihlášení uživatele do systému.
 * @route POST /api/auth/login
 */
router.post("/login", validateRequest(loginSchema), login);

/**
 * Odhlášení uživatele a zneplatnění refresh tokenu.
 * @route POST /api/auth/logout
 */
router.post("/logout", logout);

/**
 * Obnova přístupového tokenu (Access Token) pomocí Refresh Tokenu.
 * @route GET /api/auth/refresh-token
 */
router.get("/refresh-token", refreshToken);

/**
 * Ověření e-mailové adresy uživatele přes unikátní token.
 * @route GET /api/auth/verify-email
 */
router.get("/verify-email", verifyEmail);

/**
 * Znovuodeslání verifikačního e-mailu.
 * @route POST /api/auth/resend-verification-email
 */
router.post("/resend-verification-email", resendVerificationEmail);

/**
 * Žádost o resetování zapomenutého hesla.
 * @route POST /api/auth/forgot-password
 */
router.post("/forgot-password", forgotPassword);

/**
 * Nastavení nového hesla pomocí tokenu z e-mailu.
 * @route POST /api/auth/reset-password
 */
router.post("/reset-password", resetPassword);

export default router;

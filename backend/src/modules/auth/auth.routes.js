import express from "express";

// Require to auth controllers.
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

router.post(
  "/register",
  validateRequest(registerSchema),
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  register,
);

router.post(
  "/full-registration",
  validateRequest(fullRegisterSchema),
  registerFull,
);

router.post("/login", validateRequest(loginSchema), login);

router.post("/logout", logout);

router.get("/refresh-token", refreshToken);

router.get("/verify-email", verifyEmail);

router.post("/resend-verification-email", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;

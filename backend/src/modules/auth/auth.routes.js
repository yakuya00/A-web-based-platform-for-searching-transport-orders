import express from "express";

// Require to auth controllers.
import { register, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register",
    validateRequest(registerSchema),
    register);

router.post("/login", 
    validateRequest(loginSchema),
    login);

router.get("/verify-email",
    verifyEmail);

router.post("/resend-verification-email",
    resendVerificationEmail);

router.post("/forgot-password",
    forgotPassword);

router.post("/reset-password",
    resetPassword); 

export default router;
const express = require("express");

// Require to auth controllers.
const authController = require("./auth.controller");
const validateRequest = require("../../middlewares/validateRequest");
const { registerSchema, loginSchema } = require("./auth.validation");

const router = express.Router();

router.post("/register",
    validateRequest(registerSchema),
    authController.register);

router.post("/login", 
    validateRequest(loginSchema),
    authController.login);

router.get("/verify-email", authController.verifyEmail);
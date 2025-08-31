import asyncHandler from "express-async-handler";
import createError from "http-errors";

import pool from "../../config/db.js";
import { comparePasswords, generateUserToken, hashPassword } from "../../utils/auth.js";
import { generateRandomToken } from "../../utils/token.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";

const EMAIL_VERIFICATION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const RESET_PASSWORD_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0){
        throw createError(404, "User not found");
    }

    //2. Compare password
    const user = result.rows[0];
    const isPasswordValid = await comparePasswords(password, user?.password_hash);
    
    if(!isPasswordValid) {
        throw createError(401, "Incorrect password");
    }

    // 3. Generate and return token
    const token = generateUserToken(user);
    res.status(200).json({ token });
});

export const register = asyncHandler(async(req, res, next) => {
    const { name, surname, birthday, phone, email, password, company_id, role_id } = req.body;

    if(!name || !surname || !birthday || !phone || !email || !password || !company_id || !role_id) {
        throw createError(400, "Some required fields are missing");
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(existingUser.rows.length > 0) {
        throw createError(409, "Email already in use");
    }

    const hashedPassword = await hashPassword(password);
    const token = generateRandomToken();
    const verificationTokenExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);

    await pool.query("INSERT INTO users (name, surname, birthday, phone, email, password_hash, verification_token, verification_token_expires_at, company_id, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *", [name, surname, birthday, phone, email, hashedPassword, token, verificationTokenExpiresAt, company_id, role_id]);

    await sendVerificationEmail(email, token);

    res.status(201).json({
        message: "Registration is succesfully",
        error: false
    });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
    const token = req?.query.token;

    if(!token) {
        throw createError(400, "Token is required");
    }

    const result = await pool.query(
        `UPDATE users
         SET is_verified = TRUE,
             verification_token = NULL,
             verification_token_expires_at = NULL
         WHERE verification_token = $1
           AND verification_token_expires_at > NOW()
           AND is_verified = FALSE
         RETURNING id, email, is_verified`,
        [token]
    );

    if (result.rows.length === 0){
        throw createError(400, "Invalid or expired token");
    }

    res.status(200).json({
        message: "Email verified succesfully",
        error: false
    });
});

export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw createError(400, "Email is required");
    }
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(result.rows.length === 0) {
        throw createError(404, "User not found");
    }
    const user = result.rows[0];
    if(user.is_verified){
        throw createError(400, "User already verified");
    }
    const token = generateRandomToken();
    const verificationTokenExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);

    await pool.query(`
        UPDATE users
        SET verification_token = $1,
            verification_token_expires_at = $2
        WHERE id = $3`, [token, verificationTokenExpiresAt, user.id]);
    
    await sendVerificationEmail(email, token);

    res.status(200).json({
        message: "Verification email resent successfully",
        error: false
    });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw createError(400, "Email is required");
    }
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(result.rows.length === 0) {
        throw createError(404, "User not found");
    }
    const user = result.rows[0];
    const token = generateRandomToken();
    const resetTokenExpiresAt = new Date(Date.now() + RESET_PASSWORD_EXPIRATION_TIME);

    await pool.query(`
        UPDATE users
        SET reset_password_token = $1,
            reset_password_token_expires_at = $2
        WHERE id = $3`, [token, resetTokenExpiresAt, user.id]);
    
    await sendPasswordResetEmail(email, token);

    res.status(200).json({
        message: "Reset password email sent successfully",
        error: false
    });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token, password } = req?.body;
    if(!token || !password) {
        throw createError(400, "Missing token or password");
    }
    const result = await pool.query(`
        SELECT * 
        FROM users 
        WHERE reset_password_token = $1
        AND reset_password_token_expires_at > NOW()`, [token]);
    if(result.rows.length === 0) {
        throw createError(400, "Invalid or expired token");
    }

    if(!password) {
        throw createError(400, "Password is required");
    }
    const hashedPassword = await hashPassword(password);
    const user = result.rows[0];
    await pool.query(`
        UPDATE users
        SET password_hash = $1,
            reset_password_token = NULL,
            reset_password_token_expires_at = NULL
        WHERE id = $2`, [hashedPassword, user.id]);

    res.status(200).json({
        message: "Password reset successfully",
        error: false
    });
});
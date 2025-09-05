import asyncHandler from "express-async-handler";
import createError from "http-errors";

import pool from "../../config/db.js";
import { runTransaction } from "../../utils/dbUtils.js";
import { comparePasswords, generateUserToken, hashPassword, getUserByEmail, validateUser, createAndInsertUserToken } from "../../utils/auth.js";
import { generateRandomToken, hashToken } from "../../utils/token.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";


export const PURPOSES = {
  EMAIL_VERIFICATION: 1,
  PASSWORD_RESET: 2,
  REFRESH_TOKEN: 3,
};

const EMAIL_VERIFICATION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const RESET_PASSWORD_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await validateUser(email, { mustExist: true })
    //2. Compare password
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

    await validateUser(email, { mustNotExist: true });

    const hashedPassword = await hashPassword(password);
    const user = await runTransaction(async (client) => {
        const { rows: [user] } = await client.query(`
            INSERT INTO users (name, surname, birthday, phone, email, password_hash, company_id, role_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id,email`,
            [name, surname, birthday, phone, email, hashedPassword, company_id, role_id]);
        const token = await createAndInsertUserToken(user.id, PURPOSES.EMAIL_VERIFICATION, EMAIL_VERIFICATION_EXPIRATION_TIME, req, client);
        return { email: user.email, verificationToken: token };
    });

    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(201).json({
        message: "Registration is succesfully",
        error: false
    });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
    const token = req?.query?.token;
    
    if(!token) {
        throw createError(400, "Token is required");
    }
    const hashedToken = hashToken(token);
    const { rows: [user] } = await pool.query(`
        WITH verified_token AS (
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE token_hash = $1
            AND purpose_id = $2
            AND expires_at > NOW()
            RETURNING user_id)
        UPDATE users
        SET is_verified = TRUE
        WHERE id IN (SELECT user_id FROM verified_token)
        RETURNING *`,
        [hashedToken, PURPOSES.EMAIL_VERIFICATION]);

    if (!user){
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

    const user = await validateUser(email, { mustExist: true, mustNotBeVerified: true});

    const verificationToken = await createAndInsertUserToken(
        user.id, 
        PURPOSES.EMAIL_VERIFICATION, 
        EMAIL_VERIFICATION_EXPIRATION_TIME, 
        req, 
        pool);

    await sendVerificationEmail(email, verificationToken);

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

    const user = await validateUser(email, { mustExist: true });

    const resetToken = await createAndInsertUserToken(
        user.id, 
        PURPOSES.PASSWORD_RESET, 
        RESET_PASSWORD_EXPIRATION_TIME, 
        req, 
        pool);

    await sendPasswordResetEmail(email, resetToken);

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
    const hashedToken = hashToken(token);
    const hashedPassword = await hashPassword(password);

    await runTransaction(async (client) => {
        const { rows: [tokenRow] } = await client.query(`
            SELECT * 
            FROM user_tokens 
            WHERE token_hash = $1
            AND purpose_id = $2
            AND expires_at > NOW()
            AND consumed_at IS NULL`,
            [hashedToken, PURPOSES.PASSWORD_RESET]);
        
        if(!tokenRow) {
            throw createError(400, "Invalid or expired token");
        }

        await client.query(`
            UPDATE users
            SET password_hash = $1
            WHERE id = $2`,
            [hashedPassword, tokenRow.user_id]);

        await client.query(`
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE id = $1`,
            [tokenRow.id]);
    });
    

    res.status(200).json({
        message: "Password reset successfully",
        error: false
    });
});
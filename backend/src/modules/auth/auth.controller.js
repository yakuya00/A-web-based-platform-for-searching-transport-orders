import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {sql} from "slonik";

import pool from "../../config/db.js";
import { comparePasswords, generateUserToken, hashPassword } from "../../utils/auth.js";
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

    // 1. Find user by email
    const user = await pool.maybeOne(sql`SELECT * FROM users WHERE email = ${email}`);
    if (!user){
        throw createError(404, "User not found");
    }

    const isPasswordValid = await comparePasswords(password, user.password_hash);
    
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
    const existingUser = await pool.maybeOne(sql`SELECT * FROM users WHERE email = ${email}`);
    if(existingUser) {
        throw createError(409, "Email already in use");
    }
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);
    const metadata = {
        id: req.ip,
        userAgent: req.headers["user-agent"]
    };
    const user = await pool.transaction(async(trx) => {
        const user = await trx.one(sql`
            INSERT INTO users 
            (name, surname, birthday, phone, email, password_hash, company_id, role_id) 
            VALUES (${name}, ${surname}, ${birthday}, ${phone}, ${email}, ${hashedPassword}, ${company_id}, ${role_id}) 
            RETURNING id, email`);
        await trx.query(sql`
            INSERT INTO user_tokens
            (user_id, purpose_id, token_hash, expires_at, metadata)
            VALUES (${user.id}, ${PURPOSES.EMAIL_VERIFICATION}, ${hashedVerificationToken}, ${verificationTokenExpiresAt}, ${sql.json(metadata)})`);
        return user;
    });

    await sendVerificationEmail(user.email, verificationToken);

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
    const result = await pool.maybeOne(sql`
        WITH verified_token AS (
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE token_hash = ${hashedToken}
            AND purpose_id = ${PURPOSES.EMAIL_VERIFICATION}
            AND expires_at > NOW()
            RETURNING user_id)
        UPDATE users
        SET is_verified = TRUE
        WHERE id IN (SELECT user_id FROM verified_token)
        RETURNING *`);

    if (!result){
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
    const user = await pool.maybeOne(sql`SELECT * FROM users WHERE email = ${email}`);
    if(!user) {
        throw createError(404, "User not found");
    }
    if(user.is_verified){
        throw createError(400, "User already verified");
    }

    const verificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);
    const metadata = {
        id: req.ip,
        userAgent: req.headers["user-agent"]
    };

    await pool.query(sql`
        INSERT INTO user_tokens
        (user_id, purpose_id, token_hash, expires_at, metadata)
        VALUES (${user.id}, ${PURPOSES.EMAIL_VERIFICATION}, ${hashedVerificationToken}, ${verificationTokenExpiresAt}, ${sql.json(metadata)})`);
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
    const user = await pool.maybeOne(sql`SELECT * FROM users WHERE email = ${email}`);
    if(!user) {
        throw createError(404, "User not found");
    }

    const resetToken = generateRandomToken();
    const hashedResetToken = hashToken(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + RESET_PASSWORD_EXPIRATION_TIME);
    const metadata = {
        id: req.ip,
        userAgent: req.headers["user-agent"]
    };
    await pool.query(sql`
        INSERT INTO user_tokens
        (user_id, purpose_id, token_hash, expires_at, metadata)
        VALUES (${user.id}, ${PURPOSES.PASSWORD_RESET}, ${hashedResetToken}, ${resetTokenExpiresAt}, ${sql.json(metadata)})`);

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

    await pool.transaction(async (trx) => {
        const tokenRow = await trx.maybeOne(sql`
            SELECT * 
            FROM user_tokens 
            WHERE token_hash = ${hashedToken}
            AND purpose_id = ${PURPOSES.PASSWORD_RESET}
            AND expires_at > NOW()
            AND consumed_at IS NULL`);

        if(!tokenRow) {
            throw createError(400, "Invalid or expired token");
        }
        
        await trx.query(sql`
            UPDATE users
            SET password_hash = ${hashedPassword}
            WHERE id = ${tokenRow.user_id}`);

        await trx.query(sql`
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE id = ${tokenRow.id}`);
    });
    

    res.status(200).json({
        message: "Password reset successfully",
        error: false
    });
});
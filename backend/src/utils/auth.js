import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";

import pool from "../config/db.js"

import { generateRandomToken, hashToken } from "./token.js";

const SALT_ROUND = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export const comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
} 

export const generateUserToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });    
};

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUND); 
};

export const getUserByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
};

export const validateUser = async (
    email,
    {
        mustExist = false,
        mustNotExist = false,
        mustBeVerified = false,
        mustNotBeVerified = false,
        returnUser = true
    }) => {
    if (!email) {
        throw createError(400, "Email is required");
    }

    const user = await getUserByEmail(email);

    if (mustExist && !user) {
        throw createError(404, "User not found");
    }

    if (mustNotExist && user) {
        throw createError(409, "Email already in use");
    }

    if (mustBeVerified && user && !user.is_verified) {
        throw createError(400, "User is not verified");
    }

    if (mustNotBeVerified && user && user.is_verified) {
        throw createError(400, "User already verified");
    }

    return returnUser ? user : undefined;
};

export const createAndInsertUserToken = async (userId, purpose, expiresInMs, req, client) => {
    const verificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + expiresInMs);
    const metadata = {
        id: req.ip,
        userAgent: req.headers["user-agent"]
    };

    await client.query(`
        INSERT INTO user_tokens 
        (user_id, purpose_id, token_hash, expires_at, metadata)
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, purpose, hashedVerificationToken, verificationTokenExpiresAt, metadata]);

    return verificationToken;
};
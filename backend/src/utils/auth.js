import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";

import pool from "../config/db.js"

import { generateRandomToken, hashToken } from "./token.js";

const SALT_ROUND = 10;
const JWT_ACCESS_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_SECRET;

export const comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
} 

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "30d" });    
};

export const generateRefreshToken = (playload) => {
    return jwt.sign(playload, JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUND); 
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

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
    console.log(user);

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

export const setRefreshTokenCookie = (res, refreshToken, maxAge) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge
    });
};
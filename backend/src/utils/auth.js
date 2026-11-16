/**
 * Modul pro autentizaci a autorizaci.
 * Zajišťuje hašování hesel, generování JWT tokenů a validaci uživatelských stavů.
 * @module utils/auth
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";
import pool from "../config/db.js";
import { generateRandomToken, hashToken } from "./token.js";

const SALT_ROUND = 10;
const JWT_ACCESS_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_SECRET;

/**
 * Porovná heslo v čisté podobě s jeho zahašovanou verzí z DB.
 * @param {string} password - Heslo od uživatele.
 * @param {string} hashedPassword - Haš z databáze.
 * @returns {Promise<boolean>} True, pokud se hesla shodují.
 */
export const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Vygeneruje krátkodobý Access Token (JWT).
 * @param {Object} payload - Data k zakódování (id, role, company_id).
 * @returns {string} JWT token.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "30d" });
};

/**
 * Vygeneruje Refresh Token pro obnovu sezení.
 * @param {Object} payload - Data uživatele.
 * @returns {string} JWT token.
 */
export const generateRefreshToken = (playload) => {
  return jwt.sign(playload, JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

/**
 * Vytvoří bezpečný haš hesla před uložením do DB.
 * @param {string} password - Čisté heslo.
 * @returns {Promise<string>} Zahašované heslo.
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUND);
};

/**
 * Ověří platnost a integritu JWT tokenu.
 * @param {string} token - Token k ověření.
 * @returns {Object} Dekódovaný payload.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Vyhledá aktivního uživatele v databázi podle e-mailu.
 * @param {string} email - E-mail uživatele.
 * @returns {Promise<Object|null>} Objekt uživatele včetně role firmy.
 */
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `
        SELECT 
            u.*, 
            c.role_id as company_role_id
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.email = $1
        AND u.is_active
    `,
    [email],
  );
  return result.rows[0] || null;
};

/**
 * Komplexní validátor uživatele před provedením citlivých operací (login, registrace, verifikace).
 * @param {string} email - E-mail k prověření.
 * @param {Object} options - Konfigurace validace (mustExist, mustBeVerified, atd.).
 * @returns {Promise<Object|undefined>} Vrací objekt uživatele, pokud je returnUser true.
 * @throws {HttpError} 400, 404 nebo 409 podle výsledku validace.
 */
export const validateUser = async (
  email,
  {
    mustExist = false,
    mustNotExist = false,
    mustBeVerified = false,
    mustNotBeVerified = false,
    returnUser = true,
  },
) => {
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

/**
 * Nastaví HTTP-only cookie pro Refresh Token (bezpečnostní standard proti XSS).
 * @param {import('express').Response} res - Express Response objekt.
 * @param {string} refreshToken - JWT refresh token.
 * @param {number} maxAge - Doba platnosti cookie v milisekundách.
 */
export const setRefreshTokenCookie = (res, refreshToken, maxAge) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge,
  });
};

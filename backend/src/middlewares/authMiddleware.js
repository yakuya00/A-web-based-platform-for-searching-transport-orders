/**
 * ====================================================
 * Middleware: Authentication Check
 * Czech: Ověření identity uživatele pomocí JWT.
 * ====================================================
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { verifyToken } from "../utils/auth.js";

/**
 * Middleware pro validaci přístupového tokenu v HTTP hlavičce.
 * @param {import('express').Request} req - Express request objekt.
 * @param {import('express').Response} res - Express response objekt.
 * @param {import('express').NextFunction} next - Funkce pro předání řízení dalšímu middleware.
 * @throws {HttpError} 401 - Vyvolána, pokud token chybí, je neplatný nebo expirovaný.
 */
export const checkAuthentication = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw createError(401, "No token provided");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw createError(401, "Invalid token");
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    throw createError(401, err);
  }
});

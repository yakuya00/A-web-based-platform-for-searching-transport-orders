import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { verifyToken } from "../utils/auth.js";

export const checkAuthentication = asyncHandler(async(req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        throw createError(401, "No token provided")
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw createError(401, "Invalid token");
    }
    try {
        const playload = verifyToken(token);
        req.user = playload;
        next();
    } catch (err) {
        throw createError(401, err);
    }
});


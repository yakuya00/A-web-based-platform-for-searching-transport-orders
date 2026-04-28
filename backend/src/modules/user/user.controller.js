import asyncHandler from "express-async-handler";
import createError from "http-errors";

import { 
    getUserById,
    getUserRoles,
    getAllUsersByCompany} from "./user.repository.js";

export const getMe = asyncHandler(async (req, res, next) => {
    if (!req.user?.id) {
        throw createError(401, "Unauthorized");
    }
    const user = await getUserById(req.user.id);
    if (!user) {
        throw createError(404, "User not found");
    }
    res.status(200).json(user);
});

export const userInfo = asyncHandler(async (req, res, next) => {
    const user = await getUserById(req.params.id);
    if (!user) {
        throw createError(404, "User not found");
    }
    res.status(200).json(user);
});

export const userRolesList = asyncHandler(async (req, res, next) => {
    const userRoles = await getUserRoles();
    if(userRoles.length === 0){
        throw createError(404, "User roles not found");
    }
    res.status(200).json(userRoles);
});

export const getAllUsersInCompany = asyncHandler(async (req, res, next) => {
    const users = await getAllUsersByCompany(req.user.company_id);
    if(users.length === 0) {
        throw createError(404, "Users not found");
    }
    res.status(200).json(users);
});

// export const changeEmail = asyncHandler(async (req, res, next) => {
//     const { email } = req.body;
//     if (!email) {
//         throw createError(400, "Email is required");
//     }
//     await updateUserEmailById(req.user.id, email, req.user.email);
//     sendVerificationEmail()
//     res.status(200).json({
//         message: "Email changed succesfully",
//         error: false
//     });
// });
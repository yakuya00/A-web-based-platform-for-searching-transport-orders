import asyncHandler from "express-async-handler";

export const checkAuthentication = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;
})
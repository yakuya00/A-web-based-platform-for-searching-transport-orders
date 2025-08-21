const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

const AppError = require("../../utils/AppError");
const pool = require("../../config/db");
const { comparePasswords, generateToken } = require("../../utils/auth");


exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.length === 0){
        throw new AppError("User not found", 404);
    }

    const user = result.rows[0];
    const isPasswordValid = comparePasswords(password, user?.password_hash);
    
    if(!isPasswordValid) {
        throw new AppError("Incorrect password", 401)
    }

    const token = generateToken(user);
    res.json({ token });
});
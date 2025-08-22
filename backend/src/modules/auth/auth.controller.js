const asyncHandler = require("express-async-handler");
const { Joi } = require("express-validator");
const { hash } = require("bcrypt");

const AppError = require("../../utils/AppError");
const pool = require("../../config/db");
const { comparePasswords, generateToken, hashPassword } = require("../../utils/auth");


exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0){
        throw new AppError("User not found", 404);
    }

    //2. Compare password
    const user = result.rows[0];
    const isPasswordValid = await comparePasswords(password, user?.password_hash);
    
    if(!isPasswordValid) {
        throw new AppError("Incorrect password", 401);
    }

    // 3. Generate and return token
    const token = generateToken(user);
    res.status(200).json({ token });
});

exports.register = asyncHandler(async(req, res, next) => {
    const { name, surname, birthday, phone, email, password, company_id, role_id } = req.body;

    if(!name || !surname || !birthday || !phone || !email || !password || !company_id || !role_id) {
        throw new AppError("Some required fields are missing", 400);
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(existingUser.rows.length > 0) {
        throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await hashPassword(password);

    await pool.query("INSERT INTO users (name, surname, birthday, phone, email, password_hash, company_id, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [name, surname, birthday, phone, email, hashedPassword, company_id, role_id]);

    res.status(201).json({
        message: "Registration is succesfully",
        error: false
    });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {

});
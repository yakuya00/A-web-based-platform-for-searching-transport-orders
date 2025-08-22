const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SALT_ROUND = 10;
const JWT_SECRET = process.env.JWT_SECRET;

exports.comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
} 

exports.generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });    
};

exports.hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUND); 
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
} 

exports.generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });    
};

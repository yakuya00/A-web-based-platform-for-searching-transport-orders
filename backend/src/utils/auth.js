import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SALT_ROUND = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export const comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
} 

export const generateUserToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });    
};

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUND); 
};
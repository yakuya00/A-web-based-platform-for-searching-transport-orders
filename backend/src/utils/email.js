import { passwordRegex } from "../config/regexConfig";

const nodemailer = require("nodemailer");

export const sendVerificationEmail = async (to, token) => {
    const generatedVerifyUrl = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    const transporter = getTransporter();

    await transporter.sendMail({
        from: `"A web-based platform for searching transport orders", ${process.env.EMAIL_USER}`,
        to,
        subject: "Verify your email!",
        html: `
            <p>Please verify your email by clicking this link:</p>
            <a href="${generatedVerifyUrl}">${generatedVerifyUrl}</a>, 
            <br>
            <br>
            <p>Regards,</p>
            <b>Yakushev Yaroslav</b>
           `,
    });
};


const getTransporter = () => {
    return nodemailer.createTransport({
        host: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD
        }
    });
};
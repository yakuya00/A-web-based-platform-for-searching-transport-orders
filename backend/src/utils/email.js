/**
 * Modul pro odesílání e-mailových notifikací a generování QR kódů pro potvrzení přepravy.
 * Využívá knihovny nodemailer pro SMTP komunikaci a qrcode pro generování vizuálních kódů.
 * @module utils/email
 */

import nodemailer from "nodemailer";
import qrcode from "qrcode";

/**
 * Odešle e-mail s odkazem pro ověření e-mailové adresy po registraci.
 * @function sendVerificationEmail
 * @param {string} to - E-mailová adresa příjemce.
 * @param {string} token - Unikátní verifikační token.
 * @returns {Promise<void>}
 */
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

/**
 * Odešle e-mail s odkazem pro obnovu zapomenutého hesla.
 * @function sendPasswordResetEmail
 * @param {string} to - E-mailová adresa uživatele.
 * @param {string} token - Token pro reset hesla.
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (to, token) => {
  const generatedResetUrl = `${process.env.FRONT_URL}/reset-password?token=${token}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"A web-based platform for searching transport orders", ${process.env.EMAIL_USER}`,
    to,
    subject: "Reset Your Password!",
    html: `
            <p>Please reset your password by clicking this link:</p>
            <a href="${generatedResetUrl}">${generatedResetUrl}</a>, 
            <br>
            <br>
            <p>Regards,</p>
            <b>Yakushev Yaroslav</b>
           `,
  });
};

/**
 * Generuje QR kód pro potvrzení vykládky a odešle jej e-mailem příjemci zásilky.
 * QR kód je vložen přímo do HTML e-mailu jako Base64 obrázek.
 * @function sendRecipientQRCode
 * @param {string} to - E-mail příjemce zásilky.
 * @param {number|string} orderId - ID zakázky pro identifikaci v předmětu.
 * @param {string} token - Unikátní token, který řidič naskenuje pro potvrzení doručení.
 * @returns {Promise<void>}
 */
export const sendRecipientQRCode = async (to, orderId, token) => {
  const confirmToken = `${token}`;

  const qrCodeDataToken = await qrcode.toDataURL(confirmToken, {
    width: 250,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"LOGIX" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Potvrzení vykládky pro zásilku #${orderId}`,
    html: `
        <div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Dobrý den,</h2>
          
          <p style="font-size: 16px; line-height: 1.5;">
            K Vaší adrese právě směřuje zásilka <b>#${orderId}</b>. 
            Pro rychlé a bezkontaktní potvrzení převzetí zboží prosím při vykládce ukažte řidiči tento QR kód:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <img src="${qrCodeDataToken}" alt="QR Kód pro potvrzení" style="border: 2px solid #f3f4f6; border-radius: 12px; padding: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">(Dejte řidiči naskenovat tento kód)</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          
          <p style="font-size: 14px; color: #6b7280;">S pozdravem,<br><b>Tým LOGIX.</b></p>
        </div>
      `,
  });
};

/**
 * Vytvoří a nakonfiguruje transporter pro odesílání e-mailů.
 * Podporuje Mailpit pro vývoj i reálné SMTP servery pro produkci.
 * @function getTransporter
 * @returns {import('nodemailer').Transporter}
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "mailpit",
    port: parseInt(process.env.EMAIL_PORT) || 1025,
    secure: false,
    auth:
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          }
        : null,
  });
};

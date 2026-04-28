import asyncHandler from "express-async-handler";
import createError from "http-errors";

import pool from "../../config/db.js";
import { runTransaction, insertLocation } from "../../utils/dbUtils.js";
import {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  getUserByEmail,
  validateUser,
  setRefreshTokenCookie,
} from "../../utils/auth.js";
import { generateRandomToken, hashToken } from "../../utils/token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../utils/email.js";
import {
  insertRefreshToken,
  deleteRefreshToken,
  createUser,
  createAndInsertUserToken,
  selectRefreshToken,
  updateRefreshToken,
  verifyEmailByToken,
  selectUserToken,
  updateUserPassword,
  markTokenAsConsumed,
} from "./auth.repository.js";
import {
  insertCompany,
  insertCompanyIdentifier,
  insertCompanyAddress,
} from "../company/company.repository.js";
import { jwt } from "zod";

export const PURPOSES = {
  EMAIL_VERIFICATION: 1,
  PASSWORD_RESET: 2,
};

const EMAIL_VERIFICATION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const RESET_PASSWORD_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // const user = await validateUser(email);
  const user = await getUserByEmail(email);

  const authError = createError(401, "Incorrect login or password");

  if (!user) {
    throw authError;
  }
  //2. Compare password
  const isPasswordValid = await comparePasswords(password, user?.password_hash);

  if (!isPasswordValid) {
    throw authError;
  }

  // 3. Generate and return token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRATION_TIME,
  );
  const metadata = {
    id: req.ip,
    userAgent: req.headers["user-agent"],
  };

  await insertRefreshToken(
    user.id,
    hashToken(refreshToken),
    metadata,
    refreshTokenExpiresAt,
  );
  setRefreshTokenCookie(res, refreshToken, REFRESH_TOKEN_EXPIRATION_TIME);
  res.status(200).json({ accessToken });
});

export const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await deleteRefreshToken(hashToken(refreshToken));
  }

  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "Logged out",
    error: false,
  });
});

export const register = asyncHandler(async (req, res, next) => {
  const { name, surname, birthday, phone, email, password, role_id } = req.body;
  console.log(req.user);
  const company_id = req.user.company_id;

  await validateUser(email, { mustNotExist: true });

  const hashedPassword = await hashPassword(password);
  const user = await runTransaction(async (client) => {
    const user = await createUser(
      name,
      surname,
      birthday,
      phone,
      email,
      hashedPassword,
      company_id,
      role_id,
      client,
    );
    const token = await createAndInsertUserToken(
      req,
      user.id,
      PURPOSES.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_EXPIRATION_TIME,
      client,
    );

    return { email: user.email, verificationToken: token };
  });

  await sendVerificationEmail(user.email, user.verificationToken);

  res.status(201).json({
    message: "Registration is succesfully",
    error: false,
  });
});

export const registerFull = asyncHandler(async (req, res, next) => {
  const {
    company_name,
    company_role_id,
    identifiers,
    addresses,
    name,
    surname,
    birthday,
    phone,
    email,
    password,
    company_id,
    role_id,
  } = req.body;
  //console.log(addresses);
  await validateUser(email, { mustNotExist: true });

  const hashedPassword = await hashPassword(password);
  const user = await runTransaction(async (client) => {
    const company = await insertCompany(company_name, company_role_id, client);
    console.log(company.id);
    if (identifiers && identifiers.length > 0) {
      for (const { identifier_type_id, identifier_value } of identifiers) {
        await insertCompanyIdentifier(
          company.id,
          identifier_type_id,
          identifier_value,
          client,
        );
      }
    }

    if (addresses && addresses.length > 0) {
      for (const { address_type_id, nominatium_data } of addresses) {
        console.log(nominatium_data);
        const address_id = await insertLocation(nominatium_data, client);
        console.log(address_type_id);
        await insertCompanyAddress(
          company.id,
          address_id,
          address_type_id,
          client,
        );
      }
    }
    const user = await createUser(
      name,
      surname,
      birthday,
      phone,
      email,
      hashedPassword,
      company.id,
      role_id,
      client,
    );
    const token = await createAndInsertUserToken(
      req,
      user.id,
      PURPOSES.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_EXPIRATION_TIME,
      client,
    );

    return { email: user.email, verificationToken: token };
  });
  await sendVerificationEmail(user.email, user.verificationToken);

  res.status(201).json({
    message: "Registration is succesfully",
    error: false,
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw createError(401, "No refresh token");
  }

  const result = await selectRefreshToken(hashToken(refreshToken));

  if (result.rowCount === 0) {
    throw createError(403, "Invalid refresh token");
  }

  const { exp, iat, ...rest } = verifyToken(refreshToken);
  console.log(rest);
  const accessToken = generateAccessToken(rest);
  const newRefreshToken = generateRefreshToken(rest);
  const newRefreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRATION_TIME,
  );
  await updateRefreshToken(
    hashToken(newRefreshToken),
    newRefreshTokenExpiresAt,
    rest.id,
    hashToken(refreshToken),
  );
  setRefreshTokenCookie(res, newRefreshToken, REFRESH_TOKEN_EXPIRATION_TIME);
  res.status(200).json({ accessToken });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req?.query?.token;

  if (!token) {
    throw createError(400, "Token is required");
  }
  const user = await verifyEmailByToken(
    hashToken(token),
    PURPOSES.EMAIL_VERIFICATION,
  );

  if (!user) {
    throw createError(400, "Invalid or expired token");
  }

  res.status(200).json({
    message: "Email verified succesfully",
    error: false,
  });
});

export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw createError(400, "Email is required");
  }

  const user = await validateUser(email, {
    mustExist: true,
    mustNotBeVerified: true,
  });

  const verificationToken = await createAndInsertUserToken(
    req,
    user.id,
    PURPOSES.EMAIL_VERIFICATION,
    EMAIL_VERIFICATION_EXPIRATION_TIME,
  );

  await sendVerificationEmail(email, verificationToken);

  res.status(200).json({
    message: "Verification email resent successfully",
    error: false,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw createError(400, "Email is required");
  }

  const user = await validateUser(email, { mustExist: true });

  const resetToken = await createAndInsertUserToken(
    req,
    user.id,
    PURPOSES.PASSWORD_RESET,
    RESET_PASSWORD_EXPIRATION_TIME,
  );

  await sendPasswordResetEmail(email, resetToken);

  res.status(200).json({
    message: "Reset password email sent successfully",
    error: false,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req?.body;
  if (!token || !password) {
    throw createError(400, "Missing token or password");
  }
  const hashedToken = hashToken(token);
  const hashedPassword = await hashPassword(password);

  await runTransaction(async (client) => {
    const tokenRow = await selectUserToken(
      hashedToken,
      PURPOSES.PASSWORD_RESET,
      client,
    );
    if (!tokenRow) {
      throw createError(400, "Invalid or expired token");
    }
    await updateUserPassword(hashedPassword, tokenRow.user_id, client);
    await markTokenAsConsumed(tokenRow.id, client);
  });

  res.status(200).json({
    message: "Password reset successfully",
    error: false,
  });
});

/**
 * Repository pro přímou komunikaci s databází v rámci autentizace.
 * @module modules/auth/auth.repository
 */

import pool from "../../config/db.js";

import { generateRandomToken, hashToken } from "../../utils/token.js";

/**
 * Pomocná funkce pro určení, zda použít pool nebo existující klientskou transakci.
 * @param {Object} client - Volitelný databázový klient z transakce.
 */
const getClient = (client) => client || pool;

/**
 * Vloží nový refresh token do databáze.
 * @param {number} userId - ID uživatele.
 * @param {string} hashedRefreshToken - Zahashovaný token.
 * @param {Object} metadata - Metadata o zařízení a IP adrese.
 * @param {Date} refreshTokenExpiresAt - Datum expirace.
 * @param {Object} [client] - DB klient.
 * @returns {Promise<Object>} Vložený token.
 */
export const insertRefreshToken = async (
  userId,
  hashedRefreshToken,
  metadata,
  refreshTokenExpiresAt,
  client = null,
) => {
  const db = getClient(client);

  const {
    rows: [token],
  } = await db.query(
    `
        INSERT INTO refresh_tokens 
        (user_id, token_hash, metadata, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, expires_at`,
    [userId, hashedRefreshToken, metadata, refreshTokenExpiresAt],
  );

  return token;
};

/**
 * Smaže refresh token (používá se při logoutu).
 * @param {string} hashedRefreshToken - Hash tokenu ke smazání.
 */
export const deleteRefreshToken = async (hashedRefreshToken, client = null) => {
  const db = getClient(client);
  await db.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [
    hashedRefreshToken,
  ]);
};

/**
 * Vytvoří nového uživatele v databázi.
 * @returns {Promise<Object>} Vytvořený uživatel (id, email).
 */
export const createUser = async (
  name,
  surname,
  birthday,
  phone,
  email,
  hashedPassword,
  company_id,
  role_id,
  client = null,
) => {
  const db = getClient(client);
  const {
    rows: [user],
  } = await db.query(
    `
        INSERT INTO users (name, surname, birthday, phone, email, password_hash, company_id, role_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email`,
    [
      name,
      surname,
      birthday,
      phone,
      email,
      hashedPassword,
      company_id,
      role_id,
    ],
  );
  return user;
};

/**
 * Vygeneruje a uloží jednorázový token (verifikace emailu, reset hesla).
 * @returns {Promise<string>} Původní (nezahashovaný) token pro odeslání emailem.
 */
export const createAndInsertUserToken = async (
  req,
  userId,
  purpose,
  expiresInMs,
  client = null,
) => {
  const db = getClient(client);

  const verificationToken = generateRandomToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const verificationTokenExpiresAt = new Date(Date.now() + expiresInMs);
  const metadata = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };

  await db.query(
    `
        INSERT INTO user_tokens 
        (user_id, purpose_id, token_hash, expires_at, metadata)
        VALUES ($1, $2, $3, $4, $5)`,
    [
      userId,
      purpose,
      hashedVerificationToken,
      verificationTokenExpiresAt,
      metadata,
    ],
  );

  return verificationToken;
};

/**
 * Vyhledá refresh token v databázi podle jeho hashe.
 * @param {string} hashedRefreshToken - Hash tokenu k vyhledání.
 * @param {Object} [client] - DB klient pro transakci.
 * @returns {Promise<Object>} Výsledek dotazu (result object).
 */
export const selectRefreshToken = async (hashedRefreshToken, client = null) => {
  const db = getClient(client);

  const result = await db.query(
    `
        SELECT * 
        FROM refresh_tokens
        WHERE token_hash = $1`,
    [hashedRefreshToken],
  );

  return result;
};

/**
 * Aktualizuje existující refresh token (používá se při rotaci tokenů).
 * @param {string} hashedRefreshToken - Nový hash tokenu.
 * @param {Date} refreshTokenExpiresAt - Nové datum expirace.
 * @param {number} userId - ID uživatele.
 * @param {string} oldHashedRefreshToken - Starý hash tokenu pro ověření.
 */
export const updateRefreshToken = async (
  hashedRefreshToken,
  refreshTokenExpiresAt,
  userId,
  oldHashedRefreshToken,
  client = null,
) => {
  const db = getClient(client);

  await db.query(
    `
        UPDATE refresh_tokens 
        SET token_hash = $1, 
            expires_at = $2 
        WHERE user_id = $3
        AND token_hash = $4
        `,
    [hashedRefreshToken, refreshTokenExpiresAt, userId, oldHashedRefreshToken],
  );
};

/**
 * Ověří email uživatele pomocí tokenu (Atomic Update).
 * @param {string} hashedToken - Hash tokenu.
 * @param {number} purpose - Účel tokenu (PURPOSES.EMAIL_VERIFICATION).
 * @returns {Promise<Object>} Aktualizovaný uživatel.
 */
export const verifyEmailByToken = async (
  hashedToken,
  purpose,
  client = null,
) => {
  const db = getClient(client);

  const {
    rows: [user],
  } = await db.query(
    `
        WITH verified_token AS (
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE token_hash = $1
            AND purpose_id = $2
            AND expires_at > NOW()
            RETURNING user_id)
        UPDATE users
        SET is_verified = TRUE
        WHERE id IN (SELECT user_id FROM verified_token)
        RETURNING *`,
    [hashedToken, purpose],
  );
  return user;
};

/**
 * Vyhledá platný (neexpirovaný a nepoužitý) uživatelský token.
 * @returns {Promise<Object|null>} Row z tabulky user_tokens.
 */
export const selectUserToken = async (hashedToken, purpose, client = null) => {
  const db = getClient(client);

  const {
    rows: [tokenRow],
  } = await db.query(
    `
        SELECT * 
        FROM user_tokens 
        WHERE token_hash = $1
        AND purpose_id = $2
        AND expires_at > NOW()
        AND consumed_at IS NULL`,
    [hashedToken, purpose],
  );
  return tokenRow;
};

/**
 * Změní heslo uživatele v databázi.
 * @param {string} hashedPassword - Nový hash hesla.
 * @param {number} userId - ID uživatele.
 */
export const updateUserPassword = async (
  hashedPassword,
  userId,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2`,
    [hashedPassword, userId],
  );
};

/**
 * Označí token jako použitý.
 * @param {number} tokenId - ID tokenu.
 */
export const markTokenAsConsumed = async (tokenId, client = null) => {
  const db = getClient(client);
  await db.query(
    `
        UPDATE user_tokens
        SET consumed_at = NOW()
        WHERE id = $1`,
    [tokenId],
  );
};

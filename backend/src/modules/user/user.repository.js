/**
 * Repository pro přímou práci s databází uživatelů.
 * Obsahuje optimalizované dotazy pro řazení zaměstnanců a kontrolu integrity dat.
 * @module modules/user/user.repository
 */

import pool from "../../config/db.js";

const getClient = (client) => client || pool;

/**
 * Načte detail uživatele včetně informací o jeho firmě a roli.
 * @param {number} userId - ID uživatele.
 * @returns {Promise<Object|null>} Objekt uživatele.
 */
export const getUserById = async (userId, client = null) => {
  const db = getClient(client);
  const {
    rows: [user],
  } = await db.query(
    `
    SELECT u.id, u.name, u.surname, u.birthday, u.phone, u.email, u.is_verified, u.created_at, u.role_id,
    c.name AS company_name,
    c.id as company_id,
    c.role_id AS company_role_id,
    r.name AS role_name 
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    LEFT JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = $1`,
    [userId],
  );
  return user;
};

/**
 * Aktualizuje e-mailovou adresu uživatele s ověřením starého e-mailu (bezpečnostní pojistka).
 * @param {number} userId - ID uživatele.
 * @param {string} newEmail - Nový e-mail.
 * @param {string} oldEmail - Současný e-mail pro ověření.
 */
export const updateUserEmailById = async (
  userId,
  newEmail,
  oldEmail,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        UPDATE users
        SET email = $1
        WHERE id = $2
        AND email = $3
    `,
    [newEmail, userId, oldEmail],
  );
};

/**
 * Načte číselník všech uživatelských rolí.
 * @returns {Promise<Array>} Pole rolí (id, name).
 */
export const getUserRoles = async (client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(`
        SELECT id, name
        FROM user_roles
    `);
  return rows;
};

/**
 * Získá seznam všech aktivních uživatelů firmy se specifickým řazením dle hierarchie.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Seřazený seznam uživatelů.
 */
export const getAllUsersByCompany = async (companyId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
        SELECT 
            u.id, 
            u.name, 
            u.surname, 
            u.email, 
            u.phone,
            u.role_id,
            r.name AS role_name
        FROM users u
        LEFT JOIN user_roles r ON u.role_id = r.id
        WHERE u.is_active = true
        AND u.company_id = $1
        ORDER BY 
            CASE r.name 
                WHEN 'Admin' THEN 1
                WHEN 'Manager' THEN 2
                WHEN 'Driver' THEN 3
                ELSE 4
            END ASC,
            u.surname ASC, 
            u.name ASC
    `,
    [companyId],
  );
  return rows;
};

/**
 * Prověří, zda je řidič aktuálně přiřazen k nějaké jízdní soupravě.
 * @param {number} userId - ID řidiče.
 * @returns {Promise<boolean>} True, pokud je řidič v aktivní vazbě.
 */
export const isDriverLinkedToComposition = async (userId, client = null) => {
  const db = getClient(client);

  const { rows } = await db.query(
    `
    SELECT EXISTS (
      SELECT 1 
      FROM vehicle_compositions 
      WHERE driver_id = $1
    ) AS is_linked;
  `,
    [userId],
  );

  return rows[0].is_linked;
};

/**
 * Logicky deaktivuje uživatele v systému.
 * @param {number} userId - ID uživatele.
 */
export const updateUserIsActiveByUserId = async (userId, client = null) => {
  const db = getClient(client);
  await db.query(
    `
        UPDATE users
        SET is_active = false
        WHERE id = $1
    `,
    [userId],
  );
};

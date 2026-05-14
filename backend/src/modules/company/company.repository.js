/**
 * Repository pro přímou práci s databází firem, jejich adres a personálu.
 * @module modules/company/repository
 */

import pool from "../../config/db.js";

const getClient = (client) => client || pool;

/**
 * Vloží základní údaje o firmě do databáze.
 * @param {string} name - Název firmy.
 * @param {number} roleId - ID role (Dopravce, Odesílatel, atd.).
 * @returns {Promise<Object>} Vytvořený záznam firmy.
 */
export const insertCompany = async (name, roleId, client = null) => {
  const db = getClient(client);
  const {
    rows: [company],
  } = await db.query(
    `
        INSERT INTO companies 
        (name, role_id)
        VALUES ($1, $2)
        RETURNING *
        `,
    [name, roleId],
  );
  return company;
};

/**
 * Přidá identifikátor firmy (např. IČO, DIČ).
 * @param {number} companyId - ID firmy.
 * @param {number} identifierTypeId - ID typu identifikátoru.
 * @param {string} identifierValue - Hodnota (např. '12345678').
 * @returns {Promise<void>}
 */
export const insertCompanyIdentifier = async (
  companyId,
  identifierTypeId,
  identifierValue,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        INSERT INTO company_identifiers
        (company_id, identifier_type_id, identifier_value)
        VALUES ($1, $2, $3) 
        `,
    [companyId, identifierTypeId, identifierValue],
  );
};

/**
 * Přiřadí adresu ke konkrétní firmě.
 * @param {number} companyId - ID firmy.
 * @param {number} addressId - ID adresy z tabulky locates.
 * @param {number} addressTypeId - ID typu adresy (Sídlo, pobočka).
 * @returns {Promise<void>}
 */
export const insertCompanyAddress = async (
  companyId,
  addressId,
  addressTypeId,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        INSERT INTO company_addresses
        (company_id, address_id, address_type_id)
        VALUES ($1, $2, $3)
        `,
    [companyId, addressId, addressTypeId],
  );
};

/**
 * Načte seznam všech rolí firem.
 * @returns {Promise<Array>} Pole rolí firem.
 */
export const getCompanyRoles = async (client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(`
        SELECT *
        FROM company_roles
    `);
  return rows;
};

/**
 * Získá detail firmy podle ID včetně názvu její role.
 * @param {number} companyId - ID hledané firmy.
 * @returns {Promise<Object|null>} Objekt firmy nebo null.
 */
export const getCompanyById = async (companyId, client = null) => {
  const db = getClient(client);
  const {
    rows: [company],
  } = await db.query(
    `
    SELECT 
        c.id AS company_id,
        c.name AS company_name,
        c.created_at AS company_created_at,
        cr.name AS role_name,
        cr.description AS role_description
    FROM companies c
    LEFT JOIN company_roles cr ON c.role_id = cr.id
    WHERE c.id = $1`,
    [companyId],
  );
  return company;
};

/**
 * Načte všechny identifikátory (IČO/DIČ) pro danou firmu.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Pole identifikátorů.
 */
export const getCompanyIdentifiersByCompanyId = async (
  companyId,
  client = null,
) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
        SELECT 
            ci.id AS identifier_id,
            it.name AS identifier_type,
            ci.identifier_value 
        FROM company_identifiers ci
        LEFT JOIN identifier_types it ON ci.identifier_type_id = it.id
        WHERE ci.company_id = $1
        `,
    [companyId],
  );
  return rows;
};

/**
 * Načte všechny adresy firmy včetně geografických bodů.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Pole adres s display_name a geo_point.
 */
export const getCompanyAddressesByCompanyId = async (
  companyId,
  client = null,
) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
        SELECT 
            ca.id AS address_id,
            at.name AS address_type,
            l.dispalay_name
            l.geo_point
        FROM company_addresses ca
        LEFT JOIN address_types at ON ca.address_type_id = at.id
        LEFT JOIN locates l ON ca.address_id = l.id
        WHERE ca.company_id = $1
    `,
    [companyId],
  );
  return rows;
};

/**
 * Vyhledá všechny aktivní řidiče firmy, kteří aktuálně nejsou přiřazeni k žádné soupravě.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Seznam dostupných řidičů.
 */
export const getDriversByCompanyId = async (companyId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
    SELECT u.id, u.name, u.surname, u.phone
    FROM users u
    JOIN user_roles r ON u.role_id = r.id
    WHERE u.company_id = $1 
    AND u.is_active
    AND r.name ILIKE 'driver'
    AND NOT EXISTS (
      SELECT 1 
      FROM vehicle_compositions vc 
      WHERE vc.driver_id = u.id
    )
    ORDER BY u.name ASC;
    `,
    [companyId],
  );
  return rows;
};

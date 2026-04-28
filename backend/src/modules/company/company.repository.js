import pool from "../../config/db.js";

const getClient = (client) => client || pool;

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

export const getCompanyRoles = async (client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(`
        SELECT *
        FROM company_roles
    `);
  return rows;
};

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

export const getDriversByCompanyId = async (companyId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
    SELECT u.id, u.name, u.surname, u.phone
    FROM users u
    JOIN user_roles r ON u.role_id = r.id
    WHERE u.company_id = $1 
    AND r.name = 'driver' -- Берем только водителей
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

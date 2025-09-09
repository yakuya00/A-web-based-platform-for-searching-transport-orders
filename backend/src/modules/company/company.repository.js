import pool from "../../config/db.js";

const getClient = (client) => client || pool;

export const insertCompany = async(name, roleId, client = null) => {
    const db = getClient(client);
    const { rows: [company] } = await db.query(`
        INSERT INTO companies 
        (name, role_id)
        VALUES ($1, $2)
        RETURNING *
        `, [name, roleId]);
    return company;
};

export const insertCompanyIdentifier = async(companyId, identifierTypeId, identifierValue, client = null) => {
    const db = getClient(client);
    await db.query(`
        INSERT INTO company_identifiers
        (company_id, identifier_type_id, identifier_value)
        VALUES ($1, $2, $3) 
        `, [companyId, identifierTypeId, identifierValue]);

};

export const insertCompanyAddress = async (companyId, addressId, addressTypeId, client = null) => {
    const db = getClient(client);
    await db.query(`
        INSERT INTO company_addresses
        (company_id, address_id, address_type_id)
        VALUES ($1, $2, $3)
        `, [companyId, addressId, addressTypeId]);
};

export const getCompanyRoles = async (client = null) => {
    const db = getClient(client);
    const { rows } = await db.query(`
        SELECT id, name
        FROM company_roles
    `);
    return rows;
}

export const getCompanyById = async (userId, client = null) => {
    const db = getClient(client);
    const { rows : [company] } = await db.query(`
    SELECT u.id, u.name, u.surname, u.birthday, u.phone, u.email, u.is_verified, u.created_at,
    c.name AS company_name,
    r.name AS role_name 
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    LEFT JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = $1`, [userId]);
    return user;
};
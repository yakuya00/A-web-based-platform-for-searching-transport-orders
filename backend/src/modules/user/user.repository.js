import pool from "../../config/db.js";
const getClient = (client) => client || pool;

export const getUserById = async (userId, client = null) => {
    const db = getClient(client);
    const { rows : [user] } = await db.query(`
    SELECT u.id, u.name, u.surname, u.birthday, u.phone, u.email, u.is_verified, u.created_at,
    c.name AS company_name,
    r.name AS role_name 
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    LEFT JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = $1`, [userId]);
    return user;
};

export const updateUserEmailById = async (userId, newEmail, oldEmail, client = null) => {
    const db = getClient(client);
    await db.query(`
        UPDATE users
        SET email = $1
        WHERE id = $2,
        AND email = $3
    `, [newEmail, userId, oldEmail]);
}

export const getUserRoles = async (client = null) => {
    const db = getClient(client);
    const { rows } = await db.query(`
        SELECT id, name
        FROM user_roles
    `);
    return rows;
}
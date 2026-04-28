import pool from "../../config/db.js";

const getClient = (client) => client || pool;

export const selectCountries = async(client = null) => {
    const db = getClient(client);
    const sql = `
        SELECT *
        FROM countries    
    `;

    const result = await db.query(sql);
    return result.rows;
}
// import { createPool, sql } from "slonik";
// import dotenv from "dotenv";

// dotenv.config();

// const{
//     DB_HOST = "localhost",
//     DB_USER = "postgres",
//     DB_PASSWORD = "",
//     DB_PORT = "5432",
//     DB_NAME = "web-platform"
// } = process.env;

// const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// const pool = await createPool(connectionString);

// (async () => {
//   try {
//     await pool.connect(async (connection) => {
//       await connection.query(sql`SELECT 1`);
//     });

//     console.log(`Connected to PostgreSQL via Slonik.\nhost: ${DB_HOST}\nuser: ${DB_USER}\nport: ${DB_PORT}\ndatabase: ${DB_NAME}`);
//   } catch (err) {
//     console.error('❌ Slonik / PostgreSQL connection error:', err);
//     process.exit(-1);
//   }
// })();

// export default pool;

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || "5432",
    database: process.env.DB_NAME || "web-platform"
});

pool.on('connect', () => {
    console.log(`Connected to PostgreSQL.\n
                host: ${process.env.DB_HOST || "localhost"}\n
                user: ${process.env.DB_USER || "postgres"}\n
                port: ${process.env.DB_PORT || "5432"}\n
                database: ${process.env.DB_NAME || "web-platform"}`)});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

export default pool;
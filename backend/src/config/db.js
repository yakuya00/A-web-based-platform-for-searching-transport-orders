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
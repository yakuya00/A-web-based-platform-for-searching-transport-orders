/**
 * ====================================================
 * Database Connection (PostgreSQL)
 * English: Core database access point.
 * Czech: Hlavní přístupový bod k databázi.
 * ====================================================
 */

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Pool - objekt, který drží otevřená spojení, aby se nemusela otevírat znovu.
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || "5432",
  database: process.env.DB_NAME || "web-platform",
});

// Kontrola při startu: Vypíše do konzole, kam jsme se reálně připojili.
pool.on("connect", () => {
  console.log(`Connected to PostgreSQL.\n
                host: ${process.env.DB_HOST || "localhost"}\n
                user: ${process.env.DB_USER || "postgres"}\n
                port: ${process.env.DB_PORT || "5432"}\n
                database: ${process.env.DB_NAME || "web-platform"}`);
});

// Kritická chyba: Pokud spojení selže, proces se vypne.
pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
  process.exit(-1);
});

export default pool;

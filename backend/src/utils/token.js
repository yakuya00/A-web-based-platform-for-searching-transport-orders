/**
 * Modul pro kryptografické operace s tokeny.
 * Používá se pro generování unikátních identifikátorů (verifikace, reset hesla, QR kódy)
 * a jejich bezpečné hašování před uložením do databáze.
 * @module utils/token
 */

import crypto from "crypto";

/**
 * Vygeneruje kryptograficky bezpečný náhodný token.
 * Používá vestavěný modul 'crypto', který je odolnější než Math.random().
 * @function generateRandomToken
 * @returns {string} Hexadecimální řetězec o délce 64 znaků (32 bajtů).
 */
export const generateRandomToken = () => {
  return crypto?.randomBytes(32)?.toString("hex");
};

/**
 * Vytvoří SHA-256 haš z poskytnutého tokenu.
 * Používá se pro bezpečné ukládání tokenů do DB – pokud by unikla databáze,
 * útočník nemůže hašované tokeny přímo použít.
 * @function hashToken
 * @param {string} token - Token v čisté (plain-text) podobě.
 * @returns {string} Hexadecimální haš o délce 64 znaků.
 */
export const hashToken = (token) => {
  return crypto?.createHash("sha256").update(token).digest("hex");
};

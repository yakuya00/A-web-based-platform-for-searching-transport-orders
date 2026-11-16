import pool from "../../config/db.js";

const getClient = (client) => client || pool;

/**
 * Získá informace o firmách zapojených do objednávky a aktuální stav zakázky.
 * Slouží k validaci, zda má uživatel právo hodnotit.
 * @param {number} orderId - ID objednávky.
 * @returns {Promise<Object|null>} Objekt s ID firem a názvem stavu zakázky.
 */
export const getCompaniesByOrderId = async (orderId, client = null) => {
  const db = getClient(client);

  const { rows } = await db.query(
    `
        SELECT 
            o.id, 
            o.company_id AS customer_company_id, 
            vc.company_id AS carrier_company_id, 
            osh.status_id AS status -- 🔥 ИСПРАВЛЕНО: у тебя в БД поле называется new_status_id (или просто status_id, проверь точное название в таблице order_status_history!)
        FROM orders o
        LEFT JOIN vehicle_compositions vc ON vc.id = o.vehicle_composition_id
        JOIN order_status_history osh ON osh.order_id = o.id
        WHERE o.id = $1
        ORDER BY osh.changed_at DESC
        LIMIT 1
    `,
    [orderId],
  );

  return rows[0];
};

/**
 * Pomocná funkce pro zjištění příslušnosti uživatele k firmě.
 * @param {number} userId — ID uživatele.
 * @returns {Promise<Object|undefined>} — Objekt obsahující company_id.
 */
export const getCompanyIdByUserId = async (userId, client = null) => {
  const db = getClient(client);

  const {
    rows: [companyId],
  } = await db.query(
    `
        SELECT company_id 
        FROM users 
        WHERE id = $1
    `,
    [userId],
  );

  return companyId;
};
/**
 * Ověřuje, zda firma již k dané zakázce nezanechala hodnocení, aby se zamezilo duplicitám.
 * @param {number} companyId — ID firmy, která hodnotí.
 * @param {number} orderId — ID zakázky.
 * @returns {Promise<Object|undefined>} — ID existujícího hodnocení, pokud existuje.
 */
export const getRatingByCompanyIdAndOrderId = async (
  companyId,
  orderId,
  client = null,
) => {
  const db = getClient(client);

  const { rows } = await db.query(
    `
        SELECT r.id 
        FROM ratings r
        JOIN users u ON r.from_user_id = u.id
        WHERE u.company_id = $1 
        AND r.order_id = $2
    `,
    [companyId, orderId],
  );

  return rows[0];
};

/**
 * Vloží nové hodnocení do systému.
 * @param {number} orderId — ID související zakázky.
 * @param {number} fromUserId — ID uživatele, který hodnocení vytváří.
 * @param {number} toCompanyId — ID firmy, která je hodnocena.
 * @param {number} score — Počet hvězdiček / bodů (0–5).
 * @param {string} comment — Textový komentář k hodnocení.
 */
export const insertRating = async (
  orderId,
  fromUserId,
  toCompanyId,
  score,
  comment,
  client = null,
) => {
  const db = getClient(client);

  await db.query(
    `
        INSERT INTO ratings 
        (order_id, from_user_id, to_company_id, score, comment)
        VALUES ($1, $2, $3, $4, $5)`,
    [orderId, fromUserId, toCompanyId, score, comment],
  );
};

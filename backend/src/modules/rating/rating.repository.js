import pool from "../../config/db.js";

const getClient = (client) => client || pool;

export const getCompaniesByOrderId = async (orderId, client = null) => {
  const db = getClient(client);

  // 🔥 ИСПРАВЛЕНО: Убрали JOIN order_info, т.к. company_id теперь прямо в orders
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

  return rows[0]; // Безопаснее, чем деструктуризация пустых массивов
};

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

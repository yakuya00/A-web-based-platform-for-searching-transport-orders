/**
 * Repository pro správu databáze chatů a zpráv.
 * @module modules/chat/chat.repository
 */

import pool from "../../config/db.js";

const getClient = (client) => client || pool;

/**
 * Vyhledá existující chat pro danou objednávku a dopravce, nebo vytvoří nový.
 * @param {number} orderId - ID objednávky.
 * @param {number} carrierId - ID dopravce.
 * @returns {Promise<number>} ID nalezeného nebo vytvořeného chatu.
 */
export const getOrCreateChat = async (orderId, carrierId, client = null) => {
  const db = getClient(client);

  let { rows } = await db.query(
    `SELECT id FROM chats WHERE order_id = $1 AND carrier_id = $2`,
    [orderId, carrierId],
  );

  if (rows.length === 0) {
    const insertResult = await db.query(
      `INSERT INTO chats (order_id, carrier_id) VALUES ($1, $2) RETURNING id`,
      [orderId, carrierId],
    );
    return insertResult.rows[0].id;
  }

  return rows[0].id;
};

/**
 * Načte posledních 100 zpráv z chatu včetně jmen odesílatelů.
 * @param {number} chatId - ID chatu.
 * @returns {Promise<Array>} Pole objektů zpráv seřazených chronologicky.
 */
export const getChatMessages = async (chatId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT * FROM (
        SELECT 
          cm.id, 
          cm.message, 
          cm.sent_at, 
          cm.sender_id,
          u.name AS sender_name,
          u.surname AS sender_surname
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.chat_id = $1
        ORDER BY cm.sent_at DESC
        LIMIT 100
      ) AS subquery
      ORDER BY sent_at ASC;
    `,
    [chatId],
  );
  return rows;
};

/**
 * Uloží novou zprávu do databáze.
 * @returns {Promise<Object>} Objekt vytvořené zprávy.
 */
export const saveChatMessage = async (
  chatId,
  senderId,
  message,
  client = null,
) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      INSERT INTO chat_messages (chat_id, sender_id, message) 
      VALUES ($1, $2, $3) 
      RETURNING id, message, sent_at, sender_id
    `,
    [chatId, senderId, message],
  );
  return rows[0];
};

/**
 * Získá seznam konverzací pro postranní panel uživatele.
 * Zahrnuje adresy nakládky/vykládky a poslední zprávu.
 * @param {number} userId - ID aktuálně přihlášeného uživatele.
 */
export const getUserChatList = async (userId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT 
        c.id AS chat_id,
        c.order_id,
        loc_load.display_name AS loading_address,
        loc_unload.display_name AS unloading_address,
        comp.name AS company_name,
        last_msg.message AS last_message,
        last_msg.sent_at AS last_message_time,
        last_msg.sender_id AS last_sender_id
      FROM chats c
      JOIN orders o ON c.order_id = o.id
      LEFT JOIN locates loc_load ON o.loading_address_id = loc_load.id
      LEFT JOIN locates loc_unload ON o.unloading_address_id = loc_unload.id
      LEFT JOIN companies comp ON o.company_id = comp.id
      LEFT JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
      LEFT JOIN LATERAL (
        SELECT message, sent_at, sender_id
        FROM chat_messages cm
        WHERE cm.chat_id = c.id
        ORDER BY cm.sent_at DESC
        LIMIT 1
      ) last_msg ON true
      WHERE 
        o.company_id = (SELECT company_id FROM users WHERE id = $1)
        OR vc.company_id = (SELECT company_id FROM users WHERE id = $1)
        OR EXISTS (
            SELECT 1 FROM chat_messages cm2 
            WHERE cm2.chat_id = c.id AND cm2.sender_id = $1
        )
      ORDER BY last_msg.sent_at DESC NULLS LAST;
    `,
    [userId],
  );
  return rows;
};

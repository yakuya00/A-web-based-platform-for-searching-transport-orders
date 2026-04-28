import pool from "../../config/db.js";

const getClient = (client) => client || pool;

// 1. Ищем чат для заказа (если нет — создаем)
export const getOrCreateChat = async (orderId, carrierId, client = null) => {
  const db = getClient(client);

  // Ищем чат именно для этого заказа и ЭТОГО перевозчика
  let { rows } = await db.query(
    `SELECT id FROM chats WHERE order_id = $1 AND carrier_id = $2`,
    [orderId, carrierId],
  );

  // Если чата еще нет, создаем новый
  if (rows.length === 0) {
    const insertResult = await db.query(
      `INSERT INTO chats (order_id, carrier_id) VALUES ($1, $2) RETURNING id`,
      [orderId, carrierId],
    );
    return insertResult.rows[0].id;
  }

  return rows[0].id; // Возвращаем уникальный chat_id
};

// 2. Получаем историю сообщений (с именами отправителей)
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
          -- Защита от удаленных юзеров: если юзера нет, пишем 'Smazaný uživatel'
          COALESCE(u.name, 'Smazaný') AS sender_name,
          COALESCE(u.surname, 'uživatel') AS sender_surname
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.chat_id = $1
        ORDER BY cm.sent_at DESC
        LIMIT 100 -- 🔥 Берем только 100 последних сообщений
      ) AS subquery
      ORDER BY sent_at ASC; -- 🔥 Переворачиваем обратно, чтобы старые были сверху
    `,
    [chatId],
  );
  return rows;
};

// 3. Сохраняем новое сообщение
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

// Получаем список диалогов для боковой панели
export const getUserChatList = async (userId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT 
        c.id AS chat_id,
        c.order_id,
        
        -- 🔥 1. Достаем нормальные текстовые адреса из таблицы locates
        loc_load.display_name AS loading_address,
        loc_unload.display_name AS unloading_address,
        
        comp.name AS company_name,
        last_msg.message AS last_message,
        last_msg.sent_at AS last_message_time,
        last_msg.sender_id AS last_sender_id
        
      FROM chats c
      JOIN orders o ON c.order_id = o.id
      
      -- Подключаем таблицу локаций для адресов погрузки и выгрузки
      LEFT JOIN locates loc_load ON o.loading_address_id = loc_load.id
      LEFT JOIN locates loc_unload ON o.unloading_address_id = loc_unload.id
      
      -- Подключаем компанию-заказчика
      LEFT JOIN companies comp ON o.company_id = comp.id
      
      -- 🔥 2. Подключаем сцепку (фуру), чтобы знать, какой перевозчик и водитель взяли заказ
      LEFT JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
      
      -- Магия PostgreSQL: Достаем только ОДНО последнее сообщение
      LEFT JOIN LATERAL (
        SELECT message, sent_at, sender_id
        FROM chat_messages cm
        WHERE cm.chat_id = c.id
        ORDER BY cm.sent_at DESC
        LIMIT 1
      ) last_msg ON true
      
      WHERE 
        -- Сценарий А: Юзер работает в компании-ЗАКАЗЧИКЕ (создал груз)
        o.company_id = (SELECT company_id FROM users WHERE id = $1)
        
        OR 
        -- Сценарий Б: Юзер работает в компании-ПЕРЕВОЗЧИКЕ (которая назначила фуру)
        vc.company_id = (SELECT company_id FROM users WHERE id = $1)
        
        -- OR 
        -- Сценарий В: Юзер - это ВОДИТЕЛЬ, который сидит за рулем этой фуры
        -- vc.driver_id = $1
        OR 
        EXISTS (
            SELECT 1 FROM chat_messages cm2 
            WHERE cm2.chat_id = c.id 
            AND cm2.sender_id = $1
        )
      
      ORDER BY last_msg.sent_at DESC NULLS LAST;
    `,
    [userId],
  );
  return rows;
};

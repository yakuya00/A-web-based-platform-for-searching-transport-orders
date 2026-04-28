import pool from "../../config/db.js";
import { generateRandomToken } from "../../utils/token.js";

const getClient = (client) => client || pool;

export const addOrderInfo = async (
  companyId,
  orderInfo,
  loadingAddressId,
  unloadingAddressId,
  userId,
  client = null,
) => {
  const db = getClient(client);

  const {
    loading_date,
    unloading_date,
    length,
    height,
    weight,
    volume,
    cargo_description,
    cargo_type,
    cargo_condition,
    extra_info,
    price,
    currency,
    payment_term_days,
    payment_method,
    vehicle_requirements,
    external_comment,
    internal_comment,
    contact_user_id,
  } = orderInfo;

  const loadingDate = new Date(loading_date);
  const unloadingDate = new Date(unloading_date);

  console.log(companyId);

  const {
    rows: [newOrderInfo],
  } = await db.query(
    `
        INSERT INTO orders
        (company_id, loading_date, loading_address_id, unloading_date, unloading_address_id, length, height, weight, volume, cargo_description, cargo_type, cargo_condition, extra_info, price, currency, payment_term_days, payment_method, vehicle_requirements, external_comment, internal_comment, contact_user_id, created_by)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING id
    `,
    [
      companyId,
      loadingDate,
      loadingAddressId,
      unloadingDate,
      unloadingAddressId,
      length,
      height,
      weight,
      volume,
      cargo_description,
      cargo_type,
      cargo_condition,
      extra_info,
      price,
      currency,
      payment_term_days,
      payment_method,
      vehicle_requirements,
      external_comment,
      internal_comment,
      contact_user_id,
      userId,
    ],
  );

  return newOrderInfo.id;
};

export const insertOrder = async (userId, client = null) => {
  const db = getClient(client);
  const {
    rows: [order],
  } = await db.query(
    `
        INSERT INTO orders
        (created_by)
        VALUES ($1)
        RETURNING id
    `,
    [userId],
  );

  return order.id;
};

export const addStatusHistoryByOrder = async (
  orderId,
  userId,
  orderStatusId,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        INSERT INTO order_status_history
        (order_id, status_id, changed_by)
        VALUES ($1, $2, $3)
    `,
    [orderId, orderStatusId, userId],
  );
};

export const getOrderInformationById = async (
  orderId,
  userId = null,
  client = null,
) => {
  const db = getClient(client);
  const {
    rows: [orderInfo],
  } = await db.query(
    `
        SELECT 
            o.id AS order_id,
            o.company_id,
            c.name AS company_name,
            
            (SELECT COALESCE(ROUND(AVG(score), 1), 0) FROM ratings WHERE to_company_id = c.id) AS company_rating,
            (SELECT COUNT(id) FROM ratings WHERE to_company_id = c.id) AS company_rating_count,
            
            -- 🔥 ИСПРАВЛЕННЫЙ CHAT_ID: Вернет ID чата, ТОЛЬКО если смотрящий ($2) является водителем
            (
              SELECT id 
              FROM chats 
              WHERE order_id = o.id 
                AND o.created_by != $2 
              LIMIT 1
            ) AS chat_id,

            o.contact_user_id,
            u_full.name AS contact_person_name,
            u_full.surname AS contact_person_surname,
            o.loading_date,
            la.display_name AS loading_address,
            ST_Y(la.geo_point::geometry) AS from_lat,
            ST_X(la.geo_point::geometry) AS from_lon,
            o.unloading_date,
            ua.display_name AS unloading_address,
            ST_Y(ua.geo_point::geometry) AS to_lat,
            ST_X(ua.geo_point::geometry) AS to_lon,
            o.length,
            o.height,
            o.weight,
            o.volume,
            o.cargo_description,
            o.cargo_type,
            o.cargo_condition,
            o.extra_info,
            o.price,
            o.currency,
            o.payment_term_days,
            o.payment_method,
            o.vehicle_requirements,
            o.external_comment,
            o.internal_comment,
            o.vehicle_composition_id,
            o.created_by,
            u_creator.name AS created_by_name,
            u_creator.surname AS created_by_surname,
            o.created_at,
            os.id AS current_status_id,
            os.name AS current_status_name,
            osh.changed_at AS last_status_change
        FROM orders o
        JOIN companies c ON o.company_id = c.id
        JOIN locates la ON o.loading_address_id = la.id
        JOIN locates ua ON o.unloading_address_id = ua.id
        JOIN users u_full ON o.contact_user_id = u_full.id
        JOIN users u_creator ON o.created_by = u_creator.id
        LEFT JOIN order_status_history osh ON o.id = osh.order_id
        LEFT JOIN order_statuses os ON osh.status_id = os.id
        WHERE o.id = $1
        ORDER BY osh.changed_at DESC
        LIMIT 1;
    `,
    [orderId, userId],
  );

  return orderInfo || null;
};

export const deleteOrderById = async (orderId, client = null) => {
  const db = getClient(client);
  await db.query(
    `
        DELETE FROM orders
        WHERE id = $1
    `,
    [orderId],
  );
};

export const addOrderOfferByOrderId = async (
  orderId,
  companyId,
  price,
  client = null,
) => {
  const db = getClient(client);
  try {
    await db.query(
      `
        INSERT INTO order_offers (order_id, transport_company_id, proposed_price)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [orderId, companyId, price],
    );
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Vaše společnost již podala nabídku na tuto zakázku.");
    }
    throw err;
  }
};

export const getMyOffersByCompanyId = async (companyId, client = null) => {
  const db = getClient(client);

  const query = `
    SELECT 
        oo.id AS offer_id,
        oo.proposed_price,
        oo.status AS offer_status,
        oo.created_at AS offer_date,
        
        o.id AS order_id,
        o.loading_date AS pickup_date,
        o.unloading_date AS delivery_date,
        o.cargo_description,
        o.weight,
        o.currency,
        o.vehicle_composition_id,
        o.company_id,
        
        loc_load.display_name AS pickup_location,
        loc_unload.display_name AS delivery_location,
        
        -- 🔥 Теперь берем не только имя статуса, но и время, когда он изменился
        latest_status.name AS order_status_name,
        latest_status.changed_at AS status_changed_at
        
    FROM order_offers oo
    JOIN orders o ON oo.order_id = o.id
    
    LEFT JOIN locates loc_load ON o.loading_address_id = loc_load.id
    LEFT JOIN locates loc_unload ON o.unloading_address_id = loc_unload.id
    
    -- LATERAL JOIN: берет последнюю запись из истории
    LEFT JOIN LATERAL (
        SELECT os.name, osh.changed_at 
        FROM order_status_history osh
        JOIN order_statuses os ON osh.status_id = os.id
        WHERE osh.order_id = o.id
        ORDER BY osh.changed_at DESC
        LIMIT 1
    ) latest_status ON true
    
    WHERE oo.transport_company_id = $1
      
      -- 🔥 МАГИЯ ФИЛЬТРАЦИИ 24 ЧАСОВ:
      -- Скрываем, если заказ отменен больше 24 часов назад
      AND NOT (
          latest_status.name = 'cancelled' 
          AND latest_status.changed_at < NOW() - INTERVAL '24 hours'
      )
      -- 🔥 ДОПОЛНИТЕЛЬНО: Скрываем ставку, если мы проиграли (rejected) 
      -- или вручную отменили ставку (cancelled), и с момента изменения статуса заказа прошло 24 часа
      
      AND NOT (
          oo.status IN ('rejected', 'cancelled') 
          AND latest_status.changed_at < NOW() - INTERVAL '24 hours'
      )
      
    ORDER BY oo.created_at DESC;
  `;

  const { rows } = await db.query(query, [companyId]);
  return rows;
};

// order.repository.js (или offer.repository.js)

export const getOffersByOrderId = async (orderId, client = null) => {
  const db = getClient(client);

  const query = `
    SELECT 
        oo.id AS offer_id,
        oo.transport_company_id,
        c.name AS company_name,
        oo.proposed_price,
        oo.status AS offer_status,
        oo.created_at AS offer_date,
        5.0 AS rating,
        0 AS reviews_count
        
        -- 🔥 Считаем рейтинг компании (если отзывов нет, ставим 5.0)
        --COALESCE(ROUND(AVG(r.score), 1), 5.0) AS rating,
        
        -- 🔥 Считаем количество отзывов
        --COUNT(r.id) AS reviews_count
        
    FROM order_offers oo
    JOIN companies c ON oo.transport_company_id = c.id
    -- LEFT JOIN ratings r ON r.to_company_id = c.id
    
    WHERE oo.order_id = $1
    
    -- Группируем, потому что используем агрегатные функции (AVG, COUNT)
    -- 🔥 Сортируем от самой дешевой к самой дорогой! Заказчикам важна цена.
    ORDER BY oo.proposed_price ASC;
  `;

  const { rows } = await db.query(query, [orderId]);
  return rows;
};

export const getOrders = async (params, client = null) => {
  const db = getClient(client);
  const {
    fromLat,
    fromLon,
    toLat,
    toLon,
    type,
    minWeight,
    maxWeight,
    companyId,
    excludeCompanyId,
    statuses,
    page = 1,
  } = params;

  const limit = 20;
  const offset = (page - 1) * limit;
  const values = [];
  let paramIndex = 1;

  // ==========================================
  // 1. СОБИРАЕМ SELECT (ЧТО ВЫТЯГИВАЕМ)
  // ==========================================
  let selectClause = `
    o.id,
    o.created_at AS date,
    CONCAT_WS(', ', city_from.name, p_from.postcode, country_from.iso_code) AS from,
    CONCAT_WS(', ', city_to.name, p_to.postcode, country_to.iso_code) AS to,
    o.weight,
    o.loading_date,
    o.volume,
    o.cargo_type,
    o.price,
    o.currency,
    o.vehicle_requirements,
    c.name AS company_name,
    ST_Y(l_from.geo_point::geometry) AS from_lat,
    ST_X(l_from.geo_point::geometry) AS from_lon,
    carrier_comp.id AS carrier_company_id,
    carrier_comp.name AS carrier_company_name
  `;

  // ==========================================
  // 2. СОБИРАЕМ JOINS (БАЗОВЫЕ ТАБЛИЦЫ)
  // ==========================================
  let joinClause = `
    FROM orders o
    JOIN companies c ON o.company_id = c.id
    JOIN locates l_from ON o.loading_address_id = l_from.id
    JOIN countries country_from ON l_from.country_id = country_from.id
    LEFT JOIN postcodes p_from ON l_from.postcode_id = p_from.id
    LEFT JOIN cities city_from ON l_from.city_id = city_from.id 
    JOIN locates l_to ON o.unloading_address_id = l_to.id
    JOIN countries country_to ON l_to.country_id = country_to.id
    LEFT JOIN postcodes p_to ON l_to.postcode_id = p_to.id
    LEFT JOIN cities city_to ON l_to.city_id = city_to.id
    LEFT JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
    LEFT JOIN companies carrier_comp ON vc.company_id = carrier_comp.id
  `;

  let whereClause = `WHERE 1=1`;

  // ==========================================
  // 🔥 3. ДИНАМИЧЕСКАЯ ИНЖЕКЦИЯ (ЕСЛИ ЭТО "МОИ ГРУЗЫ")
  // ==========================================
  // Добавляем колонку статуса в выборку (замени s.code на свою колонку)
  selectClause += `, current_status.status_name AS status`;

  // Добавляем джойн таблицы статусов (замени statuses и status_id на свои)
  joinClause += ` LEFT JOIN LATERAL (
        SELECT os.name AS status_name
        FROM order_status_history osh
        JOIN order_statuses os ON osh.status_id = os.id
        WHERE osh.order_id = o.id
        ORDER BY osh.changed_at DESC
        LIMIT 1
    ) current_status ON true
  `;
  if (companyId) {
    // Фильтруем по компании
    whereClause += ` AND o.company_id = $${paramIndex}`;
    values.push(companyId);
    paramIndex++;
    if (statuses && statuses.length > 0) {
      // current_status.status_name - это то, что мы достали из истории
      whereClause += ` AND current_status.status_name = ANY($${paramIndex}::varchar[])`;
      values.push(statuses); // Передаем массив ['completed', 'cancelled']
      paramIndex++;
    }
  } else {
    // 💡 СОВЕТ СЕНЬОРА: Если companyId НЕТ (это общая биржа),
    // нам нужно показывать ТОЛЬКО активные грузы, чтобы юзеры не видели архив!
    // Раскомментируй и подставь свой ID активного статуса:
    if (excludeCompanyId) {
      whereClause += ` AND o.company_id != $${paramIndex}`;
      values.push(excludeCompanyId);
      paramIndex++;
    }
    whereClause += ` AND current_status.status_name = 'created'`;
  }

  // ==========================================
  // 4. ОСТАЛЬНЫЕ ФИЛЬТРЫ
  // ==========================================
  if (fromLat && fromLon) {
    whereClause += ` AND ST_DWithin(l_from.geo_point::geography, ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography, 50000)`;
    values.push(parseFloat(fromLon), parseFloat(fromLat));
    paramIndex += 2;
  }

  if (toLat && toLon) {
    whereClause += ` AND ST_DWithin(l_to.geo_point::geography, ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography, 50000)`;
    values.push(parseFloat(toLon), parseFloat(toLat));
    paramIndex += 2;
  }

  if (type && type !== "all") {
    whereClause += ` AND o.cargo_type = $${paramIndex}`;
    values.push(type);
    paramIndex++;
  }

  if (minWeight) {
    whereClause += ` AND o.weight >= $${paramIndex}`;
    values.push(minWeight);
    paramIndex++;
  }

  if (maxWeight) {
    whereClause += ` AND o.weight <= $${paramIndex}`;
    values.push(maxWeight);
    paramIndex++;
  }

  // ==========================================
  // 5. СКЛЕИВАЕМ ВСЁ ВМЕСТЕ
  // ==========================================
  const sqlQuery = `
    SELECT ${selectClause} 
    ${joinClause} 
    ${whereClause} 
    ORDER BY o.created_at DESC 
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;
  values.push(limit, offset);

  const orders = await db.query(sqlQuery, values);
  return orders.rows;
};

export const getOfferByIdForUpdate = async (offerId, client) => {
  const db = getClient(client); // Твоя функция-враппер
  const { rows } = await db.query(
    `
      SELECT oo.*, o.company_id AS order_company_id
      FROM order_offers oo
      JOIN orders o ON oo.order_id = o.id
      WHERE oo.id = $1 FOR UPDATE
    `,
    [offerId],
  );
  return rows[0];
};

// 2. Меняем статус одной ставки
export const updateOfferStatus = async (offerId, status, client) => {
  const db = getClient(client);
  await db.query(`UPDATE order_offers SET status = $1 WHERE id = $2`, [
    status,
    offerId,
  ]);
};

// 3. Отклоняем всех остальных конкурентов
export const rejectOtherOffers = async (orderId, winningOfferId, client) => {
  const db = getClient(client);
  await db.query(
    `UPDATE order_offers SET status = 'rejected' WHERE order_id = $1 AND id != $2`,
    [orderId, winningOfferId],
  );
};

// ==========================================
// order.repository.js
// ==========================================

// 4. Записываем цену в сам заказ
export const updateOrderPriceAndCurrency = async (orderId, price, client) => {
  const db = getClient(client);
  await db.query(`UPDATE orders SET price = $1 WHERE id = $2`, [
    price,
    orderId,
  ]);
};

// 5. Обновляем историю статусов заказа
export const addOrderStatusHistory = async (
  orderId,
  statusName,
  changedByUserId,
  client,
) => {
  const db = getClient(client);
  await db.query(
    `
      INSERT INTO order_status_history (order_id, status_id, changed_by)
      VALUES (
        $1, 
        (SELECT id FROM order_statuses WHERE name = $2), 
        $3
      )
    `,
    [orderId, statusName, changedByUserId],
  );
};

// Проверяем, кто владелец груза (и лочим строку для транзакции)
export const getOrderOwnershipForUpdate = async (orderId, client) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `SELECT id, company_id FROM orders WHERE id = $1 FOR UPDATE`,
    [orderId],
  );
  return rows[0];
};

// Жестко отклоняем все ставки по этому грузу
export const rejectAllOffersForOrder = async (orderId, client) => {
  const db = getClient(client);
  await db.query(
    `UPDATE order_offers SET status = 'cancelled' WHERE order_id = $1 AND status = 'accepted'`,
    [orderId],
  );
};

export const assignCompositionToOrder = async (
  orderId,
  compositionId,
  client,
) => {
  const db = getClient(client);
  await db.query(
    `UPDATE orders SET vehicle_composition_id = $1 WHERE id = $2`,
    [compositionId, orderId],
  );
};

// 3. 🔥 Генерируем и сохраняем QR-коды для погрузки и выгрузки
export const generateOrderQRCodes = async (orderId, client) => {
  const db = getClient(client);

  // Генерируем два уникальных рандомных токена (по 16 байт, переведенных в hex)
  const pickupToken = generateRandomToken();
  const deliveryToken = generateRandomToken();

  // Вставляем сразу оба токена в базу
  await db.query(
    `
      INSERT INTO order_qr_tokens (order_id, confirmation_type_id, qr_token)
      VALUES 
      ($1, (SELECT id FROM confirmation_types WHERE name = 'pickup'), $2),
      ($1, (SELECT id FROM confirmation_types WHERE name = 'delivered'), $3)
    `,
    [orderId, pickupToken, deliveryToken],
  );

  return { pickupToken, deliveryToken };
};

export const updateCompositionStatusByName = async (
  compositionId,
  statusName,
  client,
) => {
  const db = getClient(client);
  await db.query(
    `UPDATE vehicle_compositions 
     SET status_id = (SELECT id FROM composition_statuses WHERE name = $1) 
     WHERE id = $2`,
    [statusName, compositionId],
  );
};

export const getOrderQRCodesByOrderId = async (orderId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT qt.qr_token, ct.name AS type
      FROM order_qr_tokens qt
      JOIN confirmation_types ct ON qt.confirmation_type_id = ct.id
      WHERE qt.order_id = $1
    `,
    [orderId],
  );
  return rows;
};

export const getActiveOrdersByDriverId = async (driverId, client = null) => {
  const db = getClient(client);
  const query = `
    SELECT 
        o.id AS order_id,
        o.loading_date AS pickup_date,
        o.unloading_date AS delivery_date,
        o.cargo_description,
        o.weight,
        
        loc_load.display_name AS pickup_location,
        loc_unload.display_name AS delivery_location,
        
        latest_status.name AS status_name
        
    FROM orders o
    JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
    LEFT JOIN locates loc_load ON o.loading_address_id = loc_load.id
    LEFT JOIN locates loc_unload ON o.unloading_address_id = loc_unload.id
    
    LEFT JOIN LATERAL (
        SELECT os.name 
        FROM order_status_history osh
        JOIN order_statuses os ON osh.status_id = os.id
        WHERE osh.order_id = o.id
        ORDER BY osh.changed_at DESC
        LIMIT 1
    ) latest_status ON true
    
    -- 🔥 Ищем заказы, где водитель привязан к фуре, и заказ активен
    WHERE vc.driver_id = $1 
      AND latest_status.name IN ('assign', 'in_progress')
    ORDER BY o.loading_date ASC;
  `;

  const { rows } = await db.query(query, [driverId]);
  return rows;
};

export const verifyOrderQrToken = async (orderId, token, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT ct.name AS token_type
      FROM order_qr_tokens qt
      JOIN confirmation_types ct ON qt.confirmation_type_id = ct.id
      WHERE qt.order_id = $1 AND qt.qr_token = $2
    `,
    [orderId, token],
  );
  return rows[0]; // Вернет { token_type: 'pickup' } или undefined
};

export const freeUpVehicleComposition = async (orderId, client = null) => {
  const db = getClient(client);
  await db.query(
    `
      UPDATE vehicle_compositions
      SET status_id = (SELECT id FROM composition_statuses WHERE name = 'active')
      WHERE id = (SELECT vehicle_composition_id FROM orders WHERE id = $1)
    `,
    [orderId],
  );
};

export const getLatestOrderStatus = async (orderId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT os.name
      FROM order_status_history osh
      JOIN order_statuses os ON osh.status_id = os.id
      WHERE osh.order_id = $1
      ORDER BY osh.changed_at DESC
      LIMIT 1
    `,
    [orderId],
  );
  return rows[0]?.name;
};

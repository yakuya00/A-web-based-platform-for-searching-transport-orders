import pool from "../../config/db.js";
import { generateRandomToken } from "../../utils/token.js";

const getClient = (client) => client || pool;

export const addVehicleCompositionByCompany = async (
  companyId,
  statusId,
  properties,
  client = null,
) => {
  const db = getClient(client);

  // Разделяем ключи и значения
  const keys = Object.keys(properties);
  const values = Object.values(properties);

  // Добавляем company_id в начало
  keys.unshift("company_id", "status_id");
  values.unshift(companyId, statusId);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `
        INSERT INTO vehicle_compositions
        (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *`;
  console.log(sql);
  console.log(values);
  const {
    rows: [vehicleComposition],
  } = await db.query(sql, values);
  return vehicleComposition;
};

export const addCompositionTrailersByVehicleComposition = async (
  compositionId,
  trailers,
  client = null,
) => {
  const db = getClient(client);
  const values = [];
  const placeholders = trailers.map((t, i) => {
    const trailerId = parseInt(t);
    values.push(compositionId, trailerId, i + 1);
    const base = i * 3;
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  });

  const sql = `
        INSERT INTO composition_trailers
        (vehicle_composition_id, trailer_id, position_order)
        VALUES ${placeholders.join(", ")}`;

  await db.query(sql, values);
};

export const getAllVehicleCompositionsByCompany = async (
  companyId,
  client = null,
) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
        SELECT 
            vc.id, 
            vc.name, 
            vc.description,
            
            -- 🔥 1. ДОСТАЕМ ИМЯ СТАТУСА ИЗ ТАБЛИЦЫ СТАТУСОВ
            cs.name AS status_name,

            -- 🔥 2. СОБИРАЕМ ТЯГАЧ В ОБЪЕКТ
            json_build_object(
                'id', truck.id,
                'reg_number', truck.reg_number,
                'brand', truck.brand,
                'model', truck.model
            ) AS truck,

            -- 🔥 3. СОБИРАЕМ ВОДИТЕЛЯ (Если его нет, отдаем null)
            CASE WHEN driver.id IS NOT NULL THEN
                json_build_object(
                    'id', driver.id,
                    'name', driver.name,
                    'surname', driver.surname
                )
            ELSE NULL END AS driver,

            -- 🔥 4. СОБИРАЕМ ПРИЦЕПЫ В МАССИВ (С защитой от пустых прицепов)
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', trailer.id,
                        'reg_number', trailer.reg_number,
                        'brand', trailer.brand
                    ) ORDER BY ct.position_order
                ) FILTER (WHERE trailer.id IS NOT NULL), 
                '[]'::json
            ) AS trailers

        FROM vehicle_compositions vc
        JOIN composition_statuses cs ON vc.status_id = cs.id
        JOIN vehicles truck ON vc.truck_id = truck.id
        LEFT JOIN users driver ON vc.driver_id = driver.id
        LEFT JOIN composition_trailers ct ON vc.id = ct.vehicle_composition_id
        LEFT JOIN vehicles trailer ON ct.trailer_id = trailer.id
        
        WHERE vc.company_id = $1
        
        -- Обязательно группируем по всем "одиночным" полям, чтобы json_agg сработал правильно
        GROUP BY 
            vc.id, 
            cs.name, 
            truck.id, 
            driver.id
        
        -- Свежие сцепки сверху
        ORDER BY vc.created_at DESC;
    `,
    [companyId],
  );

  return rows;
};

export const getVehicleCompositionById = async (
  companyId,
  compositionId,
  client = null,
) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
        SELECT
            vc.id,
            vc.name,
            vc.description,
            vc.driver_id,
            vc.truck_id,
            vc.status_id,
            json_agg(
                json_build_object(
                    'trailer_id', ct.trailer_id
                )
                ORDER BY ct.position_order
            ) AS trailers
        FROM vehicle_compositions vc
        LEFT JOIN composition_trailers ct ON ct.vehicle_composition_id = vc.id
        WHERE vc.id = $1
        AND vc.company_id = $2
        GROUP BY vc.id
    `,
    [compositionId, companyId],
  );

  return rows;
};

export const deleteVehicleCompositionById = async (
  companyId,
  compositionId,
  client = null,
) => {
  const db = getClient(client);
  await db.query(`

    `);
  await db.query(
    `
        DELETE FROM vehicle_compositions
        WHERE id = $1
        AND company_id = $2
    `,
    [compositionId, companyId],
  );
};

export const getActiveCompositionsByCompany = async (
  companyId,
  client = null,
) => {
  const db = getClient(client);
  const query = `
    SELECT 
      vc.id AS composition_id,
      vc.name AS composition_name,
      v.reg_number AS truck_reg_number,
      u.name AS driver_name,
      u.surname AS driver_surname
    FROM vehicle_compositions vc
    JOIN vehicles v ON vc.truck_id = v.id
    LEFT JOIN users u ON vc.driver_id = u.id
    JOIN composition_statuses cs ON vc.status_id = cs.id
    WHERE vc.company_id = $1 
      AND cs.name = 'active'; -- Берем только те, что на ходу
  `;
  const { rows } = await db.query(query, [companyId]);
  return rows;
};

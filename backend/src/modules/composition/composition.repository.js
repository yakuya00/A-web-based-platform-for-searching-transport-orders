/**
 * Repository pro správu databázových operací s jízdními soupravami.
 * Obsahuje komplexní SQL dotazy pro spojování tahačů, návěsů a řidičů do JSON objektů.
 * @module modules/composition/composition.repository
 */

import pool from "../../config/db.js";
import { generateRandomToken } from "../../utils/token.js";

const getClient = (client) => client || pool;

/**
 * Dynamicky vytvoří a vloží novou jízdní soupravu.
 * @param {number} companyId - ID firmy, které souprava patří.
 * @param {number} statusId - Výchozí ID stavu (např. 'active').
 * @param {Object} properties - Objekt s technickými vlastnostmi soupravy (truck_id, driver_id, atd.).
 * @returns {Promise<Object>} Vytvořený záznam soupravy.
 */
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
  const {
    rows: [vehicleComposition],
  } = await db.query(sql, values);
  return vehicleComposition;
};

/**
 * Přiřadí seznam návěsů ke konkrétní jízdní soupravě s určením jejich pořadí.
 * @param {number} compositionId - ID jízdní soupravy.
 * @param {number[]} trailers - Pole ID návěsů.
 */
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

/**
 * Načte všechny soupravy firmy a transformuje propojená data (tahač, řidič, návěsy) do strukturovaného JSON.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Pole souprav s vnořenými objekty.
 */
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
            cs.name AS status_name,
            json_build_object(
                'id', truck.id,
                'reg_number', truck.reg_number,
                'brand', truck.brand,
                'model', truck.model
            ) AS truck,
            CASE WHEN driver.id IS NOT NULL THEN
                json_build_object(
                    'id', driver.id,
                    'name', driver.name,
                    'surname', driver.surname
                )
            ELSE NULL END AS driver,
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
        AND vc.is_active
        GROUP BY 
            vc.id, 
            cs.name, 
            truck.id, 
            driver.id
        ORDER BY vc.created_at DESC;
    `,
    [companyId],
  );

  return rows;
};

/**
 * Načte detail konkrétní jízdní soupravy pro účely editace.
 * Vrátí ID všech připojených entit (tahač, řidič, návěsy) v jednom objektu.
 * @param {number} companyId - ID firmy pro ověření vlastnictví soupravy.
 * @param {number} compositionId - ID hledané soupravy.
 * @returns {Promise<Array>} Pole s jedním objektem soupravy obsahujícím seznam trailer_id.
 */
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
        AND vc.is_active
        GROUP BY vc.id
    `,
    [compositionId, companyId],
  );

  return rows;
};

/**
 * Logicky smaže soupravu nastavením is_active na false (pouze pokud není v jízdě).
 * @param {number} companyId - ID firmy pro kontrolu vlastnictví.
 * @param {number} compositionId - ID soupravy.
 * @returns {Promise<boolean>} True, pokud byla souprava úspěšně deaktivována.
 */
export const deleteVehicleCompositionById = async (
  companyId,
  compositionId,
  client = null,
) => {
  const db = getClient(client);
  const { rowCount } = await db.query(
    `
        UPDATE vehicle_compositions
        SET is_active = false
        WHERE id = $1
        AND company_id = $2
        AND status_id IN (
            SELECT id 
            FROM composition_statuses 
            WHERE name IN ('active', 'inactive', 'maintenance')
        ) 
    `,
    [compositionId, companyId],
  );

  return rowCount > 0;
};

/**
 * Načte soupravy, které jsou v provozuschopném stavu a mají přiřazeného řidiče.
 * @param {number} companyId - ID firmy.
 * @returns {Promise<Array>} Seznam připravených souprav.
 */
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
    AND vc.is_active
    AND vc.driver_id IS NOT NULL
    AND cs.name = 'active';
  `;
  const { rows } = await db.query(query, [companyId]);
  return rows;
};

/**
 * Aktualizuje základní údaje soupravy.
 * @param {number} compositionId - ID soupravy.
 * @param {Object} data - Objekt s novými daty (name, status_id).
 */
export const updateCompositionById = async (
  compositionId,
  data,
  client = null,
) => {
  const db = getClient(client);

  const { name, status_id } = data;

  const { rows } = await db.query(
    `
      UPDATE vehicle_compositions
      SET 
        name = COALESCE($1, name),
        status_id = COALESCE($2, status_id)
      WHERE id = $3
    `,
    [name, status_id, compositionId],
  );
};

/**
 * Repository pro správu vozového parku (tahače a návěsy).
 * Obsahuje komplexní SQL dotazy pro zjišťování dostupnosti vozidel a správu jejich životního cyklu.
 * @module modules/vehicle/vehicle.repository
 */

import pool from "../../config/db.js";
const getClient = (client) => client || pool;

/**
 * Načte seznam všech vozidel firmy s dynamickým výpočtem jejich dostupnosti.
 * @param {number} companyId - ID firmy.
 * @param {Object} filters - Objekt s filtry (např. { vehicle_type: 'truck' }).
 * @returns {Promise<Array>} Pole vozidel s příznakem is_available.
 */
export const getVehiclesByCompany = async (
  companyId,
  filters,
  client = null,
) => {
  const db = getClient(client);
  let query = `SELECT 
            v.*,
            CASE 
                WHEN v.vehicle_type = 'truck' THEN 
                    NOT EXISTS (SELECT 1 FROM vehicle_compositions vc WHERE vc.truck_id = v.id)
                WHEN v.vehicle_type = 'trailer' THEN 
                    NOT EXISTS (SELECT 1 FROM composition_trailers ct WHERE ct.trailer_id = v.id)
                ELSE true
            END AS is_available
        FROM vehicles v
        WHERE v.company_id = $1
        AND v.is_active`;
  const params = [companyId];
  let paramIndex = 2;
  for (const [key, value] of Object.entries(filters || {})) {
    query += ` AND ${key} = $${paramIndex}`;
    params.push(value);
    paramIndex++;
  }

  const { rows } = await db.query(query, params);
  return rows;
};

/**
 * Zaregistruje nové vozidlo do evidence firmy.
 * @param {number} companyId - ID firmy vlastníka.
 * @param {Object} properties - Technické parametry vozidla.
 */
export const addVehicleByCompany = async (
  companyId,
  properties,
  client = null,
) => {
  const db = getClient(client);
  const {
    vehicle_type,
    reg_number,
    brand,
    model,
    year_of_manufacture,
    length,
    height,
    capacity,
    volume,
    notes,
  } = properties;

  await db.query(
    `
    INSERT INTO vehicles 
    (company_id, vehicle_type, reg_number, brand, model, year_of_manufacture, length, height, capacity, volume, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      companyId,
      vehicle_type,
      reg_number,
      brand,
      model,
      year_of_manufacture,
      length,
      height,
      capacity,
      volume,
      notes,
    ],
  );
};

/**
 * Načte detail konkrétního vozidla s ověřením vlastnictví firmou.
 * @param {number} companyId - ID firmy.
 * @param {number} vehicleId - ID vozidla.
 * @returns {Promise<Array>} Pole s výsledkem (očekáván jeden záznam).
 */
export const getVehicleInCompanyById = async (
  companyId,
  vehicleId,
  client = null,
) => {
  const db = getClient(client);

  const { rows } = await db.query(
    `
        SELECT * 
        FROM vehicles
        WHERE id = $1
        AND company_id = $2 
        AND is_active
    `,
    [vehicleId, companyId],
  );
  return rows;
};

/**
 * Zjistí, zda je vozidlo součástí jakékoliv aktivní jízdní soupravy.
 * @param {number} vehicleId - ID vozidla k prověření.
 * @returns {Promise<boolean>} True, pokud je vozidlo v aktivním užívání.
 */
export const isVehicleInActiveComposition = async (
  vehicleId,
  client = null,
) => {
  const db = getClient(client);

  const { rowCount } = await db.query(
    `
      SELECT 1 
      FROM vehicle_compositions vc
      LEFT JOIN composition_trailers ct ON vc.id = ct.vehicle_composition_id
      WHERE vc.is_active = true 
      AND (vc.truck_id = $1 OR ct.trailer_id = $1)
      LIMIT 1;
    `,
    [vehicleId],
  );

  return rowCount > 0;
};

/**
 * Provede logické smazání vozidla (nastavení is_active na false).
 * @param {number} companyId - ID firmy (pro bezpečnost).
 * @param {number} vehicleId - ID vozidla ke smazání.
 * @returns {Promise<boolean>} True, pokud bylo vozidlo úspěšně deaktivováno.
 */
export const deleteVehicleFromCompanyById = async (
  companyId,
  vehicleId,
  client = null,
) => {
  const db = getClient(client);

  const { rowCount } = await db.query(
    `
        UPDATE vehicles
        SET is_active = false
        WHERE id = $1
        AND company_id = $2
    `,
    [vehicleId, companyId],
  );

  return rowCount > 0;
};

/**
 * Repository pro sdílená data, dashboard statistiky a geografické informace.
 * @module modules/common/common.repository
 */

import pool from "../../config/db.js";

const getClient = (client) => client || pool;

/**
 * Načte seznam všech zemí z databáze.
 * @returns {Promise<Array>} Pole objektů zemí.
 */
export const selectCountries = async (client = null) => {
  const db = getClient(client);
  const sql = `
        SELECT *
        FROM countries    
    `;

  const result = await db.query(sql);
  return result.rows;
};

/**
 * Agreguje statistiky pro dashboard na základě role firmy (Dopravce/Odesílatel/Spedice).
 * @param {number} companyId - ID firmy.
 * @param {number} roleId - ID role firmy (1-Dopravce, 2-Odesílatel, 3-Spedice).
 * @returns {Promise<Object>} Objekt se statistikami (stat1, stat2, completed, offers).
 */
export const selectDashboardData = async (companyId, roleId, client = null) => {
  const db = getClient(client);

  let orderFilter = "";
  let offersQuery = "";
  let stat1Filter = "";

  if (roleId === 2) {
    orderFilter = `o.company_id = $1`;
    stat1Filter = `'created'`;
    offersQuery = `
      SELECT COUNT(id) FROM order_offers 
      WHERE order_id IN (SELECT id FROM orders WHERE company_id = $1) 
      AND status = 'pending'
    `;
  } else if (roleId === 1) {
    orderFilter = `vc.company_id = $1`;
    stat1Filter = `'assign'`;
    offersQuery = `
      SELECT COUNT(id) FROM order_offers 
      WHERE transport_company_id = $1 
      AND status = 'pending'
    `;
  } else {
    orderFilter = `(o.company_id = $1 OR vc.company_id = $1)`;
    stat1Filter = `'created', 'assign'`;
    offersQuery = `
      SELECT COUNT(id) FROM order_offers 
      WHERE (transport_company_id = $1 OR order_id IN (SELECT id FROM orders WHERE company_id = $1)) 
      AND status = 'pending'
    `;
  }

  const ordersQuery = `
    SELECT 
      COUNT(o.id) FILTER (WHERE current_status.name IN (${stat1Filter})) AS stat1,
      COUNT(o.id) FILTER (WHERE current_status.name = 'in_progress') AS stat2,
      COUNT(o.id) FILTER (
        WHERE current_status.name = 'completed' 
        AND current_status.changed_at >= date_trunc('month', CURRENT_DATE)
      ) AS completed
    FROM orders o
    LEFT JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
    LEFT JOIN LATERAL (
      SELECT os.name, osh.changed_at
      FROM order_status_history osh
      JOIN order_statuses os ON osh.status_id = os.id
      WHERE osh.order_id = o.id
      ORDER BY osh.changed_at DESC
      LIMIT 1
    ) current_status ON true
    WHERE ${orderFilter};
  `;

  const [ordersResult, offersResult] = await Promise.all([
    db.query(ordersQuery, [companyId]),
    db.query(offersQuery, [companyId]),
  ]);

  const stats = ordersResult.rows[0];
  const offersCount = offersResult.rows[0];

  return {
    stat1: Number(stats?.stat1 || 0),
    stat2: Number(stats?.stat2 || 0),
    completed: Number(stats?.completed || 0),
    offers: Number(offersCount?.count || 0),
  };
};

/**
 * Načte seznam aktivních přeprav (posledních 5) s detaily o trase a váze.
 * @param {number} companyId - ID firmy.
 * @param {number} roleId - ID role firmy (1-Dopravce, 2-Odesílatel, 3-Spedice).
 * @returns {Promise<Array>} Seznam aktivních objednávek s názvy měst a zemí.
 */
export const selectActiveShipments = async (
  companyId,
  roleId,
  client = null,
) => {
  const db = getClient(client);

  let orderFilter = "";

  if (roleId === 2) {
    orderFilter = `o.company_id = $1`;
  } else if (roleId === 1) {
    orderFilter = `vc.company_id = $1`;
  } else {
    orderFilter = `(o.company_id = $1 OR vc.company_id = $1)`;
  }

  const query = `
    SELECT 
      o.id,
      o.loading_date,
      o.weight,
      o.cargo_type,
      city_load.name AS loading_city,
      country_load.iso_code AS loading_country,
      city_unload.name AS unloading_city,
      country_unload.iso_code AS unloading_country,
      current_status.name AS status_name
    FROM orders o
    LEFT JOIN vehicle_compositions vc ON o.vehicle_composition_id = vc.id
    LEFT JOIN locates loc1 ON o.loading_address_id = loc1.id
    LEFT JOIN cities city_load ON loc1.city_id = city_load.id
    LEFT JOIN countries country_load ON loc1.country_id = country_load.id
    LEFT JOIN locates loc2 ON o.unloading_address_id = loc2.id
    LEFT JOIN cities city_unload ON loc2.city_id = city_unload.id
    LEFT JOIN countries country_unload ON loc2.country_id = country_unload.id
    JOIN LATERAL (
      SELECT os.name
      FROM order_status_history osh
      JOIN order_statuses os ON osh.status_id = os.id
      WHERE osh.order_id = o.id
      ORDER BY osh.changed_at DESC
      LIMIT 1
    ) current_status ON true

    WHERE ${orderFilter} 
      AND current_status.name IN ('created', 'assign', 'in_progress')
    ORDER BY o.created_at DESC
    LIMIT 5;
  `;

  const result = await db.query(query, [companyId]);
  return result.rows;
};

/**
 * Získá aktuální textový název stavu konkrétní jízdní soupravy.
 * @param {number} compositionId - ID soupravy.
 * @returns {Promise<Object>} Objekt s status_name.
 */
export const getCurrentStatus = async (compositionId, client = null) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `
      SELECT cs.name AS status_name
      FROM vehicle_compositions vc
      JOIN composition_statuses cs ON vc.status_id = cs.id
      WHERE vc.id = $1
    `,
    [compositionId],
  );
  return rows[0];
};

/**
 * Vyhledá objekty stavů (id, name) na základě pole jejich názvů.
 * @param {string[]} nextAllowedStatuses - Pole názvů povolených stavů.
 */
export const selectStatusesToApply = async (
  nextAllowedStatuses,
  client = null,
) => {
  const db = getClient(client);
  const placeholders = nextAllowedStatuses
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const { rows } = await db.query(
    `
      SELECT id, name
      FROM composition_statuses
      WHERE name IN (${placeholders})
    `,
    nextAllowedStatuses,
  );
  return rows;
};

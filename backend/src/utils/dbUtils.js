/**
 * Databázové utility pro správu transakcí a geografických dat (PostGIS).
 * @module utils/dbUtils
 */

import pool from "../config/db.js";

const getClient = (client) => client || pool;

/**
 * Spustí callback funkci v rámci izolované SQL transakce (ACID).
 * @function runTransaction
 * @param {Function} callback - Asynchronní funkce přijímající transakčního klienta.
 * @returns {Promise<any>} Výsledek callbacku.
 * @throws {Error} Pokud transakce selže, provede se ROLLBACK.
 */
export const runTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Normalizuje data z OpenStreetMap (Nominatim) a uloží/aktualizuje lokaci v databázi.
 * Využívá PostGIS pro práci s geografickými body.
 * @function insertLocation
 * @param {Object} nominatium_data - Objekt s daty o adrese z Nominatim API.
 * @returns {Promise<number>} ID uložené lokace v tabulce locates.
 */
export const insertLocation = async (nominatium_data, client = null) => {
  const db = getClient(client);

  const {
    place_id,
    osm_id,
    osm_type,
    display_name,
    lat,
    lon,
    address: {
      country_code,
      country,
      city,
      town,
      village,
      postcode,
      road,
      house_number,
    },
  } = nominatium_data;

  const countryCode = country_code.toUpperCase();
  const cityName = city || town || village || null;
  const shortOsmType = osm_type.charAt(0).toUpperCase();
  let {
    rows: [countryRow],
  } = await db.query(
    `INSERT INTO countries (iso_code, name) 
         VALUES ($1, $2) 
         ON CONFLICT (iso_code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
    [countryCode, country],
  );
  let cityRow = null;
  if (cityName) {
    ({
      rows: [cityRow],
    } = await db.query(
      `INSERT INTO cities (country_id, name) 
             VALUES ($1, $2) 
             ON CONFLICT (country_id, name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
      [countryRow.id, cityName],
    ));
  }

  let postalCodeRow = null;
  if (postcode && cityRow) {
    ({
      rows: [postalCodeRow],
    } = await db.query(
      `INSERT INTO postcodes (city_id, postcode) 
             VALUES ($1, $2) 
             ON CONFLICT (city_id, postcode) DO UPDATE SET postcode = EXCLUDED.postcode
             RETURNING id`,
      [cityRow.id, postcode],
    ));
  }

  const {
    rows: [loc],
  } = await db.query(
    `INSERT INTO locates
         (country_id, city_id, postcode_id, osm_id, osm_type, street, house_number, display_name, geo_point)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326))
         ON CONFLICT (osm_id, osm_type) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            geo_point = EXCLUDED.geo_point,
            postcode_id = COALESCE(EXCLUDED.postcode_id, locates.postcode_id)
         RETURNING id`,
    [
      countryRow.id,
      cityRow ? cityRow.id : null,
      postalCodeRow ? postalCodeRow.id : null,
      osm_id,
      shortOsmType,
      road || null,
      house_number || null,
      display_name,
      lon,
      lat,
    ],
  );

  return loc.id;
};

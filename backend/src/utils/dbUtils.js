import pool from "../config/db.js";

const getClient = (client) => client || pool;

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

  //   const {
  //     rows: [existing],
  //   } = await db.query(
  //     `SELECT id
  //         FROM locates
  //         WHERE external_place_id = $1`,
  //     [place_id],
  //   );

  //   if (existing) {
  //     return existing.id;
  //   }

  //   let {
  //     rows: [countryRow],
  //   } = await db.query(
  //     `SELECT id
  //         FROM countries
  //         WHERE iso_code = $1`,
  //     [countryCode],
  //   );

  //   if (!countryRow) {
  //     ({
  //       rows: [countryRow],
  //     } = await db.query(
  //       `INSERT INTO countries
  //             (iso_code, name)
  //             VALUES ($1, $2)
  //             RETURNING *`,
  //       [countryCode, country],
  //     ));
  //   }

  //   let cityRow = null;
  //   if (cityName) {
  //     ({
  //       rows: [cityRow],
  //     } = await db.query(
  //       `SELECT id
  //             FROM cities
  //             WHERE country_id = $1
  //             AND LOWER(name) = LOWER($2)`,
  //       [countryRow.id, cityName],
  //     ));

  //     if (!cityRow) {
  //       ({
  //         rows: [cityRow],
  //       } = await db.query(
  //         `INSERT INTO cities
  //                 (country_id, name)
  //                 VALUES ($1, $2)
  //                 RETURNING *`,
  //         [countryRow.id, cityName],
  //       ));
  //     }
  //   }

  //   let postalCodeRow = null;
  //   if (postcode) {
  //     ({
  //       rows: [postalCodeRow],
  //     } = await db.query(
  //       `SELECT id
  //             FROM postcodes
  //             WHERE city_id = $1
  //             AND postcode = $2`,
  //       [cityRow.id, postcode],
  //     ));

  //     if (!postalCodeRow) {
  //       ({
  //         rows: [postalCodeRow],
  //       } = await db.query(
  //         `INSERT INTO postcodes
  //                 (city_id, postcode)
  //                 VALUES ($1, $2)
  //                 RETURNING *`,
  //         [cityRow.id, postcode],
  //       ));
  //     }
  //   }
  //   console.log(cityRow);
  //   console.log(postalCodeRow);

  //   const {
  //     rows: [loc],
  //   } = await db.query(
  //     `INSERT INTO locates
  //          (country_id, city_id, postcode_id, external_place_id, street, house_number, display_name, geo_point)
  //          VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326))
  //          RETURNING *`,
  //     [
  //       countryRow.id,
  //       cityRow ? cityRow.id : null,
  //       postalCodeRow ? postalCodeRow.id : null,
  //       place_id,
  //       road || null,
  //       house_number || null,
  //       display_name,
  //       lon, // X
  //       lat, // Y
  //     ],
  //   );

  //   return loc.id;
  console.log("1");
  let {
    rows: [countryRow],
  } = await db.query(
    `INSERT INTO countries (iso_code, name) 
         VALUES ($1, $2) 
         ON CONFLICT (iso_code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
    [countryCode, country],
  );
  console.log("2");

  // 2. Обработка города
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
  console.log("3");

  // 3. Обработка индекса
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
  console.log("4");

  // 4. ГЛАВНЫЙ INSERT (с защитой от дублей по OSM)
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
  console.log("4");

  return loc.id;
};

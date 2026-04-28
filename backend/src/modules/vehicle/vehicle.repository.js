import pool from "../../config/db.js";
const getClient = (client) => client || pool;

export const getVehiclesByCompany = async (
  companyId,
  filters,
  client = null,
) => {
  const db = getClient(client);
  let query = `SELECT 
            v.*,
            -- Вычисляем на лету: занята машина в сцепке или свободна
            CASE 
                WHEN v.vehicle_type = 'truck' THEN 
                    NOT EXISTS (SELECT 1 FROM vehicle_compositions vc WHERE vc.truck_id = v.id)
                WHEN v.vehicle_type = 'trailer' THEN 
                    NOT EXISTS (SELECT 1 FROM composition_trailers ct WHERE ct.trailer_id = v.id)
                ELSE true
            END AS is_available
        FROM vehicles v
        WHERE v.company_id = $1`;
  const params = [companyId];
  let paramIndex = 2;
  console.log(filters);
  for (const [key, value] of Object.entries(filters || {})) {
    query += ` AND ${key} = $${paramIndex}`;
    params.push(value);
    paramIndex++;
  }

  const { rows } = await db.query(query, params);
  return rows;
};

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
    `,
    [vehicleId, companyId],
  );
  console.log(rows);
  return rows;
};

export const deleteVehicleFromCompanyById = async (
  companyId,
  vehicleId,
  client = null,
) => {
  const db = getClient(client);
  await db.query(
    `
        DELETE FROM vehicles
        WHERE id = $1
        AND company_id = $2
    `,
    [vehicleId, companyId],
  );
};

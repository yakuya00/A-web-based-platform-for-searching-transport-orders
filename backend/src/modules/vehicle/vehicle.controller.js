/**
 * Controller pro správu technické evidence vozového parku firmy.
 * Obsahuje logiku pro filtrování, přidávání a bezpečné odstraňování vozidel.
 * @module modules/vehicle/vehicle.controller
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {
  getVehiclesByCompany,
  addVehicleByCompany,
  getVehicleInCompanyById,
  deleteVehicleFromCompanyById,
  isVehicleInActiveComposition,
} from "./vehicle.repository.js";

/**
 * Načte seznam všech vozidel patřících firmě s možností filtrace podle typu.
 * @function getAllVehiclesInCompany
 * @param {import('express').Request} req - Obsahuje query parametr 'type' (např. truck/trailer).
 * @param {import('express').Response} res - JSON pole vozidel.
 * @throws {HttpError} 404 - Pokud nebyla nalezena žádná vozidla.
 */
export const getAllVehiclesInCompany = asyncHandler(async (req, res, next) => {
  const filters = {};
  if (req.query.type) filters.vehicle_type = req.query.type;

  const allVehicles = await getVehiclesByCompany(req.user.company_id, filters);
  if (allVehicles.length === 0) {
    throw createError(404, "Vehicle not found");
  }

  res.status(200).json(allVehicles);
});

/**
 * Přidá nové vozidlo do databáze pod firmu přihlášeného uživatele.
 * @function addVehicleToCompany
 * @param {import('express').Request} req - Body obsahuje parametry vozidla (reg_number, brand, atd.).
 */
export const addVehicleToCompany = asyncHandler(async (req, res, next) => {
  const properties = req.body;
  const companyId = req.user.company_id;

  await addVehicleByCompany(companyId, properties);
  res.status(200).json({
    message: "Vehicle successfully added",
    error: false,
  });
});

/**
 * Získá detail konkrétního vozidla na základě ID a ID firmy.
 * @function getVehicleInCompany
 * @param {string} id - ID vozidla z URL parametrů.
 */
export const getVehicleInCompany = asyncHandler(async (req, res, next) => {
  const vehicleId = req.params.id;
  const companyId = req.user.company_id;

  const vehicle = await getVehicleInCompanyById(companyId, vehicleId);
  if (vehicle.length === 0) {
    throw createError(404, "Vehicle not found");
  }
  res.status(200).json(vehicle);
});

/**
 * Odstraní vozidlo z evidence firmy s kontrolou vazeb.
 * @function deleteVehicleFromCompany
 * @param {number} id - ID vozidla ke smazání.
 * @throws {HttpError} 400 - Pokud je vozidlo součástí aktivní jízdní soupravy.
 * @throws {HttpError} 404 - Pokud vozidlo neexistuje nebo nepatří dané firmě.
 */
export const deleteVehicleFromCompany = asyncHandler(async (req, res, next) => {
  const vehicleId = Number(req.params.id);
  const companyId = Number(req.user.company_id);

  const isLinked = await isVehicleInActiveComposition(vehicleId);

  if (isLinked) {
    throw createError(
      400,
      "Nelze smazat vozidlo. Je aktuálně přiřazené do aktivní soupravy. Nejprve ho odeberte ze soupravy.",
    );
  }

  const isDeleted = await deleteVehicleFromCompanyById(companyId, vehicleId);

  if (!isDeleted) {
    throw createError(404, "Vozidlo nebylo nalezeno nebo nemáte oprávnění.");
  }

  res.status(200).json({
    message: "Vozidlo bylo úspěšně smazáno.",
    error: false,
  });
});

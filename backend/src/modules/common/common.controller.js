/**
 * Controller pro sdílená data, statistiky a logiku stavů.
 * @module modules/common/сommon.controller
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";

import { runTransaction } from "../../utils/dbUtils.js";

import {
  selectCountries,
  selectDashboardData,
  selectActiveShipments,
  selectStatusesToApply,
  getCurrentStatus,
} from "./common.repository.js";

/**
 * Načte seznam všech dostupných zemí.
 * @function getCountries
 * @throws {HttpError} 404 - Pokud nebyla nalezena žádná země.
 */
export const getCountries = asyncHandler(async (req, res) => {
  const countries = await selectCountries();
  if (countries.length === 0) {
    throw createError(404, "Countries is not found");
  }
  res.status(200).json(countries);
});

/**
 * Získá data pro dashboard (statistiky) na základě role firmy.
 * @function getStats
 */
export const getStats = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const roleId = req.user.company_role_id;

  const data = await selectDashboardData(companyId, roleId);

  res.status(200).json(data);
});

/**
 * Načte seznam aktivních přeprav pro konkrétní firmu.
 * @function getShipments
 */
export const getShipments = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const roleId = Number(req.user.company_role_id);

  const shipments = await selectActiveShipments(companyId, roleId);
  res.status(200).json(shipments);
});

/**
 * Logika "State Machine": Určuje, do jakých stavů může souprava přejít.
 * @function getCompositionStatuses
 * @param {Object} req - Obsahuje ID soupravy v parametrech.
 * @throws {HttpError} 404 - Pokud souprava neexistuje.
 */
export const getCompositionStatuses = asyncHandler(async (req, res) => {
  const compositionId = Number(req.params.id);
  const currentStatus = await getCurrentStatus(compositionId);

  if (!currentStatus) {
    throw createError(404, "Jízdní souprava nebyla nalezena.");
  }
  const allowedTransitions = {
    inactive: ["active", "maintenance"],
    active: ["inactive", "maintenance"],
    maintenance: ["inactive", "active"],
  };

  const nextAllowedStatuses =
    allowedTransitions[currentStatus.status_name] || [];

  if (nextAllowedStatuses.length === 0) {
    return res.status(200).json({ statuses: [] });
  }

  const statuses = await selectStatusesToApply(nextAllowedStatuses);

  res.status(200).json({ statuses });
});

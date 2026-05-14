/**
 * Router pro správu vozového parku firmy (tahače, návěsy, přívěsy).
 * @module modules/vehicle/vehicle.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
  getAllVehiclesInCompany,
  getVehicleInCompany,
  addVehicleToCompany,
  deleteVehicleFromCompany,
} from "./vehicle.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Načte seznam všech vozidel (aktivních i neaktivních) patřících firmě.
 * @route GET /vehicle/
 */
router.get(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAllVehiclesInCompany,
);

/**
 * Zaregistruje nové vozidlo do evidence firmy.
 * @route POST /vehicle/
 */
router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addVehicleToCompany,
);

/**
 * Získá detailní technické informace o konkrétním vozidle.
 * @route GET /vehicle/:id
 */
router.get(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getVehicleInCompany,
);

/**
 * Odstraní vozidlo z evidence firmy.
 * @route DELETE /vehicle/:id
 */
router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  deleteVehicleFromCompany,
);

export default router;

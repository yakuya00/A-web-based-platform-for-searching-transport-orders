import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

import {
  getAllVehicleCompositionsInCompany,
  addVehicleCompositionToCompany,
  getVehicleCompositionInCompany,
  deleteVehicleCompositionFromCompany,
  getAvailableCompositions,
  changeVehicleComposition,
} from "./composition.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Získání seznamu všech jízdních souprav patřících firmě uživatele.
 * @route GET /composition/
 */
router.get(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAllVehicleCompositionsInCompany,
);

/**
 * Přidání nové jízdní soupravy do vozového parku firmy.
 * @route POST /composition/
 */
router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addVehicleCompositionToCompany,
);

/**
 * Načtení volných souprav, které aktuálně nejsou přiřazeny k žádné zakázce.
 * @route GET /composition/available
 */
router.get(
  "/available",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAvailableCompositions,
);

/**
 * Detail konkrétní jízdní soupravy podle jejího ID.
 * @route GET /composition/:id
 */
router.get(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getVehicleCompositionInCompany,
);

/**
 * Odstranění jízdní soupravy z evidence firmy.
 * @route DELETE /composition/:id
 */
router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  deleteVehicleCompositionFromCompany,
);

/**
 * Aktualizace parametrů soupravy (např. změna řidiče nebo technických údajů).
 * @route PUT /composition/:id
 */
router.put(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  changeVehicleComposition,
);

export default router;

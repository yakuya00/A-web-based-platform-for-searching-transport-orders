import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

import {
  getAllVehicleCompositionsInCompany,
  addVehicleCompositionToCompany,
  getVehicleCompositionInCompany,
  deleteVehicleCompositionFromCompany,
  getAvailableCompositions,
} from "./composition.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

router.get(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAllVehicleCompositionsInCompany,
);

router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addVehicleCompositionToCompany,
);

router.get(
  "/available",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAvailableCompositions,
);

router.get(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getVehicleCompositionInCompany,
);

router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  deleteVehicleCompositionFromCompany,
);

//router.put --- assing driver + change some properties

export default router;

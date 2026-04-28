import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
    getAllVehiclesInCompany,
    getVehicleInCompany,
    addVehicleToCompany,
    deleteVehicleFromCompany
} from "./vehicle.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

router.get("/",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    getAllVehiclesInCompany);

router.post("/",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    addVehicleToCompany);

// router.get("/trucks",
//     checkAuthentication,
//     checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
//     getAllTrucksInCompany);

// router.get("/trailers",
//     checkAuthentication,
//     checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
//     getAllTrailersInCompany);

router.get("/:id",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    getVehicleInCompany);

router.delete("/:id",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    deleteVehicleFromCompany);

export default router;
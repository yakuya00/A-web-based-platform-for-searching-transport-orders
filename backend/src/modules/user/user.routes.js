import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
    getMe,
    userInfo,
    userRolesList,
    getAllUsersInCompany
} from "./user.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

router.get("/me",
    checkAuthentication,
    getMe);
    
router.get("/roles",
    userRolesList);

router.get("/:id",
    checkAuthentication,
    userInfo);

router.get("/",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    getAllUsersInCompany);

//get all managers in company,
//get all drivers in company,
// get admins in company

export default router;
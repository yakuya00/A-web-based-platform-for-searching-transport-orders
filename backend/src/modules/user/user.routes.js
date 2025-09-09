import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import {
    getMe,
    userInfo,
    userRolesList
} from "./user.controller.js";

const router = express.Router();

router.get("/me",
    checkAuthentication,
    getMe);
    
router.get("/roles",
    userRolesList);

router.get("/:id",
    checkAuthentication,
    userInfo);



export default router;
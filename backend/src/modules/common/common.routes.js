import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { getCountries } from "./common.controller.js";

const router = express.Router();

router.get("/countries", 
    getCountries);

export default router;
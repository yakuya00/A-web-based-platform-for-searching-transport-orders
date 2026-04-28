import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

import { 
    addRatingToCompany,
} from "./rating.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

router.post("/",
    checkAuthentication,
    checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    addRatingToCompany);

// router.get("/",
//     checkAuthentication,
//     getCompanyRatings);



export default router;


// - `POST   /api/ratings` — оставить рейтинг компании по заказу
// - `GET    /api/ratings?company_id=` — рейтинги компании
// - `GET    /api/orders/:id/ratings` — рейтинги по заказу
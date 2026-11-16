/**
 * Router pro správu hodnocení a recenzí firem.
 * Umožňuje uživatelům hodnotit spolupráci po dokončení přepravy.
 * @module modules/rating/rating.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { addRatingToCompany } from "./rating.controller.js";

import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Přidání nového hodnocení firmě.
 * Přístup je omezen pouze na administrátory a manažery firem.
 * @route POST /api/rating/
 */
router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addRatingToCompany,
);

export default router;

/**
 * Router pro správu uživatelských profilů a oprávnění v rámci firmy.
 * @module modules/user/user.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
  getMe,
  userInfo,
  userRolesList,
  getAllUsersInCompany,
  deleteUserFromCompany,
} from "./user.controller.js";
import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Získá profil aktuálně přihlášeného uživatele na základě tokenu.
 * @route GET /user/me
 */
router.get("/me", checkAuthentication, getMe);

/**
 * Vrátí číselník všech dostupných uživatelských rolí (Admin, Manager, Driver).
 * @route GET /user/roles
 */
router.get("/roles", userRolesList);

/**
 * Získá detailní informace o konkrétním uživateli podle ID.
 * @route GET /user/:id
 */
router.get("/:id", checkAuthentication, userInfo);

/**
 * Načte seznam všech zaměstnanců (uživatelů) v rámci firmy přihlášeného manažera/admina.
 * @route GET /user/
 */
router.get(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getAllUsersInCompany,
);

/**
 * Odstraní uživatele z firmy (deaktivace účtu).
 * @route DELETE /user/:id
 */
router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN]),
  deleteUserFromCompany,
);

export default router;

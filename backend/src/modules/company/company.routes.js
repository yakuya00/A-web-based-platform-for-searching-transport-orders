/**
 * Router pro správu firem, jejich rolí a dostupného personálu.
 * @module modules/company/company.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";

import {
  createCompany,
  companyRolesList,
  companyInfo,
  companyAvailableDrivers,
} from "./company.controller.js";

const router = express.Router();

/**
 * Získání číselníku rolí firem (Dopravce, Odesílatel, Spedice).
 * Veřejná trasa využívaná při registraci.
 * @route GET /api/company/roles
 */
router.get("/roles", companyRolesList);

/**
 * Vytvoření základního profilu firmy.
 * @route POST /api/company/create
 */
router.post("/create", createCompany);

/**
 * Seznam volných řidičů aktuálně přihlášené firmy (pro přiřazení k soupravě).
 * @route GET /api/company/drivers
 */
router.get("/drivers", checkAuthentication, companyAvailableDrivers);

/**
 * Detailní informace o konkrétní firmě podle ID.
 * @route GET /api/company/:id
 * @param {string} id - Unikátní ID firmy.
 */
router.get("/:id", checkAuthentication, companyInfo);

export default router;

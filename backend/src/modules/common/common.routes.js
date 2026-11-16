/**
 * Router pro sdílená data, číselníky a globální statistiky.
 * @module modules/common/common.routes
 * @returns {import('express').Router} Express router.
 */

import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
  getCountries,
  getStats,
  getShipments,
  getCompositionStatuses,
} from "./common.controller.js";

const router = express.Router();

/**
 * Získání seznamu všech zemí (veřejná trasa pro našeptávače).
 * @route GET /common/countries
 */
router.get("/countries", getCountries);

/**
 * Získání globálních statistik pro dashboard (počet zakázek, aktivní trasy atd.).
 * @route GET /common/stats
 */
router.get("/stats", checkAuthentication, getStats);

/**
 * Načtení aktivních přeprav pro aktuálně přihlášeného uživatele/firmu.
 * @route GET /common/active-shipments
 */
router.get("/active-shipments", checkAuthentication, getShipments);

/**
 * Získání možných stavů pro sestavy vozidel (např. Volno, Na cestě, Servis).
 * @route GET /common/composition_statuses/:id
 * @param {string} id - ID konkrétní sestavy.
 */
router.get(
  "/composition_statuses/:id",
  checkAuthentication,
  getCompositionStatuses,
);

export default router;

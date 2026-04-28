import express from "express";

import { checkAuthentication } from "../../middlewares/authMiddleware.js";

import {
  createCompany,
  companyRolesList,
  companyInfo,
  companyAvailableDrivers,
} from "./company.controller.js";

const router = express.Router();

router.get("/roles", companyRolesList);

router.post("/create", createCompany);

router.get("/drivers", checkAuthentication, companyAvailableDrivers);

router.get("/:id", checkAuthentication, companyInfo);

// router.get("/:id/rating");

export default router;

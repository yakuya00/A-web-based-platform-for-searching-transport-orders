import express from "express";

import {
    createCompany,
    companyRolesList,
    companyInfo
} from "./company.controller.js"


const router = express.Router();

router.get("/roles",
    companyRolesList);

router.post("/create",
    createCompany);

router.get("/:id", 
    companyInfo);


export default router;
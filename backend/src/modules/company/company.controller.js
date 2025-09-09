import asyncHandler from "express-async-handler";
import createError from "http-errors";

import {
    insertCompany,
    insertCompanyIdentifier,
    insertCompanyAddress,
    getCompanyRoles,
    getCompanyById
} from "./company.repository.js";
import { runTransaction } from "../../utils/dbUtils.js";

export const createCompany = asyncHandler(async (req, res, next) => {
    const { name, role_id, identifiers, addresses } = req.body;
    const companyId = await runTransaction(async (client) => {
        const company = await insertCompany(name, role_id, client);
        console.log(company.id);
        if (identifiers && identifiers.length > 0) {
            for(const { identifier_type_id, identifier_value } of identifiers) {
                console.log(identifier_type_id, identifier_value);
                await insertCompanyIdentifier(company.id, identifier_type_id, identifier_value, client);
            }
        }

        if (addresses && addresses.length > 0) {
            for (const { address_id, address_type_id } of addresses) {
                console.log(address_id, address_type_id);
                await insertCompanyAddress(company.id, address_id, address_type_id, client);
            }
        }
        return company.id;
    });

    res.status(201).json({
        message: "Company is successfully created.",
        error: false,
        company_id: companyId
    })
    
});

export const companyRolesList = asyncHandler(async (req, res, next) => {
    const companyRoles = await getCompanyRoles();
    if(companyRoles.length === 0){
        throw createError(404, "Company roles not found");
    }
    res.status(200).json(companyRoles);
});

export const companyInfo = asyncHandler(async (req, res, next) => {
    const company = await getCompanyById(req.params.id);
    if (!company) {
        throw createError(404, "User not found");
    }
    res.status(200).json(company);
});
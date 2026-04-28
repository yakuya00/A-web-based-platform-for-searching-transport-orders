import asyncHandler from "express-async-handler";
import createError from "http-errors";

import {
  insertCompany,
  insertCompanyIdentifier,
  insertCompanyAddress,
  getCompanyRoles,
  getCompanyById,
  getCompanyIdentifiersByCompanyId,
  getCompanyAddressesByCompanyId,
  getDriversByCompanyId,
} from "./company.repository.js";
import { runTransaction, insertLocation } from "../../utils/dbUtils.js";

import { USER_ROLES } from "../../constants/index.js";

export const createCompany = asyncHandler(async (req, res, next) => {
  const { name, role_id, identifiers, addresses } = req.body;
  //console.log(addresses);
  const companyId = await runTransaction(async (client) => {
    const company = await insertCompany(name, role_id, client);
    console.log(company.id);
    if (identifiers && identifiers.length > 0) {
      for (const { identifier_type_id, identifier_value } of identifiers) {
        await insertCompanyIdentifier(
          company.id,
          identifier_type_id,
          identifier_value,
          client,
        );
      }
    }

    if (addresses && addresses.length > 0) {
      for (const { address_type_id, nominatium_data } of addresses) {
        console.log(nominatium_data);
        const address_id = await insertLocation(nominatium_data, client);
        console.log(address_type_id);
        await insertCompanyAddress(
          company.id,
          address_id,
          address_type_id,
          client,
        );
      }
    }
    return company.id;
  });

  res.status(201).json({
    message: "Company is successfully created.",
    error: false,
    company_id: companyId,
  });
});

export const companyRolesList = asyncHandler(async (req, res, next) => {
  const companyRoles = await getCompanyRoles();
  if (companyRoles.length === 0) {
    throw createError(404, "Company roles not found");
  }
  res.status(200).json(companyRoles);
});

export const companyInfo = asyncHandler(async (req, res, next) => {
  const companyId = Number(req.params.id);
  console.log(req.user);
  const userCompanyId = req.user.company_id;
  const userRoleId = req.user.role_id;

  const baseInfo = await getCompanyById(companyId);
  if (!baseInfo) {
    throw createError(404, "Company not found");
  }

  const identifiers = await getCompanyIdentifiersByCompanyId(companyId);
  if (identifiers.length === 0) {
    throw createError(404, "Identifiers not found");
  }

  const addresses = await getCompanyAddressesByCompanyId(companyId);
  if (baseInfo.length === 0) {
    throw createError(404, "Addresses not found");
  }

  const isOwner =
    userCompanyId === companyId && userRoleId === USER_ROLES.ADMIN;

  res.status(200).json({
    ...baseInfo,
    identifiers,
    addresses,
    is_owner: isOwner,
  });
});

export const companyAvailableDrivers = asyncHandler(async (req, res, next) => {
  const companyId = req.user.company_id;
  const availableDrivers = await getDriversByCompanyId(companyId);
  console.log(availableDrivers);
  res.status(200).json(availableDrivers);
});

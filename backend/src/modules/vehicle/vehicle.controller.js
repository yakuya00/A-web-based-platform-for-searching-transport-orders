import asyncHandler from "express-async-handler";
import createError from "http-errors";

import { 
    getVehiclesByCompany,
    addVehicleByCompany,
    getVehicleInCompanyById,
    deleteVehicleFromCompanyById
} from "./vehicle.repository.js";

export const getAllVehiclesInCompany = asyncHandler(async (req, res, next) => {
    const filters = {};
    if (req.query.type) filters.vehicle_type = req.query.type; 

    const allVehicles = await getVehiclesByCompany(req.user.company_id, filters);
    if (allVehicles.length === 0){
        throw createError(404, "Vehicle not found");
    }

    res.status(200).json(allVehicles);
});

export const addVehicleToCompany = asyncHandler(async (req, res, next) => {
    const properties = req.body;
    const companyId = req.user.company_id;

    await addVehicleByCompany(companyId, properties);
    res.status(200).json({
        message: "Vehicle successfully added",
        error: false
    });
});

export const getVehicleInCompany = asyncHandler(async (req, res, next) => {
    const vehicleId = req.params.id;
    const companyId = req.user.company_id;

    const vehicle = await getVehicleInCompanyById(companyId, vehicleId);
    if (vehicle.length === 0){
        throw createError(404, "Vehicle not found");
    }
    res.status(200).json(vehicle);
});

export const deleteVehicleFromCompany = asyncHandler(async (req, res, next) => {
    const vehicleId = req.params.id;
    const companyId = req.user.company_id;

    await deleteVehicleFromCompanyById(companyId, vehicleId);

    res.status(200).json({
        message: "Vehicle successfully deleted",
        error: false
    });
});
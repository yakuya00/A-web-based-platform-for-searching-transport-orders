import asyncHandler from "express-async-handler";
import createError from "http-errors";

import {
  addVehicleCompositionByCompany,
  addCompositionTrailersByVehicleComposition,
  getAllVehicleCompositionsByCompany,
  getVehicleCompositionById,
  deleteVehicleCompositionById,
  getActiveCompositionsByCompany,
} from "./composition.repository.js";

import { COMPOSITION_STATUSES } from "../../constants/index.js";
import { runTransaction } from "../../utils/dbUtils.js";

export const addVehicleCompositionToCompany = asyncHandler(
  async (req, res, next) => {
    const { trailers, ...properties } = req.body;
    const companyId = req.user.company_id;

    await runTransaction(async (client) => {
      const vehicleComposition = await addVehicleCompositionByCompany(
        companyId,
        COMPOSITION_STATUSES.ACTIVE,
        properties,
        client,
      );
      console.log(vehicleComposition);
      await addCompositionTrailersByVehicleComposition(
        vehicleComposition.id,
        trailers,
        client,
      );
    });
    res.status(200).json({
      message: "Vehicle composition successfully added",
      error: false,
    });
  },
);

export const getAllVehicleCompositionsInCompany = asyncHandler(
  async (req, res, next) => {
    const companyId = req.user.company_id;
    const vehicleCompositions =
      await getAllVehicleCompositionsByCompany(companyId);
    if (vehicleCompositions.length === 0) {
      throw createError(404, "Vehicle compositions not found");
    }
    res.status(200).json(vehicleCompositions);
  },
);

export const getVehicleCompositionInCompany = asyncHandler(
  async (req, res, next) => {
    const companyId = req.user.company_id;
    const compositionId = Number(req.params.id);
    const vehicleComposition = await getVehicleCompositionById(
      companyId,
      compositionId,
    );
    if (vehicleComposition.length === 0) {
      throw createError(404, "Vehicle compositions not found");
    }
    res.status(200).json(...vehicleComposition);
  },
);

export const deleteVehicleCompositionFromCompany = asyncHandler(
  async (req, res, next) => {
    const companyId = req.user.company_id;
    const compositionId = Number(req.params.id);
    await deleteVehicleCompositionById(companyId, compositionId);

    res.status(200).json({
      message: "Vehicle composition successfully deleted",
      error: false,
    });
  },
);

export const getAvailableCompositions = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const compositions = await getActiveCompositionsByCompany(companyId);

  res.status(200).json(compositions);
});

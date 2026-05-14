/**
 * Controller pro správu jízdních souprav (vehicle compositions).
 * Zajišťuje logiku vytváření, mazání a aktualizace souprav v rámci firmy.
 * @module modules/composition/composition.controller
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {
  addVehicleCompositionByCompany,
  addCompositionTrailersByVehicleComposition,
  getAllVehicleCompositionsByCompany,
  getVehicleCompositionById,
  deleteVehicleCompositionById,
  getActiveCompositionsByCompany,
  updateCompositionById,
} from "./composition.repository.js";
import { COMPOSITION_STATUSES } from "../../constants/index.js";
import { runTransaction } from "../../utils/dbUtils.js";

/**
 * Vytvoří novou jízdní soupravu a přiřadí k ní seznam přívěsů.
 * @function addVehicleCompositionToCompany
 * @param {import('express').Request} req - Obsahuje body s parametry soupravy a polem ID přívěsů (trailers).
 * @param {import('express').Response} res - Potvrzení o vytvoření.
 */
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

/**
 * Získá seznam všech souprav patřících firmě přihlášeného uživatele.
 * @function getAllVehicleCompositionsInCompany
 * @param {import('express').Request} req - Objekt požadavku s daty uživatele.
 * @param {import('express').Response} res - JSON pole souprav.
 * @throws {HttpError} 404 - Pokud firma nemá žádné soupravy.
 */
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

/**
 * Načte detail jedné konkrétní soupravy.
 * @function getVehicleCompositionInCompany
 * @param {import('express').Request} req - Obsahuje ID soupravy v params.id.
 * @param {import('express').Response} res - Objekt soupravy.
 * @throws {HttpError} 404 - Pokud souprava neexistuje.
 */
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

/**
 * Smaže soupravu z databáze firmy.
 * @function deleteVehicleCompositionFromCompany
 * @param {import('express').Request} req - Obsahuje ID soupravy k odstranění.
 * @throws {HttpError} 400 - Pokud soupravu nelze smazat (např. je na cestě).
 */
export const deleteVehicleCompositionFromCompany = asyncHandler(
  async (req, res, next) => {
    const companyId = req.user.company_id;
    const compositionId = Number(req.params.id);
    const isDeleted = await deleteVehicleCompositionById(
      companyId,
      compositionId,
    );

    if (!isDeleted) {
      throw createError(
        400,
        "Nelze smazat soupravu. Pravděpodobně je aktuálně na cestě nebo neexistuje.",
      );
    }

    res.status(200).json({
      message: "Vehicle composition successfully deleted",
      error: false,
    });
  },
);

/**
 * Načte seznam souprav, které mají status 'ACTIVE' a jsou připraveny k jízdě.
 * @function getAvailableCompositions
 */
export const getAvailableCompositions = asyncHandler(async (req, res, next) => {
  const companyId = req.user.company_id;
  const compositions = await getActiveCompositionsByCompany(companyId);

  res.status(200).json(compositions);
});

/**
 * Aktualizuje parametry soupravy (např. přiřazení řidiče nebo tahače).
 * @function changeVehicleComposition
 * @param {import('express').Request} req - Obsahuje ID v params a nová data v body.
 */
export const changeVehicleComposition = asyncHandler(async (req, res, next) => {
  const compositionId = Number(req.params.id);
  const data = req.body;

  await updateCompositionById(compositionId, data);

  res.status(200).json({
    message: "Vehicle composition successfully updated",
    error: false,
  });
});

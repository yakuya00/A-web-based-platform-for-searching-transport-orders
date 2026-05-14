/**
 * Controller pro správu hodnocení mezi účastníky přepravy.
 * Obsahuje komplexní validaci obchodních pravidel pro zajištění integrity recenzí.
 * @module modules/rating/rating.controller
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {
  getCompaniesByOrderId,
  getCompanyIdByUserId,
  getRatingByCompanyIdAndOrderId,
  insertRating,
} from "./rating.repository.js";
import { ORDER_STATUSES } from "../../constants/index.js";

/**
 * Přidá hodnocení protistraně po dokončení objednávky.
 * @param {import('express').Request} req - Body obsahuje order_id, to_company_id, score (0-5) a komentář.
 * @param {import('express').Response} res - Potvrzení o úspěšném uložení.
 * @throws {HttpError} 400 - Neplatné skóre, zakázka není dokončena nebo duplicitní hodnocení.
 * @throws {HttpError} 403 - Uživatel není účastníkem dané zakázky.
 * @throws {HttpError} 404 - Zakázka nenalezena.
 */
export const addRatingToCompany = asyncHandler(async (req, res, next) => {
  const { order_id, to_company_id, score, comment } = req.body;
  const fromUserId = req.user.id;
  const userCompanyId = req.user.company_id;

  if (score < 0 || score > 5) {
    throw createError(400, "Rate must be between 0 and 5.");
  }

  const order = await getCompaniesByOrderId(order_id);
  if (!order) {
    throw createError(404, "Order not found");
  }

  if (order.status !== ORDER_STATUSES.COMPLETED) {
    throw createError(400, "Rating can only be given for completed orders");
  }

  if (
    ![order.customer_company_id, order.carrier_company_id].includes(
      userCompanyId,
    )
  ) {
    throw createError(403, "You are not associated with this order");
  }

  //   if (userCompanyId === to_company_id) {
  //     throw createError(400, "Rating own company not allowed");
  //   }

  if (
    ![order.customer_company_id, order.carrier_company_id].includes(
      to_company_id,
    )
  ) {
    throw createError(
      400,
      "You can only evaluate the second compnany on the order",
    );
  }

  const existing = await getRatingByCompanyIdAndOrderId(
    userCompanyId,
    order_id,
  );

  if (existing) {
    throw createError(400, "You already left a review for this order");
  }

  const rating = await insertRating(
    order_id,
    fromUserId,
    to_company_id,
    score,
    comment,
  );

  res.status(201).json({
    message: "Rating successfully added",
    error: false,
  });
});

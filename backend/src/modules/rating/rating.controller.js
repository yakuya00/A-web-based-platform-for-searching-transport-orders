import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {
  getCompaniesByOrderId,
  getCompanyIdByUserId,
  getRatingByCompanyIdAndOrderId,
  insertRating,
} from "./rating.repository.js";
import { ORDER_STATUSES } from "../../constants/index.js";

export const addRatingToCompany = asyncHandler(async (req, res, next) => {
  const { order_id, to_company_id, score, comment } = req.body;
  const fromUserId = req.user.id;
  const userCompanyId = req.user.company_id;
  console.log(req.body);

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
  console.log(order);
  // 5. Проверка: юзер участвует в заказе
  if (
    ![order.customer_company_id, order.carrier_company_id].includes(
      userCompanyId,
    )
  ) {
    throw createError(403, "You are not associated with this order");
  }

  // 6. Проверка: нельзя оценить свою компанию
  //   if (userCompanyId === to_company_id) {
  //     throw createError(400, "Rating own company not allowed");
  //   }

  // 7. Проверка: toCompanyId действительно вторая сторона заказа
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

  // 8. Проверка: не оставляли ли уже отзыв
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

import asyncHandler from "express-async-handler";
import createError from "http-errors";

import { runTransaction, insertLocation } from "../../utils/dbUtils.js";

import {
  addOrderInfo,
  insertOrder,
  addStatusHistoryByOrder,
  getOrderInformationById,
  deleteOrderById,
  getOrders,
  addOrderOfferByOrderId,
  getMyOffersByCompanyId,
  getOffersByOrderId,
  getOfferByIdForUpdate,
  updateOfferStatus,
  rejectOtherOffers,
  updateOrderPriceAndCurrency,
  addOrderStatusHistory,
  getOrderOwnershipForUpdate,
  rejectAllOffersForOrder,
  assignCompositionToOrder,
  generateOrderQRCodes,
  updateCompositionStatusByName,
  getOrderQRCodesByOrderId,
  getActiveOrdersByDriverId,
  verifyOrderQrToken,
  freeUpVehicleComposition,
  getLatestOrderStatus,
} from "./order.repository.js";

import { ORDER_STATUSES } from "../../constants/index.js";

export const addOrder = asyncHandler(async (req, res, next) => {
  const orderInfo = req.body;
  const companyId = req.user.company_id;
  const userId = req.user.id;
  console.log(orderInfo.currency);
  await runTransaction(async (client) => {
    const loadingAddressId = await insertLocation(orderInfo.loading_address);
    const unloadingAddressId = await insertLocation(
      orderInfo.unloading_address,
    );

    const orderId = await addOrderInfo(
      companyId,
      orderInfo,
      loadingAddressId,
      unloadingAddressId,
      userId,
      client,
    );

    await addStatusHistoryByOrder(
      orderId,
      userId,
      ORDER_STATUSES.CREATED,
      client,
    );
  });

  res.status(200).json({
    message: "Order successfully added",
    error: false,
  });
});

export const getOrderInformation = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const orderInfo = await getOrderInformationById(orderId, userId);
  if (!orderInfo) {
    throw createError(404, "Order not found");
  }
  console.log(orderInfo);
  res.status(200).json(orderInfo);
});

export const deleteOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  await deleteOrderById(orderId);
  res.status(200).json({
    message: "Order successfully deleted",
    error: false,
  });
});

export const searchOrders = asyncHandler(async (req, res, next) => {
  const myCompanyId = req.user.company_id;
  const orders = await getOrders({
    ...req.query,
    excludeCompanyId: myCompanyId,
  });
  res.status(200).json(orders);
});

export const getMyOrders = asyncHandler(async (req, res, next) => {
  const companyId = req.user.company_id;
  const { page, tab = "active" } = req.query;
  let targetStatuses = [];
  if (tab === "active") {
    targetStatuses = ["created", "assign", "in_progress"];
  } else {
    targetStatuses = ["completed", "cancelled"];
  }
  const orders = await getOrders({ page, statuses: targetStatuses, companyId });
  res.status(200).json(orders);
});

export const cancellMyOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const companyId = req.user.company_id;
  await runTransaction(async (client) => {
    const order = await getOrderOwnershipForUpdate(orderId, client);

    if (!order) {
      throw createError(404, "Zakázka nebyla nalezena");
    }

    // 🔥 Главная защита: нельзя отменить чужой груз!
    if (order.company_id !== companyId) {
      throw createError(403, "Nemáte oprávnění stornovat tuto zakázku");
    }

    // 2. Добавляем запись в историю статусов -> 'cancelled'
    // (Используем ту самую функцию addOrderStatusHistory, которую мы починили в прошлом шаге)
    await addOrderStatusHistory(orderId, "cancelled", userId, client);

    // 3. 🔥 Финализируем ставки: переводим ВСЕ предложения ТК в 'rejected'
    // Теперь даже на уровне БД у ТК будет статус "Отклонено"
    await rejectAllOffersForOrder(orderId, client);
  });
  await addStatusHistoryByOrder(orderId, userId, ORDER_STATUSES.CANCELLED);
  res
    .status(200)
    .json({ message: "Order successfully cancelled", error: false });
});

export const addOrderOffer = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const companyId = req.user.company_id;
  const { price } = req.body;
  try {
    await addOrderOfferByOrderId(orderId, companyId, price);
    res.status(200).json({ message: "Offer successfully added", error: false });
  } catch (err) {
    if (err.message.includes("již podala nabídku")) {
      return res.status(409).json({
        message: err.message,
        error: true,
      });
    }

    next(err);
  }
});

export const getMyOffers = asyncHandler(async (req, res, next) => {
  // Достаем ID компании из токена текущего диспетчера
  const companyId = req.user.company_id;

  try {
    const offers = await getMyOffersByCompanyId(companyId);
    // Возвращаем массив ставок на фронт
    console.log(offers);
    res.status(200).json(offers);
  } catch (err) {
    console.error("Chyba při stahování nabídek:", err);
    next(err);
  }
});

// order.controller.js (или offer.controller.js)

export const getOrderOffers = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;

  // Базовая проверка
  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ message: "Neplatné ID zakázky" });
  }

  try {
    // Дергаем нашу пушечную функцию из базы
    const offers = await getOffersByOrderId(orderId);
    // Отдаем массив предложений (даже если он пустой, фронт сам покажет "Нет предложений")
    res.status(200).json(offers);
  } catch (err) {
    console.error("Chyba při stahování nabídek pro zakázku:", err);
    next(err);
  }
});

export const acceptOffer = asyncHandler(async (req, res, next) => {
  const offerId = req.params.id;
  const companyId = req.user.company_id; // Компания заказчика
  const userId = req.user.id; // Диспетчер заказчика

  // 🔥 Вся логика внутри транзакции
  await runTransaction(async (client) => {
    // 1. Находим ставку
    const offer = await getOfferByIdForUpdate(offerId, client);
    if (!offer) {
      throw createError(404, "Nabídka nenalezena"); // Твоя функция createError
    }

    // 2. Валидация прав доступа и логики
    if (offer.order_company_id !== companyId) {
      throw createError(403, "Nemáte oprávnění k této zakázce");
    }
    if (offer.status !== "pending") {
      throw createError(400, "Tuto nabídku již nelze přijmout");
    }

    const orderId = offer.order_id;

    // 3. Делаем ставку выигрышной
    await updateOfferStatus(offerId, "accepted", client);

    // 4. Отклоняем конкурентов
    await rejectOtherOffers(orderId, offerId, client);

    // 5. Фиксируем цену в самом заказе
    await updateOrderPriceAndCurrency(orderId, offer.proposed_price, client);

    // 6. Меняем статус заказа на "Назначен" (assigned)
    await addOrderStatusHistory(orderId, "assign", userId, client);
  });

  // Если runTransaction отработал без ошибок (сделал COMMIT), отдаем успех
  res.status(200).json({
    message: "Nabídka byla úspěšně přijata",
    error: false,
  });
});

export const assignVehicleToOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { compositionId } = req.body; // Получаем ID выбранной машины с фронта
  const userId = req.user.id;

  if (!compositionId) {
    throw createError(400, "Musíte vybrat vozidlo");
  }

  await runTransaction(async (client) => {
    // 1. Привязываем машину к заказу
    await assignCompositionToOrder(orderId, compositionId, client);

    // 2. Генерируем QR-коды для рейса
    await generateOrderQRCodes(orderId, client);

    await updateCompositionStatusByName(compositionId, "on_trip", client);
  });

  res.status(200).json({
    message: "Vozidlo bylo úspěšně přiřazeno a QR kódy byly vygenerovány",
    error: false,
  });
});

export const getOrderQRCodes = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const qrCodes = await getOrderQRCodesByOrderId(orderId);

  if (!qrCodes || qrCodes.length === 0) {
    throw createError(404, "QR kódy pro tuto zakázku nebyly nalezeny");
  }

  res.status(200).json(qrCodes);
});

export const getDriverMyOrders = asyncHandler(async (req, res, next) => {
  const driverId = req.user.id; // Берем ID водителя из токена авторизации

  const orders = await getActiveOrdersByDriverId(driverId);
  res.status(200).json(orders);
});

export const scanOrderQRCode = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { token } = req.body;
  const userId = req.user.id; // ID водителя

  if (!token) {
    throw createError(400, "QR token chybí");
  }

  // 1. Ищем токен в базе
  const validToken = await verifyOrderQrToken(orderId, token);

  if (!validToken) {
    // Если токен не найден, выкидываем ошибку (код не от этого заказа)
    throw createError(400, "Neplatný QR kód pro tuto zakázku");
  }

  const tokenType = validToken.token_type;
  const currentStatus = await getLatestOrderStatus(orderId);

  // Проверяем логику последовательности
  if (tokenType === "pickup" && currentStatus !== "assign") {
    throw createError(
      400,
      "Tento náklad už byl vyzvednut, nebo není připraven k nakládce.",
    );
  }

  if (tokenType === "delivered" && currentStatus !== "in_progress") {
    throw createError(
      400,
      "Nelze doručit náklad, který ještě nebyl vyzvednut! Naskenujte kód pro nakládku.",
    );
  }

  let newStatus = "";
  let responseMessage = "";

  // 3. Запускаем безопасную транзакцию
  await runTransaction(async (client) => {
    if (tokenType === "pickup") {
      newStatus = "in_progress";
      responseMessage = "Náklad úspěšně naložen. Šťastnou cestu!";
      await addOrderStatusHistory(orderId, newStatus, userId, client);
    } else if (tokenType === "delivered") {
      newStatus = "completed";
      responseMessage = "Náklad úspěšně doručen. Zakázka je dokončena!";
      await addOrderStatusHistory(orderId, newStatus, userId, client);

      // ОСВОБОЖДАЕМ ФУРУ
      await freeUpVehicleComposition(orderId, client);
    }
  });

  // 3. Отдаем успешный ответ фронтенду
  res.status(200).json({
    message: responseMessage,
    status: newStatus,
  });
});

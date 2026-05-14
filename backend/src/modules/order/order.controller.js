/**
 * Controller pro komplexní správu životního cyklu objednávek.
 * Obsahuje logiku od vytvoření zakázky přes aukční systém (nabídky)
 * až po logistické operace řidiče (QR skenování).
 * @module modules/order/order.controller
 */

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
import { sendRecipientQRCode } from "../../utils/email.js";

/**
 * Vytvoří novou objednávku přepravy včetně validace adres.
 * @param {import('express').Request} req - Body obsahuje detaily nákladu a adresy.
 * @throws {HttpError} 400/500 při chybě v transakci nebo validaci adres.
 */
export const addOrder = asyncHandler(async (req, res, next) => {
  const orderInfo = req.body;
  const companyId = req.user.company_id;
  const userId = req.user.id;
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

/**
 * Získá kompletní detailní informace o konkrétní objednávce.
 * @param {import('express').Request} req - Obsahuje ID zakázky v params.
 * @throws {HttpError} 404 - Pokud zakázka neexistuje.
 */
export const getOrderInformation = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const orderInfo = await getOrderInformationById(orderId, userId);
  if (!orderInfo) {
    throw createError(404, "Order not found");
  }
  res.status(200).json(orderInfo);
});

/**
 * Fyzicky odstraní objednávku z databáze.
 * @param {import('express').Request} req - ID zakázky v URL parametrech.
 */
export const deleteOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  await deleteOrderById(orderId);
  res.status(200).json({
    message: "Order successfully deleted",
    error: false,
  });
});

/**
 * Veřejné vyhledávání zakázek s vyloučením vlastních nabídek firmy.
 * @param {Object} req.query - Filtry pro vyhledávání (lokace, váha, termín).
 */
export const searchOrders = asyncHandler(async (req, res, next) => {
  const myCompanyId = req.user.company_id;
  const orders = await getOrders({
    ...req.query,
    excludeCompanyId: myCompanyId,
  });
  res.status(200).json(orders);
});

/**
 * Načte seznam zakázek přihlášené firmy rozdělený na aktivní a ukončené.
 * @function getMyOrders
 * @param {string} tab - Určuje filtr stavů ('active' nebo 'history').
 */
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

/**
 * Zruší aktivní objednávku (storno) a odmítne všechny podané nabídky.
 * @param {Object} req - Parametr id v URL.
 * @throws {403} Pokud se uživatel snaží zrušit cizí zakázku.
 */
export const cancellMyOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const companyId = req.user.company_id;
  await runTransaction(async (client) => {
    const order = await getOrderOwnershipForUpdate(orderId, client);

    if (!order) {
      throw createError(404, "Zakázka nebyla nalezena");
    }

    if (order.company_id !== companyId) {
      throw createError(403, "Nemáte oprávnění stornovat tuto zakázku");
    }

    await addOrderStatusHistory(orderId, "cancelled", userId, client);

    await rejectAllOffersForOrder(orderId, client);
  });
  await addStatusHistoryByOrder(orderId, userId, ORDER_STATUSES.CANCELLED);
  res
    .status(200)
    .json({ message: "Order successfully cancelled", error: false });
});

/**
 * Podá cenovou nabídku na vybranou zakázku.
 * @function addOrderOffer
 * @param {number} price - Navrhovaná cena v těle požadavku.
 * @throws {409} Pokud již firma na tuto zakázku nabídku podala.
 */
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

/**
 * Získá seznam všech nabídek podaných firmou přihlášeného uživatele.
 * @function getMyOffers
 */
export const getMyOffers = asyncHandler(async (req, res, next) => {
  const companyId = req.user.company_id;

  try {
    const offers = await getMyOffersByCompanyId(companyId);
    res.status(200).json(offers);
  } catch (err) {
    console.error("Chyba při stahování nabídek:", err);
    next(err);
  }
});

/**
 * Načte všechny přijaté nabídky pro konkrétní zakázku (pro potřeby zadavatele).
 * @function getOrderOffers
 * @param {string} id - ID zakázky.
 */
export const getOrderOffers = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ message: "Neplatné ID zakázky" });
  }

  try {
    const offers = await getOffersByOrderId(orderId);
    res.status(200).json(offers);
  } catch (err) {
    console.error("Chyba při stahování nabídek pro zakázku:", err);
    next(err);
  }
});

/**
 * Přijme konkrétní cenovou nabídku, zafixuje cenu a odmítne ostatní zájemce.
 * @function acceptOffer
 * @param {string} id - ID přijímané nabídky v parametrech URL.
 */
export const acceptOffer = asyncHandler(async (req, res, next) => {
  const offerId = req.params.id;
  const companyId = req.user.company_id;
  const userId = req.user.id;

  await runTransaction(async (client) => {
    const offer = await getOfferByIdForUpdate(offerId, client);
    if (!offer) {
      throw createError(404, "Nabídka nenalezena");
    }

    if (offer.order_company_id !== companyId) {
      throw createError(403, "Nemáte oprávnění k této zakázce");
    }
    if (offer.status !== "pending") {
      throw createError(400, "Tuto nabídku již nelze přijmout");
    }

    const orderId = offer.order_id;

    await updateOfferStatus(offerId, "accepted", client);

    await rejectOtherOffers(orderId, offerId, client);

    await updateOrderPriceAndCurrency(orderId, offer.proposed_price, client);

    await addOrderStatusHistory(orderId, "assign", userId, client);
  });
  res.status(200).json({
    message: "Nabídka byla úspěšně přijata",
    error: false,
  });
});

/**
 * Přiřadí vozidlo k zakázce, změní stav soupravy a odešle QR kódy příjemci.
 * @function assignVehicleToOrder
 */
export const assignVehicleToOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { compositionId } = req.body;
  const userId = req.user.id;

  if (!compositionId) {
    throw createError(400, "Musíte vybrat vozidlo");
  }

  await runTransaction(async (client) => {
    const recipientEmail = await assignCompositionToOrder(
      orderId,
      compositionId,
      client,
    );

    const { deliveryToken } = await generateOrderQRCodes(orderId, client);

    await updateCompositionStatusByName(compositionId, "on_trip", client);

    if (recipientEmail) {
      await sendRecipientQRCode(recipientEmail, orderId, deliveryToken);
    }
  });

  res.status(200).json({
    message: "Vozidlo bylo úspěšně přiřazeno a QR kódy byly vygenerovány",
    error: false,
  });
});

/**
 * Získá vygenerované QR kódy (pro nakládku a vykládku) k dané zakázce.
 * @function getOrderQRCodes
 * @throws {404} Pokud kódy ještě nebyly vygenerovány (před přiřazením vozu).
 */
export const getOrderQRCodes = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const qrCodes = await getOrderQRCodesByOrderId(orderId);

  if (!qrCodes || qrCodes.length === 0) {
    throw createError(404, "QR kódy pro tuto zakázku nebyly nalezeny");
  }

  res.status(200).json(qrCodes);
});

/**
 * Načte seznam zakázek, které jsou aktuálně přiřazeny přihlášenému řidiči.
 * @function getDriverMyOrders
 * @returns {Promise<Array>} Pole zakázek pro řidiče.
 */
export const getDriverMyOrders = asyncHandler(async (req, res, next) => {
  const driverId = req.user.id;

  const orders = await getActiveOrdersByDriverId(driverId);
  res.status(200).json(orders);
});

/**
 * Hlavní logistická funkce: Zpracuje naskenovaný QR kód a posune stav přepravy (nakládka/vykládka).
 * @function scanOrderQRCode
 * @param {string} token - Token z QR kódu v těle požadavku.
 */
export const scanOrderQRCode = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) {
    throw createError(400, "QR token chybí");
  }

  const validToken = await verifyOrderQrToken(orderId, token);

  if (!validToken) {
    throw createError(400, "Neplatný QR kód pro tuto zakázku");
  }

  const tokenType = validToken.token_type;
  const currentStatus = await getLatestOrderStatus(orderId);

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

  await runTransaction(async (client) => {
    if (tokenType === "pickup") {
      newStatus = "in_progress";
      responseMessage = "Náklad úspěšně naložen. Šťastnou cestu!";
      await addOrderStatusHistory(orderId, newStatus, userId, client);
    } else if (tokenType === "delivered") {
      newStatus = "completed";
      responseMessage = "Náklad úspěšně doručen. Zakázka je dokončena!";
      await addOrderStatusHistory(orderId, newStatus, userId, client);

      await freeUpVehicleComposition(orderId, client);
    }
  });

  res.status(200).json({
    message: responseMessage,
    status: newStatus,
  });
});

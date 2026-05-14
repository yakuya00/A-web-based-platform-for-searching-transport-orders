/**
 * Router pro komplexní správu objednávek přepravy (Order Management System).
 * Pokrývá životní cyklus zakázky: vytvoření, vyhledávání, nabídky (offers),
 * přiřazení vozidla a QR validaci.
 * @module modules/order/order.routres
 * @returns {import('express').Router} Express router.
 */

import express from "express";
import { checkAuthentication } from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import {
  addOrder,
  getOrderInformation,
  deleteOrder,
  searchOrders,
  getMyOrders,
  cancellMyOrder,
  addOrderOffer,
  getMyOffers,
  getOrderOffers,
  acceptOffer,
  assignVehicleToOrder,
  getOrderQRCodes,
  getDriverMyOrders,
  scanOrderQRCode,
} from "./order.controller.js";
import { USER_ROLES } from "../../constants/index.js";

const router = express.Router();

/**
 * Vytvoření nové objednávky přepravy.
 * @route POST /order/
 */
router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addOrder,
);

/**
 * Podání cenové nabídky (offer) na existující zakázku.
 * @route POST /order/:id/offer
 * @param {string} id - ID objednávky.
 */
router.post(
  "/:id/offer",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addOrderOffer,
);

/**
 * Přímé přiřazení jízdní soupravy k zakázce (používá dopravce).
 * @route POST /order/:id/assign-vehicle
 */
router.post(
  "/:id/assign-vehicle",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  assignVehicleToOrder,
);

/**
 * Validace nakládky/vykládky pomocí skenování QR kódu řidičem.
 * @route POST /order/:id/scan-qr
 */
router.post(
  "/:id/scan-qr",
  checkAuthentication,
  checkRole([USER_ROLES.DRIVER]),
  scanOrderQRCode,
);

/**
 * Zrušení vlastní objednávky (storno).
 * @route POST /order/cancell/:id
 */
router.post(
  "/cancell/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  cancellMyOrder,
);

/**
 * Seznam aktivních zakázek přiřazených konkrétnímu řidiči.
 * @route GET /order/driver
 */
router.get(
  "/driver",
  checkAuthentication,
  checkRole([USER_ROLES.DRIVER]),
  getDriverMyOrders,
);

/**
 * Veřejné vyhledávání volných zakázek na trhu.
 * @route GET /order/search
 */
router.get(
  "/search",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  searchOrders,
);

/**
 * Seznam aktivních zakázek firmy uživatele (vlastní vytvořené).
 * @route GET /order/my-active
 */
router.get(
  "/my-active",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyOrders,
);

/**
 * Seznam nabídek (offers), které podala firma uživatele.
 * @route GET /order/my-offers
 */
router.get(
  "/my-offers",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyOffers,
);

/**
 * Seznam všech přijatých nabídek pro konkrétní zakázku.
 * @route GET /order/:id/offer
 */
router.get(
  "/:id/offer",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getOrderOffers,
);

/**
 * Získání QR kódů pro potvrzení fází přepravy.
 * @route GET /order/:id/qr-codes
 */
router.get(
  "/:id/qr-codes",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getOrderQRCodes,
);

/**
 * Přijetí konkrétní cenové nabídky a uzavření kontraktu.
 * @route POST /order/offer/:id/accept
 */
router.post(
  "/offer/:id/accept",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  acceptOffer,
);

/**
 * Detailní informace o zakázce.
 * @route GET /order/:id
 */
router.get("/:id", checkAuthentication, getOrderInformation);

/**
 * Fyzické odstranění/archivace zakázky.
 * @route DELETE /order/:id
 */
router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  deleteOrder,
);

export default router;

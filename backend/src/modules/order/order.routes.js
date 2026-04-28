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

router.post(
  "/",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addOrder,
);

router.post(
  "/:id/offer",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  addOrderOffer,
);
router.post(
  "/:id/assign-vehicle",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  assignVehicleToOrder,
); ///////////////////////////////////////////////////////////////////////

router.post(
  "/:id/assign-vehicle",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  assignVehicleToOrder,
); //////////////////////////////////////////////////////////////////

router.post(
  "/:id/scan-qr",
  checkAuthentication,
  checkRole([USER_ROLES.DRIVER]),
  scanOrderQRCode,
);

router.post(
  "/cancell/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  cancellMyOrder,
);

// router.get("/",
//     checkAuthentication,
//     );

router.get(
  "/driver",
  checkAuthentication,
  checkRole([USER_ROLES.DRIVER]),
  getDriverMyOrders,
);
router.get(
  "/search",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  searchOrders,
);

router.get(
  "/my-active",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyOrders,
);

router.get(
  "/my-offers",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getMyOffers,
);

router.get(
  "/:id/offer",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getOrderOffers,
);

router.get(
  "/:id/qr-codes",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  getOrderQRCodes,
);

router.post(
  "/offer/:id/accept",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  acceptOffer,
);

router.get("/:id", checkAuthentication, getOrderInformation);

router.delete(
  "/:id",
  checkAuthentication,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  deleteOrder,
);

export default router;

// ## 4. Заказы (zakázky)

// - `GET    /api/orders` — поиск/фильтрация заказов (по локации, датам, размеру и т.д.)
// - `POST   /api/orders` — создать заказ (отправитель)
// - `GET    /api/orders/:id` — детали заказа
// - `PUT    /api/orders/:id` — обновить заказ (до назначения)
// - `DELETE /api/orders/:id` — отменить заказ

// - `POST   /api/orders/:id/assign` — назначить исполнителя (carrier)
// - `POST   /api/orders/:id/status` — сменить статус заказа (например, "in_progress", "completed")
// - `GET    /api/orders/:id/history` — история статусов

// - `GET    /api/orders/:id/qr?type=pickup|delivered` — получить QR-код для этапа (для водителя/отправителя)
// - `POST   /api/orders/:id/confirm` — подтвердить этап по QR (водитель сканирует, отправляет токен)

/**
 * Hlavní konfigurační soubor aplikace Express.
 * Zde dochází k registraci middleware, definici CORS politiky a propojení všech modulárních routerů.
 * @module app
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";

import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import companyRouter from "./modules/company/company.routes.js";
import vehicleRouter from "./modules/vehicle/vehicle.routes.js";
import compositionRouter from "./modules/composition/composition.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import ratingRouter from "./modules/rating/rating.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import commonRouter from "./modules/common/common.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";

// Konfigurace cest pro ES Moduly (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(logger("dev")); // Výpis požadavků do konzole pro vývoj

/**
 * CORS KONFIGURACE
 * Zajišťuje bezpečnou komunikaci mezi frontendem a backendem.
 */
app.use(
  cors({
    //origin: 'http://localhost:5173',

    // Definice povolených domén (včetně mobilních zařízení v lokální síti)
    origin: [
      "https://localhost:5173", // pro testy z pocitace
      "http://192.168.0.101:5173", // Pro testy z telefona
    ],

    // Povolení odesílání cookies (nezbytné pro JWT Refresh Token v HttpOnly cookie)
    credentials: true,
  }),
);

app.use(express.json()); // Podpora pro JSON body v požadavcích
app.use(express.urlencoded({ extended: false })); // Podpora pro URL-encoded data
app.use(cookieParser()); // Parsování cookies pro práci s Refresh Tokenem
app.use(express.static(path.join(__dirname, "public"))); // Statické soubory (obrázky, dokumenty)

/**
 * REGISTRACE ROUTERŮ (API ENDPOINTY)
 */
app.use("/auth", authRouter); // Autentizace a registrace
app.use("/user", userRouter); // Správa uživatelů
app.use("/company", companyRouter); // Profil firmy a nastavení
app.use("/vehicle", vehicleRouter); // Evidence vozidel
app.use("/vehicle-composition", compositionRouter); // Jízdní soupravy
app.use("/order", orderRouter); // Objednávky, nabídky a přeprava
app.use("/common", commonRouter); // Společné utility (geolokace, číselníky)
app.use("/rating", ratingRouter); // Reputace a hodnocení
app.use("/chat", chatRouter); // Komunikace v rámci zakázek

/**
 * CHYBOVÉ MIDDLEWARE
 * Musí být definováno jako poslední pro zachycení všech chyb z routerů.
 */
app.use(errorHandler);

export default app;

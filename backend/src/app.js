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

const __filename = fileURLToPath(import.meta.url); // <-- для ESM
const __dirname = path.dirname(__filename); // <-- для ESM

const app = express();

app.use(logger("dev"));
app.use(
  cors({
    // 1. Указываем ТОЧНЫЙ адрес фронтенда (без слэша в конце!)
    //origin: 'http://localhost:5173',
    origin: [
      "https://localhost:5173", // Для тестов с самого компа
      "http://192.168.0.101:5173", // Для тестов с телефона! (твой IP)
    ],

    // 2. Разрешаем куки (это критически важно для Refresh Token)
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/vehicle", vehicleRouter);
app.use("/vehicle-composition", compositionRouter);
app.use("/order", orderRouter);
app.use("/common", commonRouter);
app.use("/rating", ratingRouter);
app.use("/chat", chatRouter);

app.use(errorHandler);

export default app;

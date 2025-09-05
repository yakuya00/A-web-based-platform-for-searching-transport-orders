import express from "express";

const router = express.Router();

router.get("/me", ...);
router.post("/me", ...);
router.get("/:id", ...);
router.get("/users?company_id=");

- `GET    /api/users/me` — информация о себе
- `PUT    /api/users/me` — обновить свой профиль
- `GET    /api/users/:id` — инфо о пользователе
- `GET    /api/users?company_id=` — список пользователей компании



export default router;
import { getUserChatList } from "../chat/chat.repository.js"; // 🔥 Проверь правильность пути к файлу БД
import createError from "http-errors"; // Или твоя утилита для ошибок
import asyncHandler from "express-async-handler";

// Обертка asyncHandler (если используешь) или просто try-catch
export const getMyChats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) {
    throw createError(401, "Uživatel není autorizován");
  }

  // Идем в базу за чатами
  const chats = await getUserChatList(userId);
  console.log(chats);

  // Отдаем на фронт
  res.status(200).json(chats);
});

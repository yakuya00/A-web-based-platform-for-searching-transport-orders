/**
 * Controller pro správu konverzací uživatele.
 * @module modules/chat/сhat.controller
 */

import { getUserChatList } from "../chat/chat.repository.js";
import createError from "http-errors";
import asyncHandler from "express-async-handler";

/**
 * Získá seznam všech chatů, kterých se účastní aktuálně přihlášený uživatel.
 * @function getMyChats
 * @param {import('express').Request} req - Request obsahující data uživatele z tokenu.
 * @param {import('express').Response} res - Response pro odeslání seznamu chatů.
 * @throws {HttpError} 401 - Pokud v objektu requestu chybí ID uživatele.
 */
export const getMyChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    throw createError(401, "Uživatel není autorizován");
  }

  const chats = await getUserChatList(userId);

  res.status(200).json(chats);
});

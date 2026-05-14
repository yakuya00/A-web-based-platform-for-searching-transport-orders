/**
 * Controller pro správu uživatelských profilů a administraci zaměstnanců v rámci firmy.
 * @module modules/user/user.controller
 */

import asyncHandler from "express-async-handler";
import createError from "http-errors";
import {
  getUserById,
  getUserRoles,
  getAllUsersByCompany,
  isDriverLinkedToComposition,
  updateUserIsActiveByUserId,
} from "./user.repository.js";
import { USER_ROLES } from "../../constants/index.js";

/**
 * Získá profil aktuálně přihlášeného uživatele.
 * @function getMe
 * @param {import('express').Request} req - Požadavek obsahující identifikaci uživatele z tokenu.
 * @throws {HttpError} 401 - Neautorizovaný přístup.
 * @throws {HttpError} 404 - Uživatel nenalezen.
 */
export const getMe = asyncHandler(async (req, res, next) => {
  if (!req.user?.id) {
    throw createError(401, "Unauthorized");
  }
  const user = await getUserById(req.user.id);
  if (!user) {
    throw createError(404, "User not found");
  }
  res.status(200).json(user);
});

/**
 * Získá informace o konkrétním uživateli podle ID (např. pro zobrazení profilu kolegy).
 * @function userInfo
 */
export const userInfo = asyncHandler(async (req, res, next) => {
  const user = await getUserById(req.params.id);
  if (!user) {
    throw createError(404, "User not found");
  }
  res.status(200).json(user);
});

/**
 * Načte seznam dostupných uživatelských rolí v systému.
 * @function userRolesList
 */
export const userRolesList = asyncHandler(async (req, res, next) => {
  const userRoles = await getUserRoles();
  if (userRoles.length === 0) {
    throw createError(404, "User roles not found");
  }
  res.status(200).json(userRoles);
});

/**
 * Načte všechny zaměstnance příslušející k firmě aktuálního uživatele.
 * @function getAllUsersInCompany
 */
export const getAllUsersInCompany = asyncHandler(async (req, res, next) => {
  const users = await getAllUsersByCompany(req.user.company_id);
  if (users.length === 0) {
    throw createError(404, "Users not found");
  }
  res.status(200).json(users);
});

/**
 * Logicky odstraní uživatele z firmy (deaktivace účtu).
 * Obsahuje bezpečnostní kontroly na vlastnictví firmy a aktivní vazby řidičů.
 * @function deleteUserFromCompany
 * @param {import('express').Request} req - Params obsahuje ID cílového uživatele.
 * @throws {HttpError} 400 - Pokud se uživatel snaží smazat sám sebe nebo smazat aktivního řidiče.
 * @throws {HttpError} 403 - Pokud uživatel nemá oprávnění k akci v rámci dané firmy.
 */
export const deleteUserFromCompany = asyncHandler(async (req, res, next) => {
  const targetUserId = Number(req.params.id);
  const adminId = Number(req.user.id);
  const adminCompanyId = Number(req.user.company_id);

  if (targetUserId === adminId) {
    throw createError(400, "You cannot remove yourself from the company.");
  }

  const userToDelete = await getUserById(targetUserId);

  if (!userToDelete) {
    throw createError(404, "User not found");
  }

  if (userToDelete.company_id !== adminCompanyId) {
    throw createError(400, "You do not have permission to delete this user.");
  }

  if (userToDelete.role_id === USER_ROLES.DRIVER) {
    const isLinkedToComposition = await isDriverLinkedToComposition(
      userToDelete.id,
    );

    if (isLinkedToComposition) {
      throw createError(
        400,
        "You cannot delete a driver who is assigned to a composition",
      );
    }
  }
  await updateUserIsActiveByUserId(userToDelete.id);

  // Отдаем успешный ответ
  res.status(200).json({
    message: "Uživatel byl úspěšně odstraněn z firmy.",
    error: false,
  });
});

// export const changeEmail = asyncHandler(async (req, res, next) => {
//     const { email } = req.body;
//     if (!email) {
//         throw createError(400, "Email is required");
//     }
//     await updateUserEmailById(req.user.id, email, req.user.email);
//     sendVerificationEmail()
//     res.status(200).json({
//         message: "Email changed succesfully",
//         error: false
//     });
// });

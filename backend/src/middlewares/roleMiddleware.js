/**
 * ====================================================
 * Middleware: Role Authorization (RBAC)
 * Czech: Kontrola oprávnění uživatele na základě rolí.
 * ====================================================
 */

import createError from "http-errors";

/**
 * Middleware pro omezení přístupu ke konkrétním trasám podle role uživatele.
 * Umožňuje flexibilní kontrolu jedné nebo více rolí současně.
 * @param {number|number[]} roles - Jedno ID role nebo pole povolených ID rolí (např. [1, 3]).
 * @returns {Function} Express middleware funkce.
 * @throws {HttpError} 401 - Pokud uživatel není autentizován (chybí req.user).
 * @throws {HttpError} 403 - Pokud role uživatele není v seznamu povolených rolí.
 */
export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw createError(401, "Unauthorized");
    }

    if (typeof roles == "number") {
      roles = [roles];
    }

    if (!roles.includes(req.user.role_id)) {
      throw createError(403, "Access denied");
    }

    next();
  };
};

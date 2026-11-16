/**
 * ====================================================
 * Middleware: Request Validation (Zod)
 * Czech: Validace vstupních dat požadavku pomocí knihovny Zod.
 * ====================================================
 */

import createError from "http-errors";

/**
 * Middleware pro validaci dat v req.body proti Zod schématu.
 * * @param {Object} schema - Zod schéma definující pravidla.
 * @returns {Function} Express middleware.
 * @throws {HttpError} 400 - Při selhání validace vrací první nalezenou chybu.
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log(req.body);
    try {
      schema.parse({
        body: req?.body,
      });

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join(".").replace("body.", ""),
          message: issue.message,
        }));

        throw createError(
          400,
          formattedErrors[0].message || "Validation failed",
        );
      } else {
        console.log({ error });
        throw createError(400, error?.message || "Validation failed");
      }
    }
  };
};

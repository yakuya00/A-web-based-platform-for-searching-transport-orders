/**
 * ====================================================
 * Middleware: Global Error Handler
 * Czech: Centrální zpracování chyb aplikace.
 * ====================================================
 */

/**
 * Globální middleware pro zachycení a formátování všech chyb v aplikaci.
 * Zajišťuje, že klient vždy obdrží konzistentní JSON odpověď místo pádu serveru.
 * @param {Object} err - Objekt chyby (může obsahovat status kód a zprávu).
 * @param {import('express').Request} req - Express request objekt.
 * @param {import('express').Response} res - Express response objekt.
 * @param {import('express').NextFunction} next - Express next funkce.
 * @returns {void} Odesílá HTTP odpověď s detaily o chybě.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler: ", err);

  const statusCode = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    error: true,
    message,
  });
};

export default errorHandler;

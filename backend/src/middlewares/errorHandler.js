const AppError = require("../utils/AppError");

exports.errorHandler = (err, req, res, next) => {
    console.error("Global Error Handler: ", err);

    const statusCode = err instanceof AppError ? err?.statusCode : 500;
    const message = err instanceof AppError ? err?.message : "Something went wrong";

    res.status(statusCode).json({
        error: true,
        message
    });
};
const errorHandler = (err, req, res, next) => {
    console.error("Global Error Handler: ", err);

    const statusCode = err.status || 500;
    const message = err.message || "Something went wrong";

    res.status(statusCode).json({
        error: true,
        message
    });
};

export default errorHandler;
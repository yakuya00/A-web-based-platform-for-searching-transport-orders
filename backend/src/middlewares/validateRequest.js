const AppError = require("../utils/AppError");

exports.validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req?.body,
            });

            next()
        } catch (error) {
            console.log({ error });
            throw new AppError(error?.message || "Validation failed", 400)
        }
    };
};
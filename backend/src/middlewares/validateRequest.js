import createError from "http-errors";

export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req?.body,
            });

            next()
        } catch (error) {
            console.log({ error });
            throw createError(error?.message || "Validation failed", 400)
        }
    };
};
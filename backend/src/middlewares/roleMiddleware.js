import createError from "http-errors";

export const checkRole = (roles = []) => {
    return (req, res, next) => {
        if(!req.user) {
            throw createError(401, "Unauthorized");
        }

        if(typeof roles == "number") {
            roles = [roles];
        }

        if(!roles.includes(req.user.role_id)){
            throw createError(403, "Access denied")
        }

        next();
    };
};
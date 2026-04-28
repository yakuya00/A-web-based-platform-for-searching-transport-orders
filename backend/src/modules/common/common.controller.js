import asyncHandler from "express-async-handler";
import createError from "http-errors";

import { runTransaction } from "../../utils/dbUtils.js";

import { selectCountries } from "./common.repository.js";

export const getCountries = asyncHandler(async(req, res, next) => {
    const countries = await selectCountries();
    if (countries.length === 0) {
        throw createError(404, "Countries is not found");
    }
    res.status(200).json(countries);
})
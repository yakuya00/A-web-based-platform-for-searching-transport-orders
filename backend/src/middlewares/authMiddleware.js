const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

exports.checkAuthentication = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;
})
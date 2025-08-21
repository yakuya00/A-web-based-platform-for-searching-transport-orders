const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan")


const app = express();

const authRouter = require("./modules/auth/auth.routes");
const usersRouter = require("./modules/users/user.routes");

const errorHandler = require("./middlewares/errorHandler");

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/auth", authRouter);
app.use("/users", usersRouter);


app.use(errorHandler);

module.exports = app;
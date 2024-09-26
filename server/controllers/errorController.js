const ErrorHandler = require("../utils/ErrorHandler");

const errorProd = (err, res) => {
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  res.status(500).json({
    status: "Something went very wrong!",
    message: err
  });
};

const errorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err,
  });
};

const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new ErrorHandler(`${errors[0]}`, 400);
};
const duplicateErrors = () => {
  return new ErrorHandler("This email is taken !", 400);
};

const handleJWTExpiredError = () =>
  new ErrorHandler("Your token has expired! Please log in again.", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "ValidationError") {
      error = validationError(err);
    }
    if (err.code === 11000) error = duplicateErrors();
    if (err.name === "JsonWebTokenError") error = handleJWTExpiredError();

    errorProd(error, res);
  } else if (process.env.NODE_ENV === "development") errorDev(err, res);
};

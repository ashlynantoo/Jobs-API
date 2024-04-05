const { StatusCodes } = require("http-status-codes");

const errorHandler = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: error.message || "Something went wrong. Try again later.",
  };

  if (error.name === "ValidationError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = Object.values(error.errors)
      .map((item) => {
        return item.message;
      })
      .join(", ");
  }

  if (error.code && error.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `The value entered for ${Object.keys(
      error.keyValue
    )} already exists. Please enter another value.`;
  }

  if (error.name === "CastError") {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.msg = `No job with Id ${error.value}`;
  }

  return res
    .status(customError.statusCode)
    .json({ error: { msg: customError.msg } });
};

module.exports = errorHandler;

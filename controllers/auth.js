const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all the details");
  }

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    token: user.createJWT(),
    user: { name: user.name, email: user.email },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email ID and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  res.status(StatusCodes.OK).json({
    token: user.createJWT(),
    user: { name: user.name, email: user.email },
  });
};

module.exports = { register, login };

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the name"],
    minlength: [3, "Name should be at least 3 characters"],
    maxlength: [50, "Name should not exceed 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide the email ID"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email ID",
    ],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide the password"],
    minlength: [6, "Password should be at least 6 characters"],
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.comparePassword = async function (userPassword) {
  const isMatching = await bcrypt.compare(userPassword, this.password);
  return isMatching;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

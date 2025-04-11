import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import generateToken from "../utils/jwt.js";

const register = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Request body is missing🥲");
  }
  const { name, username, password } = req?.body;

  if (!name?.trim() || !username?.trim() || !password?.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide all fields");
  }

  if (password.length < 6) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password must contain 6 letters"
    );
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  const hassedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: name.trim(),
    username: username.trim(),
    password: hassedPassword,
  });

  // 🔐 Generate JWT token
  let token = generateToken(newUser._id);

  console.log("token🚀: ", token);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // use true in prod
    sameSite: "Strict", // or "Lax" as per your need
    maxAge: 60 * 60 * 1000, // 1 Hour
  });

  res.status(httpStatus.CREATED).json({
    message: "User Registered",
    user: {
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
    },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Request body is missing🥲");
  }
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide username and password"
    );
  }

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  // console.log("IsPasswordCorrect: ", isMatch);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // use true in prod
    sameSite: "Strict", // or "Lax" as per your need
    maxAge: 60 * 60 * 1000, // 1 Hour
  });

  res.status(httpStatus.OK).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
    },
    token,
  });
});

export { register, login };

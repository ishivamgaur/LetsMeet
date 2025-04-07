import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
  const { name, username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res
      .status(httpStatus.CONFLICT)
      .json({ message: "User already exists" });
  }

  const hassedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name, 
    username,
    password: hassedPassword, 
  });

  await newUser.save();

  res.status(httpStatus.CREATED).json({
    message: "User Registered",
  });
});

export { register };

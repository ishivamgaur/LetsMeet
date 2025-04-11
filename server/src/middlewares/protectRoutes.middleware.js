import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

export const protectRoute = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  console.log("token🚀: ", token);

  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  if (!token) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Not authorized, token missing"
    );
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED: ", decode);
    const user = await User.findById(decode.id).select("-password");
    console.log("DECODED USER: ", user);

    if (!user) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User not found, token invalid!"
      );
    }
    // adding the user in the req
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Token expired. Please login again."
      );
    }

    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Token");
  }
});

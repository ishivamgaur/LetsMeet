import { Router } from "express";
import {
  addToHistory,
  getUserHistory,
  login,
  register,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoutes.middleware.js";
import httpStatus from "http-status";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_history").post(addToHistory);
router.route("/get_all_history/:user_id").get(getUserHistory);

// test route for checking the user is authanticated or not
router.route("/auth-check").get(protectRoute, (req, res) => {
  res.status(httpStatus.OK).json({ authenticated: true, user: req.user });
});

router.route("/logout").get((req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
});

// Api check route
router.route("/check").get((req, res) => {
  res.json({ message: "Api Working" });
});

export default router;

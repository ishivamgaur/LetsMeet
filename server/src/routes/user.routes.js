import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoutes.middleware.js";
import httpStatus from "http-status";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity");
router.route("/get_all_activity");

// test route for checking the user is authanticated or not
router.route("/test").get(protectRoute, (req, res) => {
  res.status(httpStatus.OK).json({
    allActivity: [
      { activity: "hello" },
      { activity: "hello1" },
      { activity: "hello2" },
    ],
  });
});

// Api check route
router.route("/check").get((req, res) => {
  res.json({ message: "Api Working" });
});

export default router;

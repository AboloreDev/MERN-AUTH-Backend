import express from "express";
import {
  register,
  login,
  logout,
  verifyOtp,
  verifyEmail,
  isAuthenticated,
  sendPasswordOtp,
  resetUserPassword,
} from "../Controllers/auth.controller.js";
import userAuth from "../Middleware/AuthMiddleware.js";
const router = express.Router();

// Register routes
router.post("/register", register);

// Login routes
router.post("/login", login);

// Logout routes
router.post("/logout", logout);
// send verification otp
router.post("/verify-otp", userAuth, verifyOtp);
// VERIFY ACCOUNT USING OTP
router.post("/verify-email", userAuth, verifyEmail);
// check if its authenticated
router.get("/is-authenticated", userAuth, isAuthenticated);
// password reset password
router.post("/reset-password", sendPasswordOtp);
// update password
router.post("/update-password", resetUserPassword);

export default router;

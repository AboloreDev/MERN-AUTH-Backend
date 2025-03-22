import express from "express";
import userAuth from "../Middleware/AuthMiddleware.js";
import { getUserData } from "../Controllers/user.controller.js";
const userRouter = express.Router();

// endpoint
userRouter.get("/get-user", userAuth, getUserData);

export default userRouter;

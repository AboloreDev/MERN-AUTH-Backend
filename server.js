import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDb from "./Database/db.js";
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
// configure dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = process.env.BASE_URL;

// Connect to MongoDB
connectDb();
// middleware
app.use(express.json());
// Parse cookies
app.use(cookieParser());
// cors
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Auth Routes
app.use("/api/auth", authRoutes);
// user router
app.use("/api/user", userRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Server
app.listen(port, () => console.log(`Server has started on PORT: ${port}`));

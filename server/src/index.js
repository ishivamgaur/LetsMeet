import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDb from "./config/db.js";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import cookieParser from "cookie-parser";

dotenv.config();

// express app + HTTP server
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "30kb", extended: true }));
app.use("/api/v1/users", userRoutes);

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;
ConnectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`LISTENIN AT PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error occured: ", error.message);
  });

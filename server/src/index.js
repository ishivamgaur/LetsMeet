import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDb from "./config/db.js";
import { initializeSocket } from "./socket/index.js";
import userRoutes from "./routes/user.routes.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import cookieParser from "cookie-parser";

dotenv.config();

// express app + HTTP server
const app = express();
const server = createServer(app);
const io = initializeSocket(server);

const corsOptions = {
  origin: [
    "https://shivam-lets-meet.netlify.app",
    "http://localhost:5173",
    "http://localhost:8000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "30kb", extended: true }));
app.use("/api/v1/users", userRoutes);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running perfectly!" });
});

// Real-time online count — no socket needed
app.get("/api/online-count", (req, res) => {
  res.json({
    count: io.engine.clientsCount,
    chatting: io._rooms ? io._rooms.getActiveRoomCount() * 2 : 0,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;

// Start server — DB connection is optional so matchmaking works without it
const startServer = async () => {
  try {
    await ConnectDb();
    console.log("📦 Database connected");
  } catch (error) {
    console.warn("⚠️  DB connection failed:", error.message);
    console.warn("⚠️  Server running without database — auth features disabled");
  }

  server.listen(PORT, () => {
    console.log(`🚀 LISTENING AT PORT ${PORT}`);
  });
};

startServer();

import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDb from "./config/db.js";
import { connectToSocket } from "./controllers/socketManager.js";

dotenv.config();

// express app + HTTP server
const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.use(cors());
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "30kb", extended: true }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 8000;
ConnectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`LISTENIN AT PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error occured: ", error);
  });

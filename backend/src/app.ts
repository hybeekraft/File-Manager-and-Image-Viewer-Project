import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth";
import filesRouter from "./routes/files";
import statsRouter from "./routes/stats";
import { config } from "./config";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "file-manager-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/files", filesRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);

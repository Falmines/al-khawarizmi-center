import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import { ApiError } from "./errors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { pool } from "./config/database.js";

const app = express();
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const indexFile = path.join(publicDirectory, "index.html");

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, "Origin not allowed."));
    },
    methods: ["GET", "HEAD", "OPTIONS"],
    maxAge: 600
  })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/programs", programRoutes);
app.use(express.static(publicDirectory, { index: false }));
app.get("/", (_request, response, next) => {
  response.sendFile(indexFile, (error) => {
    if (error) next(error);
  });
  app.get("/admin", (_request, response, next) => {
    response.sendFile(path.join(publicDirectory, "admin.html"), (error) => {
      if (error) next(error);
    });
  });
  app.get("/api/health", async (_request, response, next) => {
    try {
      if (!pool) {
        response.status(503).json({
          status: "unavailable",
          database: "not_configured"
        });
        return;
      }
      await pool.query("SELECT 1");
      response.json({ status: "ok", database: "connected" });
    } catch (error) {
      next(error);
    }
  });
});
app.use(notFound);
app.use(errorHandler);

export default app;

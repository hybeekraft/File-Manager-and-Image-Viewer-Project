import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-in-production";

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret-change-in-production")) {
  throw new Error("JWT_SECRET must be set to a strong secret in production.");
}

export const config = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  maxFileSize: Number(process.env.MAX_FILE_SIZE_MB || 20) * 1024 * 1024,
  jwtSecret,
};

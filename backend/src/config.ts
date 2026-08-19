import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  maxFileSize: Number(process.env.MAX_FILE_SIZE_MB || 20) * 1024 * 1024,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
};

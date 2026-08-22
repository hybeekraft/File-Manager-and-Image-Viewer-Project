import { NextFunction, Request, Response } from "express";

export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File is too large." });
  }

  if (error?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(415).json({ message: "Unsupported file type." });
  }

  return res.status(error?.status || 500).json({
    message: error?.message || "Internal server error",
  });
}

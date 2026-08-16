import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { prisma } from "../prisma";
import { config } from "../config";

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
});

const allowedPrefixes = ["image/", "application/pdf", "text/", "application/zip"];

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const type = String(req.query.type || "all");

    const files = await prisma.file.findMany({
      where: {
        AND: [
          search
            ? { originalName: { contains: search, mode: "insensitive" } }
            : {},
          type === "image" ? { mimeType: { startsWith: "image/" } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(files);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: "File not found." });
    res.json(file);
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    if (!allowedPrefixes.some((prefix) => req.file!.mimetype.startsWith(prefix))) {
      fs.unlinkSync(req.file.path);
      return res.status(415).json({ message: "Unsupported file type." });
    }

    const file = await prisma.file.create({
      data: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });

    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/download", async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file || !fs.existsSync(file.path)) {
      return res.status(404).json({ message: "File not found." });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: "File not found." });

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await prisma.file.delete({ where: { id: file.id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

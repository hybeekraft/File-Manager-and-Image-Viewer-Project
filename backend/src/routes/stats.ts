import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [totalFiles, imageFiles, aggregate] = await Promise.all([
      prisma.file.count(),
      prisma.file.count({ where: { mimeType: { startsWith: "image/" } } }),
      prisma.file.aggregate({ _sum: { size: true } }),
    ]);

    res.json({
      totalFiles,
      imageFiles,
      totalBytes: aggregate._sum.size || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

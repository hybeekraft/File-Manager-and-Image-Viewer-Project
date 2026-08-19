import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const [totalFiles, imageFiles, aggregate] = await Promise.all([
      prisma.file.count({ where: { userId: req.userId } }),
      prisma.file.count({ where: { userId: req.userId, mimeType: { startsWith: "image/" } } }),
      prisma.file.aggregate({ where: { userId: req.userId }, _sum: { size: true } }),
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

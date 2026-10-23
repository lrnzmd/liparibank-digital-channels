import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @openapi
 * /api/reports/balance-by-customer:
 *   get:
 *     summary: Report saldo totale per customer (solo ADMIN/OPERATOR)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista con ownerId, totalBalance, accountCount
 *       401:
 *         description: Non autenticato
 *       403:
 *         description: Non autorizzato (solo ADMIN/OPERATOR)
 */
router.get(
  "/balance-by-customer",
  authenticate,
  authorize("ADMIN", "OPERATOR"),
  asyncHandler(async (req: any, res: any) => {
    // Aggregazione con groupBy
    const report = await prisma.account.groupBy({
      by: ["customerId"],
      _sum: {
        balance: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    // Formato risposta
    const formattedReport = report.map((item: any) => ({
      customerId: item.customerId,
      totalBalance: item._sum.balance || 0,
      accountCount: item._count._all,
    }));

    res.json({
      data: formattedReport,
      meta: {
        total: formattedReport.length,
        generatedAt: new Date().toISOString(),
      },
    });
  })
);

export default router;

import { PrismaClient } from "@prisma/client";

/**
 * Middleware Prisma per soft delete
 * Inietta automaticamente where: { deletedAt: null } su Account e Customer
 */
export const setupSoftDeleteMiddleware = (prisma: PrismaClient) => {
  prisma.$use(async (params, next) => {
    const { model, action, args } = params;

    // Applica il filtro soft delete solo su Account e Customer
    if ((model === "Account" || model === "Customer") && ["findUnique", "findMany", "findFirst", "count"].includes(action)) {
      if (!args.where) {
        args.where = {};
      }
      args.where.deletedAt = null;
    }

    return next(params);
  });
};

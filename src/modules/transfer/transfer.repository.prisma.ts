import { PrismaClient, Transfer as PrismaTransfer } from "@prisma/client";
import { Transfer } from "./transfer.types";
import { TransferRepository } from "./transfer.repository";
import { UUID } from "../../types/common";

/**
 * Implementazione Prisma del repository Transfer.
 */
export class PrismaTransferRepository implements TransferRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<Transfer | null> {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id },
    });
    return transfer ? this.mapToTransfer(transfer) : null;
  }

  async findAll(): Promise<Transfer[]> {
    const transfers = await this.prisma.transfer.findMany();
    return transfers.map(t => this.mapToTransfer(t));
  }

  async save(transfer: Transfer): Promise<Transfer> {
    const existing = await this.prisma.transfer.findUnique({
      where: { id: transfer.id },
    });

    if (existing) {
      const updated = await this.prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: transfer.status,
          executedAt: transfer.executedAt,
        },
      });
      return this.mapToTransfer(updated);
    } else {
      const created = await this.prisma.transfer.create({
        data: {
          id: transfer.id,
          fromAccountId: transfer.fromAccountId,
          toAccountId: transfer.toAccountId,
          amount: transfer.amount,
          description: transfer.description,
          status: transfer.status,
          createdAt: transfer.createdAt,
          executedAt: transfer.executedAt,
        },
      });
      return this.mapToTransfer(created);
    }
  }

  async findByAccountId(accountId: UUID): Promise<Transfer[]> {
    const transfers = await this.prisma.transfer.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
      },
    });
    return transfers.map(t => this.mapToTransfer(t));
  }

  private mapToTransfer(prismaTransfer: PrismaTransfer): Transfer {
    return {
      id: prismaTransfer.id,
      fromAccountId: prismaTransfer.fromAccountId,
      toAccountId: prismaTransfer.toAccountId,
      amount: prismaTransfer.amount.toNumber(),
      description: prismaTransfer.description,
      status: prismaTransfer.status as "PENDING" | "COMPLETED" | "FAILED",
      createdAt: prismaTransfer.createdAt,
      executedAt: prismaTransfer.executedAt || undefined,
    };
  }
}

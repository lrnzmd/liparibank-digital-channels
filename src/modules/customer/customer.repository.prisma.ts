import { PrismaClient, Customer as PrismaCustomer } from "@prisma/client";
import { Customer, CustomerStatus } from "./customer.types";
import { CustomerRepository } from "./customer.repository";
import { UUID } from "../../types/common";

/**
 * Implementazione Prisma del repository Customer.
 * Sostituisce InMemoryCustomerRepository nel composition root.
 * L'interfaccia CustomerRepository rimane invariata.
 */
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cerca un customer per ID.
   */
  async findById(id: UUID): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    return customer ? this.mapToCustomer(customer) : null;
  }

  /**
   * Recupera tutti i customer.
   */
  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany();
    return customers.map(c => this.mapToCustomer(c));
  }

  /**
   * Salva o aggiorna un customer.
   */
  async save(customer: Customer): Promise<Customer> {
    const existing = await this.prisma.customer.findUnique({
      where: { id: customer.id },
    });

    if (existing) {
      // Update
      const updated = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          fiscalCode: customer.fiscalCode,
          status: customer.status,
        },
      });
      return this.mapToCustomer(updated);
    } else {
      // Create
      const created = await this.prisma.customer.create({
        data: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          fiscalCode: customer.fiscalCode,
          status: customer.status,
          createdAt: customer.createdAt,
        },
      });
      return this.mapToCustomer(created);
    }
  }

  /**
   * Elimina un customer per ID.
   */
  async delete(id: UUID): Promise<boolean> {
    try {
      await this.prisma.customer.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cerca un customer per email (utile per validazioni).
   */
  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });
    return customer ? this.mapToCustomer(customer) : null;
  }

  /**
   * Cerca un customer per codice fiscale.
   */
  async findByFiscalCode(fiscalCode: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { fiscalCode },
    });
    return customer ? this.mapToCustomer(customer) : null;
  }

  /**
   * Mappa un Customer Prisma al tipo di dominio.
   */
  private mapToCustomer(prismaCustomer: PrismaCustomer): Customer {
    return {
      id: prismaCustomer.id,
      firstName: prismaCustomer.firstName,
      lastName: prismaCustomer.lastName,
      email: prismaCustomer.email,
      phone: prismaCustomer.phone || "",
      fiscalCode: prismaCustomer.fiscalCode,
      status: prismaCustomer.status as CustomerStatus,
      createdAt: prismaCustomer.createdAt,
      updatedAt: prismaCustomer.updatedAt,
    };
  }
}

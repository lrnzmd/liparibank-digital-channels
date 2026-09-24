import { randomUUID } from "crypto";
import { UUID } from "../../types/common";
import { CustomerRepository } from "./customer.repository";
import { Customer, CustomerStatus } from "./customer.types";

/**
 * DTO per l'aggiornamento di un Customer.
 * Tutti i campi sono opzionali (Partial).
 * Non incluso: id, createdAt (immutabili).
 */
export interface UpdateCustomerDto {
  fiscalCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
}

/**
 * Service di dominio per Customer.
 * Responsabilità:
 * - Logica di business (validazione, trasformazione)
 * - Coordinamento tra repository e logica
 * - Nessuna logica HTTP (eccezioni generiche)
 *
 * Usa DI: il repository è iniettato nel constructor.
 */
export class CustomerService {
  constructor(private readonly repo: CustomerRepository) {}

  /**
   * Crea un nuovo customer.
   */
  async create(data: {
    fiscalCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: CustomerStatus;
  }): Promise<Customer> {
    const customer: Customer = {
      id: randomUUID(),
      fiscalCode: data.fiscalCode,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      status: data.status,
      createdAt: new Date(),
    };
    return this.repo.save(customer);
  }

  /**
   * Recupera tutti i customer.
   */
  async getAll(): Promise<Customer[]> {
    return this.repo.findAll();
  }

  /**
   * Recupera un customer per ID.
   * @throws Error se il customer non esiste
   */
  async getById(id: UUID): Promise<Customer> {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }
    return customer;
  }

  /**
   * Aggiorna un customer.
   * - Carica il customer esistente
   * - Effettua un merge parziale con il DTO
   * - Salva le modifiche
   */
  async update(id: UUID, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.getById(id);
    const updated: Customer = {
      ...customer,
      ...dto,
    };
    return this.repo.save(updated);
  }

  /**
   * Elimina un customer.
   */
  async delete(id: UUID): Promise<boolean> {
    return this.repo.delete(id);
  }
}

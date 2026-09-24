import { UUID } from "../../types/common";
import { Customer } from "./customer.types";

/**
 * Interfaccia del repository per Customer.
 * Astrae l'accesso ai dati.
 */
export interface CustomerRepository {
  findById(id: UUID): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  delete(id: UUID): Promise<boolean>;
}

/**
 * Implementazione in-memory del repository Customer.
 * Usa una Map<string, Customer> per storage.
 */
export class InMemoryCustomerRepository implements CustomerRepository {
  private store: Map<string, Customer> = new Map();

  /**
   * Cerca un customer per ID.
   */
  async findById(id: UUID): Promise<Customer | null> {
    const customer = this.store.get(id);
    return customer || null;
  }

  /**
   * Recupera tutti i customer.
   */
  async findAll(): Promise<Customer[]> {
    return Array.from(this.store.values());
  }

  /**
   * Salva o aggiorna un customer.
   */
  async save(customer: Customer): Promise<Customer> {
    this.store.set(customer.id, customer);
    return customer;
  }

  /**
   * Elimina un customer per ID.
   */
  async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  /**
   * Pulisce il store (utile per i test).
   */
  clear(): void {
    this.store.clear();
  }
}

export type CustomerStatus = "ACTIVE" | "INACTIVE";

/**
 * Entità Customer.
 * Rappresenta un cliente della banca.
 */
export interface Customer {
  id: string;
  fiscalCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  createdAt: Date;
}

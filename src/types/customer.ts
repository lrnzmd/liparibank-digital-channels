// Dominio Customer — intestatario dei conti LipariBank
import { BaseEntity } from "./common";

/**
 * Literal type union per lo stato del Customer.
 * Usato al posto di enum perché ha solo 3 valori semplici.
 */
export type CustomerStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface Customer extends BaseEntity {
  fiscalCode: string;       // Codice fiscale italiano (16 caratteri)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;           // Opzionale — il ? indica che può essere undefined
  status: CustomerStatus;
}

export interface CreateCustomerDto {
  fiscalCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
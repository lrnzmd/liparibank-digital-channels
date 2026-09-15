// src/broken/bug2.ts
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const clienti: Customer[] = [
  { id: "1", firstName: "Mario", lastName: "Rossi", email: "mario@example.com", phone: "+39 333 1234567" },
  { id: "2", firstName: "Laura", lastName: "Bianchi", email: "laura@example.com" },
];

function stampaContatti(customers: Customer[]): void {
  for (const c of customers) {
    console.log(`${c.firstName} ${c.lastName} — Tel: ${c.phone ? c.phone.replace("+39 ", "0") : "N/A"}`);
    // ✅ Risolto: controlliamo se phone è definito prima di chiamare .replace()
  }
}

stampaContatti(clienti);
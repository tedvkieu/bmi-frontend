export interface CustomerRequest {
  name: string;
  address: string;
  email: string;
  dob: string; // ISO string format
  phone: string;
  note?: string;
  customerType: "IMPORTER" | "SERVICE_MANAGER"; // tuỳ enum bạn định nghĩa
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType: string;
}

export async function createCustomer(
  customer: CustomerRequest
): Promise<CustomerResponse> {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (!res.ok) {
    throw new Error("Failed to create customer");
  }

  return res.json();
}

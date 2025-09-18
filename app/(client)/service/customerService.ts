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
  const res = await fetch("/api/customers/public", {
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

export interface PublicContactRequest {
  name: string;
  email: string;
  phone: string;
  note?: string;
  customerType: "IMPORTER" | "SERVICE_MANAGER";
}

export interface PublicContactResponse {
  success: boolean;
  note?: string;
  id?: string;
}

export async function sendPublicContact(
  customerPublicContact: PublicContactRequest
  ): Promise<PublicContactResponse> {
  try {
    const res = await fetch("/api/customers/public", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerPublicContact),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || "Failed to send contact");
    }

    return res.json();
  } catch (error) {
    console.error("Error sending public contact:", error);
    throw new Error("Failed to send contact");
  }
}

import { getStrapiURL } from "@/utils/get-strapi-url";
const BASE_URL = getStrapiURL();


// ------------------------------------------------------------
export interface OrderFormProps {
    fullName: string;
    telephone: string;
    address: string;
    content: any; // The new JSON-based rich text editor
}

export async function orderForm(data: OrderFormProps) {
  const url = new URL("/api/orders", BASE_URL);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const json = await response.json();
    if (!response.ok) {
      return {
        error: {
          status: response.status,
          message: (json && (json.error?.message || json.message)) || "Request failed",
        },
      } as const;
    }
    return json;
  } catch (error) {
    console.error("Order Service Error:", error);
    return {
      error: {
        status: 0,
        message: "Network error",
      },
    } as const;
  }
}
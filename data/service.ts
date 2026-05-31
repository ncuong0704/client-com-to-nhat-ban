import { getStrapiURL } from "@/utils/get-strapi-url";
const BASE_URL = getStrapiURL();


// ------------------------------------------------------------
export interface OrderFormProps {
    fullName: string;
    telephone: string;
    address: string;
    email?: string;
    deliveryMethod?: string;
    branchName?: string;
    content: any;
    paymentMethod?: string;
}

export async function orderForm(data: OrderFormProps) {
  const url = new URL("/api/orders", BASE_URL);
  const payload = {
    fullName: data.fullName,
    telephone: data.telephone,
    address: data.address,
    content: data.content,
    payment_method: data.paymentMethod ?? "cod",
    email: data.email || undefined,
    delivery_method: data.deliveryMethod ?? "delivery",
    branch_name: data.branchName || undefined,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
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
import { getStrapiURL } from "@/utils/get-strapi-url";
import { NextResponse } from "next/server";

export async function GET() {
  const strapiUrl = getStrapiURL();
  const res = await fetch(`${strapiUrl}/api/strapi-5-sitemap-plugin/sitemap.xml`);
  if (!res.ok) {
    return new NextResponse("Error fetching sitemap", { status: 500 });
  }
  const xml = await res.text();
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}

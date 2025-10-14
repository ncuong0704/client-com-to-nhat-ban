export function getStrapiURL(): string {
    // Fallback to production Strapi URL if env is not set
    return (
        process.env.STRAPI_API_URL ||
        "https://railwayapp-strapi-production-8ee5.up.railway.app"
    )
}
import type { NextConfig } from "next";

const STRAPI_URL =
  process.env.STRAPI_API_URL

let protocol = 'https:'
let hostname = ''
try {
  const parsed = new URL(STRAPI_URL || '')
  protocol = parsed.protocol
  hostname = parsed.hostname
} catch (err) {
  console.warn('Invalid STRAPI_API_URL, falling back to production URL')
}

// Normalize protocol to RemotePattern literal type
const proto: 'http' | 'https' = protocol === 'http:' ? 'http' : 'https'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Bật tối ưu ảnh của Next.js và whitelist domain ảnh từ Strapi
    remotePatterns: [
      {
        protocol: proto,
        hostname,
        pathname: '/**',
      },
      // Cho phép ảnh từ Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Cho phép thumbnail từ YouTube nếu dùng trực tiếp
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;

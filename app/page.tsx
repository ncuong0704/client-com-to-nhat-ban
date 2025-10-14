// app/page.tsx - Có thể thêm metadata
import { redirect } from 'next/navigation';
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Công ty Luật Dedica',
  description: 'Công ty luật chuyên nghiệp tại Việt Nam',
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  redirect('/vi');
}
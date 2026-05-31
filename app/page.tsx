import { redirect } from 'next/navigation';
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Cơm Tô Nhật Bản | Donburi ngon mỗi ngày',
  description: 'Nhà hàng cơm tô Nhật Bản (Donburi) – món ngon mỗi ngày, giao hàng tận nơi.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function HomePage() {
  redirect('/vi');
}
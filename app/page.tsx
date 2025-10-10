import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MenuSection } from "@/components/menu-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <MenuSection />
      </main>
      <Footer />
    </div>
  )
}

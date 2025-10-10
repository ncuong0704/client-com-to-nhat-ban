"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Potta_One } from "next/font/google"

const pottaOne = Potta_One({
  weight: "400",
  subsets: ["latin"],
})

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
  }
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-8 h-8 rounded-lg mr-3 object-cover"
            />
            <h1 className={`${pottaOne.className} text-2xl md:text-3xl font-bold text-primary`}>
              Cơm Tô Nhật Bản
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              className="cursor-pointer text-foreground hover:text-primary transition-colors font-medium"
              onClick={scrollToMenu}
            >
              Menu
            </button>
            <button
              type="button"
              className="cursor-pointer text-foreground hover:text-primary transition-colors font-medium"
              onClick={scrollToContact}
            >
              Liên hệ
            </button>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 cursor-pointer"
              onClick={scrollToMenu}
            >
              Đặt món ngay
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium py-2 text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToMenu();
                }}
              >
                Menu
              </button>
              <button
                type="button"
                className="cursor-pointer text-foreground hover:text-primary transition-colors font-medium py-2 text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToContact();
                }}
              >
                Liên hệ
              </button>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full"
                onClick={scrollToMenu}
              >
                Đặt hàng ngay
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

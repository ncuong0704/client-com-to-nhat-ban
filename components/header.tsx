"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Potta_One } from "next/font/google"
import { HeaderProps } from "@/types"
import { StrapiImage } from "./StrapiImage"

const pottaOne = Potta_One({
  weight: "400",
  subsets: ["latin"],
})

export function Header({ header }: { header: HeaderProps }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState<"vi" | "en">("vi")
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  // Lấy locale hiện tại từ pathname
  useEffect(() => {
    const currentLocale = pathname.split('/')[1] as "vi" | "en"
    if (currentLocale === "vi" || currentLocale === "en") {
      setSelectedLang(currentLocale)
    }
  }, [pathname])

  const scrollTo = (scrollTo: string) => {
    document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" })
  }

  const handleLocaleChange = (newLocale: "vi" | "en") => {
    setSelectedLang(newLocale)
    setShowLangDropdown(false)
    
    // Lấy path hiện tại và thay thế locale
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <StrapiImage
              src={header.logo.image.url}
              width={56}
              height={56}
              alt={header.logo.image.alternativeText || header.logo.name || "Header logo"}
              className="w-14 h-14 rounded-lg mr-3 object-cover"
            />
            <div>
              <h1 className={`${pottaOne.className} text-2xl md:text-3xl font-bold text-primary`}>
                {header.logo.name}
              </h1>
              <div className={`${pottaOne.className} text-xs md:text-sm text-primary mt-0.5 text-left`}>
                {header.logo.subName}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {header.menu.map((item) => (
              <button key={item.name} type="button" className="cursor-pointer text-foreground hover:text-primary transition-colors font-medium" onClick={() => scrollTo(item.scrollTo)}>
                {item.name}
              </button>
            ))}

            {/* <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1 hover:bg-muted transition-colors text-sm"
                onClick={() => setShowLangDropdown((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={showLangDropdown ? "true" : "false"}
              >
                <img
                  src={selectedLang === "vi" ? "/ln_vn.png" : "/ln_en.webp"}
                  alt={selectedLang === "vi" ? "Tiếng Việt" : "English"}
                  className="w-6 h-4"
                />
                <span>{selectedLang === "vi" ? "Tiếng Việt" : "English"}</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLangDropdown && (
                <ul
                  className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-md shadow-lg z-20"
                  role="listbox"
                >
                  <li
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted transition-colors rounded-t-md ${selectedLang === "vi" ? "bg-muted/90" : ""}`}
                    onClick={() => handleLocaleChange("vi")}
                    role="option"
                    aria-selected={selectedLang === "vi"}
                  >
                    <img src="/ln_vn.png" alt="Tiếng Việt" className="w-6 h-4" />
                    <span>Tiếng Việt</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted transition-colors rounded-b-md ${selectedLang === "en" ? "bg-muted/90" : ""}`}
                    onClick={() => handleLocaleChange("en")}
                    role="option"
                    aria-selected={selectedLang === "en"}
                  >
                    <img src="/ln_en.webp" alt="English" className="w-6 h-4" />
                    <span>English</span>
                  </li>
                </ul>
              )}
            </div> */}
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 cursor-pointer"
              onClick={() => scrollTo(header.cta.scrollTo)}
            >
              {header.cta.name}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {header.menu.map((item) => (
                <button key={item.name} type="button" className="cursor-pointer text-foreground hover:text-primary transition-colors font-medium py-2 text-left" onClick={() => {
                  setMobileMenuOpen(false);
                  scrollTo(item.scrollTo);
                }}>
                  {item.name}
                </button>
              ))}
              {/* Language Selector (Mobile) */}
              {/* <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm"
                  onClick={() => setShowLangDropdown((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={showLangDropdown ? "true" : "false"}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={selectedLang === "vi" ? "/ln_vn.png" : "/ln_en.webp"}
                      alt={selectedLang === "vi" ? "Tiếng Việt" : "English"}
                      className="w-6 h-4"
                    />
                    {selectedLang === "vi" ? "Tiếng Việt" : "English"}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLangDropdown && (
                  <ul
                    className="absolute left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-20"
                    role="listbox"
                  >
                    <li
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted transition-colors rounded-t-md ${selectedLang === "vi" ? "bg-muted/90" : ""}`}
                      onClick={() => handleLocaleChange("vi")}
                      role="option"
                      aria-selected={selectedLang === "vi"}
                    >
                      <img src="/ln_vn.png" alt="Tiếng Việt" className="w-6 h-4" />
                      <span>Tiếng Việt</span>
                    </li>
                    <li
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted transition-colors rounded-b-md ${selectedLang === "en" ? "bg-muted/90" : ""}`}
                      onClick={() => handleLocaleChange("en")}
                      role="option"
                      aria-selected={selectedLang === "en"}
                    >
                      <img src="/ln_en.webp" alt="English" className="w-6 h-4" />
                      <span>English</span>
                    </li>
                  </ul>
                )}
              </div> */}
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full"
                onClick={() => scrollTo(header.cta.scrollTo)}
              >
                {header.cta.name}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

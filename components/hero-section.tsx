"use client"

import { Button } from "@/components/ui/button"
import { HeroProps } from "@/types"
import { ArrowRight } from "lucide-react"
import { StrapiImage } from "./StrapiImage"

export function HeroSection({ hero }: { hero: HeroProps }) {
  const scrollTo = (scrollTo: string) => {
    document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <StrapiImage
          src={hero.background.url}
          alt={hero.background.alternativeText || hero.title || "Hero background"}
          width={1920}
          height={1080}
          type="hero"
          className="w-full h-full object-cover animate-hero-zoom-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="animate-fade-up [animation-delay:100ms] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance leading-tight">
          {hero.title}
        </h2>
        <p className="animate-fade-up [animation-delay:250ms] text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
          {hero.description}
        </p>
        <Button
          size="lg"
          onClick={() => scrollTo(hero.cta.scrollTo)}
          className="animate-fade-up [animation-delay:500ms] cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg group"
        >
          {hero.cta.name}
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}

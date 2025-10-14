"use client"

import * as LucideIcons from "lucide-react"
import type { ComponentProps } from "react"

interface LucideIconProps extends Omit<ComponentProps<'svg'>, 'ref'> {
  name?: string
  className?: string
}

function toPascalCase(input?: string): string {
  if (!input) return ""
  const cleaned = input.trim()
  const pascal = cleaned
    .replace(/^[^a-zA-Z]+/, "")
    .replace(/[-_\s]+(.)/g, (_, c) => (c ? String(c).toUpperCase() : ""))
    .replace(/^(.)/, (c) => String(c).toUpperCase())
  return pascal
}

export function LucideIcon({ name = "Circle", className, ...rest }: LucideIconProps) {
  const pascal = toPascalCase(name)
  const Icon = (LucideIcons as any)[pascal] || (LucideIcons as any)["Circle"]
  if (!Icon) return null
  return <Icon className={className} {...rest} />
}

export default LucideIcon



// SEO utility functions
export function getBaseUrl(): string {
  // In production, use environment variable or default domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  }
  // In development, use localhost
  return 'http://localhost:3000'
}

export function getHreflangUrls(locale: string) {
  const baseUrl = getBaseUrl()
  return {
    'vi': `${baseUrl}/vi`,
    'en': `${baseUrl}/en`,
    'x-default': `${baseUrl}/vi`
  }
}

export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}

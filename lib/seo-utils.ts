export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      console.warn('[SEO] NEXT_PUBLIC_SITE_URL chưa được cấu hình. Canonical URL và hreflang sẽ không chính xác.')
    }
    return siteUrl || ''
  }
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

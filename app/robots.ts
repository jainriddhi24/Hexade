import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/how-it-works',
          '/lawyers',
          '/blog',
          '/faq',
          '/privacy',
          '/terms',
          '/accessibility',
          '/contact',
        ],
        disallow: [
          '/dashboard',
          '/api',
          '/admin',
          '/hearing',
          '/auth',
          '/_next',
          '/private',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/features',
          '/how-it-works',
          '/lawyers',
          '/blog',
          '/faq',
          '/privacy',
          '/terms',
          '/accessibility',
          '/contact',
        ],
        disallow: [
          '/dashboard',
          '/api',
          '/admin',
          '/hearing',
          '/auth',
          '/_next',
          '/private',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

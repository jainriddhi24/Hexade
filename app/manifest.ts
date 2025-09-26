import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hexade - Case Management Portal',
    short_name: 'Hexade',
    description: 'Modern case management and hearing platform for legal professionals',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    categories: ['business', 'productivity', 'legal'],
    lang: 'en',
    dir: 'ltr',
    scope: '/',
    prefer_related_applications: false
  }
}

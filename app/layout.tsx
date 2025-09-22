import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/use-auth'
import { CookieConsent } from '@/components/cookie-consent'
import { ClientOnly } from '@/components/client-only'
import { CookieAwareAnalytics } from '@/components/cookie-aware-analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Hexade - Case Management Portal',
    template: '%s | Hexade'
  },
  description: 'Modern case management and hearing platform for legal professionals. Streamline your practice with WebRTC hearings, document management, and AI-powered tools.',
  keywords: ['legal', 'case management', 'hearings', 'lawyer', 'court', 'WebRTC', 'document management'],
  authors: [{ name: 'Hexade Team' }],
  creator: 'Hexade',
  publisher: 'Hexade',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Hexade - Case Management Portal',
    description: 'Modern case management and hearing platform for legal professionals.',
    siteName: 'Hexade',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hexade - Case Management Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hexade - Case Management Portal',
    description: 'Modern case management and hearing platform for legal professionals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GA_ID,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <CookieConsent />
            <ClientOnly>
              <CookieAwareAnalytics />
            </ClientOnly>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

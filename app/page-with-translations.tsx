"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Video, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Brain, 
  Globe, 
  Shield, 
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Scale,
  Gavel
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-hexade-blue to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              {t('homepage.hero.badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {t('homepage.hero.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
              {t('homepage.hero.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/register">
                <Button size="lg" variant="accent" className="text-lg px-8 py-3">
                  {t('homepage.hero.bookHearing')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-hexade-blue">
                  {t('homepage.hero.seeDemo')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('homepage.features.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('homepage.features.subtitle')}
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Video className="h-6 w-6 text-hexade-blue" />
                </div>
                <CardTitle>{t('homepage.features.webrtc.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.webrtc.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>{t('homepage.features.chat.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.chat.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t('homepage.features.scheduling.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.scheduling.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>{t('homepage.features.documents.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.documents.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>{t('homepage.features.ai.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.ai.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>{t('homepage.features.multilingual.title')}</CardTitle>
                <CardDescription>
                  {t('homepage.features.multilingual.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-hexade-blue">500+</div>
              <div className="mt-2 text-sm text-gray-600">{t('homepage.stats.activeLawyers')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-hexade-blue">2,500+</div>
              <div className="mt-2 text-sm text-gray-600">{t('homepage.stats.casesManaged')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-hexade-blue">10,000+</div>
              <div className="mt-2 text-sm text-gray-600">{t('homepage.stats.hearingsConducted')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-hexade-blue">99.9%</div>
              <div className="mt-2 text-sm text-gray-600">{t('homepage.stats.uptime')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('homepage.howItWorks.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('homepage.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hexade-blue text-white text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('homepage.howItWorks.step1.title')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('homepage.howItWorks.step1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hexade-blue text-white text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('homepage.howItWorks.step2.title')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('homepage.howItWorks.step2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hexade-blue text-white text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('homepage.howItWorks.step3.title')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('homepage.howItWorks.step3.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hexade-blue text-white text-xl font-bold mx-auto">
                4
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('homepage.howItWorks.step4.title')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('homepage.howItWorks.step4.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('homepage.testimonials.title')}
            </h2>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('homepage.testimonials.judge.quote')}"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{t('homepage.testimonials.judge.name')}</div>
                    <div className="text-sm text-gray-500">{t('homepage.testimonials.judge.role')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('homepage.testimonials.lawyer.quote')}"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Gavel className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{t('homepage.testimonials.lawyer.name')}</div>
                    <div className="text-sm text-gray-500">{t('homepage.testimonials.lawyer.role')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('homepage.testimonials.client.quote')}"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{t('homepage.testimonials.client.name')}</div>
                    <div className="text-sm text-gray-500">{t('homepage.testimonials.client.role')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hexade-blue">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('homepage.cta.title')}
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            {t('homepage.cta.subtitle')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/register">
              <Button size="lg" variant="accent" className="text-lg px-8 py-3">
                {t('homepage.cta.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-hexade-blue">
                {t('homepage.cta.contactSales')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

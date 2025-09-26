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
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Scale,
  Gavel
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Modern Legal Technology
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Streamline Your Legal Practice
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
              Hexade provides a comprehensive case management platform with WebRTC hearings, 
              document management, and AI-powered tools for modern legal professionals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">
                  Book a Hearing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  See Demo
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
              Everything You Need for Modern Legal Practice
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools designed for lawyers, judges, and clients
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>WebRTC Hearings</CardTitle>
                <CardDescription>
                  High-quality video hearings with adaptive bitrate and low-latency connections
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Secure messaging during hearings with message persistence and moderation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Automated scheduling with calendar integration and conflict resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Secure document storage, e-signing, and version control
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>AI Summarization</CardTitle>
                <CardDescription>
                  Automated case summaries and document analysis using AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Multilingual Support</CardTitle>
                <CardDescription>
                  Support for multiple languages with real-time translation
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
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="mt-2 text-sm text-gray-600">Active Lawyers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">2,500+</div>
              <div className="mt-2 text-sm text-gray-600">Cases Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">10,000+</div>
              <div className="mt-2 text-sm text-gray-600">Hearings Conducted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">99.9%</div>
              <div className="mt-2 text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


import React from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Gavel,
  Zap,
  Lock,
  Smartphone
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      icon: Video,
      title: 'WebRTC Video Hearings',
      description: 'High-quality video conferencing with adaptive bitrate and low-latency connections for seamless legal proceedings.',
      benefits: [
        'HD video quality with automatic quality adjustment',
        'Low-latency real-time communication',
        'Screen sharing and document collaboration',
        'Recording capabilities for case archives'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Secure messaging during hearings with message persistence, moderation, and file sharing capabilities.',
      benefits: [
        'Encrypted chat messages',
        'Message history and search',
        'File sharing in chat',
        'Moderation tools for judges'
      ]
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated scheduling with calendar integration, conflict resolution, and automated reminders.',
      benefits: [
        'Calendar integration with Google/Outlook',
        'Automatic conflict detection',
        'Email and SMS reminders',
        'Rescheduling with notifications'
      ]
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Secure document storage, version control, e-signing, and collaborative editing for case files.',
      benefits: [
        'Secure cloud storage with encryption',
        'Version control and audit trails',
        'E-signature integration',
        'Document templates and automation'
      ]
    },
    {
      icon: Brain,
      title: 'AI Summarization',
      description: 'Automated case summaries, document analysis, and legal research assistance using advanced AI.',
      benefits: [
        'Automatic case summaries',
        'Document content analysis',
        'Legal precedent research',
        'Time-saving insights'
      ]
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Support for multiple languages with real-time translation and localized interfaces.',
      benefits: [
        'English and Hindi support',
        'Real-time translation',
        'Localized user interfaces',
        'Cultural adaptation'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with compliance for legal industry standards and data protection.',
      benefits: [
        'End-to-end encryption',
        'GDPR and data protection compliance',
        'Audit logs and monitoring',
        'Role-based access control'
      ]
    },
    {
      icon: Users,
      title: 'Lawyer Directory',
      description: 'Comprehensive directory of verified lawyers with search, filtering, and rating systems.',
      benefits: [
        'Verified lawyer profiles',
        'Advanced search and filtering',
        'Client reviews and ratings',
        'Practice area specialization'
      ]
    }
  ]

  const stats = [
    { label: 'Active Users', value: '2,500+', icon: Users },
    { label: 'Cases Managed', value: '10,000+', icon: FileText },
    { label: 'Hearings Conducted', value: '25,000+', icon: Video },
    { label: 'Documents Processed', value: '100,000+', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-hexade-blue to-blue-600 text-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Comprehensive Legal Technology
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Powerful Features for Modern Legal Practice
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100 max-w-3xl mx-auto">
              Hexade provides a complete suite of tools designed specifically for legal professionals. 
              From video hearings to AI-powered document analysis, we've got everything you need.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-hexade-blue text-white">
                    {React.createElement(stat.icon, { className: "h-6 w-6" })}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need in One Platform
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools designed to streamline your legal practice
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      {React.createElement(feature.icon, { className: "h-6 w-6 text-hexade-blue" })}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Performance & Security
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Enterprise-grade infrastructure with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sub-100ms API response times</li>
                  <li>• 99.9% uptime guarantee</li>
                  <li>• Global CDN distribution</li>
                  <li>• Auto-scaling infrastructure</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• End-to-end encryption</li>
                  <li>• SOC 2 Type II compliant</li>
                  <li>• GDPR & HIPAA ready</li>
                  <li>• Regular security audits</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Cross-Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Web, mobile, and desktop</li>
                  <li>• Progressive Web App</li>
                  <li>• Offline capabilities</li>
                  <li>• Native mobile apps</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hexade-blue">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Experience the Future of Legal Practice?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of legal professionals who trust Hexade for their case management needs
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/register">
              <Button size="lg" variant="accent" className="text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-hexade-blue">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import React from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PageHero } from '@/components/page-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  UserPlus, 
  FileText, 
  Video, 
  CheckCircle, 
  ArrowRight,
  Users,
  Calendar,
  MessageCircle,
  Brain,
  Shield,
  Zap
} from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Sign Up & Create Profile',
      description: 'Register as a lawyer, client, or judge and complete your profile setup.',
      icon: UserPlus,
      features: ['Quick registration', 'Role-based setup', 'Profile verification']
    },
    {
      number: 2,
      title: 'Create or Join Cases',
      description: 'Start new cases or get assigned to existing ones with full case management.',
      icon: FileText,
      features: ['Case creation', 'Document upload', 'Team assignment']
    },
    {
      number: 3,
      title: 'Schedule Hearings',
      description: 'Book video hearings with all parties and manage your court calendar.',
      icon: Video,
      features: ['Video conferencing', 'Calendar integration', 'Automatic reminders']
    },
    {
      number: 4,
      title: 'AI-Powered Analysis',
      description: 'Get instant AI summaries of cases, documents, and legal research.',
      icon: Brain,
      features: ['Document analysis', 'Case summaries', 'Legal research']
    },
    {
      number: 5,
      title: 'Collaborate & Communicate',
      description: 'Work together with secure messaging and document sharing.',
      icon: MessageCircle,
      features: ['Secure messaging', 'File sharing', 'Real-time updates']
    },
    {
      number: 6,
      title: 'Track Progress',
      description: 'Monitor case progress with analytics and reporting tools.',
      icon: CheckCircle,
      features: ['Progress tracking', 'Analytics dashboard', 'Custom reports']
    }
  ]

  const features = [
    {
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with SOC 2 compliance and end-to-end encryption.',
      icon: Shield
    },
    {
      title: 'Fast & Reliable',
      description: 'High-performance platform with 99.9% uptime and global CDN.',
      icon: Zap
    },
    {
      title: 'Easy to Use',
      description: 'Intuitive interface designed for legal professionals of all tech levels.',
      icon: Users
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Simple Process
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              How Hexade Works
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Get started with Hexade in minutes. Our platform makes legal case management 
              simple, secure, and efficient for everyone involved.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get Started in 6 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From registration to case resolution, we guide you through every step
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-hexade-blue text-white rounded-full text-2xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center mb-4">
                          <step.icon className="h-8 w-8 text-hexade-blue mr-3" />
                          <CardTitle className="text-2xl">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="text-lg">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-8 top-16 w-0.5 h-12 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Hexade?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Built specifically for legal professionals with modern technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-hexade-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-hexade-blue" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of legal professionals who trust Hexade for their case management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
"use client"

import React from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Bell, 
  Calculator, 
  FileText,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 New Features Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the latest billing system with 50% advance payments and live notifications
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Case Billing */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Calculator className="h-6 w-6 mr-2" />
                Case Billing System
              </CardTitle>
              <CardDescription className="text-green-700">
                Integrated billing with 50% advance payment requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  50% Advance Payment Required
                </div>
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Multiple Payment Methods (UPI, Card, Net Banking)
                </div>
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Real-time Payment Processing
                </div>
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Indian Rupees (₹) Pricing
                </div>
              </div>
              <Link href="/dashboard/cases">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Try Case Billing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Live Notifications */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Bell className="h-6 w-6 mr-2" />
                Live Notifications
              </CardTitle>
              <CardDescription className="text-blue-700">
                Real-time updates and alerts for all activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment Confirmations
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Case Status Updates
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Document Upload Alerts
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  AI Analysis Complete
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  View Notifications
                  <Bell className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Gateway */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <CreditCard className="h-6 w-6 mr-2" />
                Payment Gateway
              </CardTitle>
              <CardDescription className="text-purple-700">
                Secure payment processing with multiple options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Credit/Debit Cards
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  UPI Payments (PhonePe, GPay, Paytm)
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Net Banking
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  SSL Secured & PCI Compliant
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Test Payments
                  <CreditCard className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Examples */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-600" />
              Role-Based Pricing Examples
            </CardTitle>
            <CardDescription>
              See how different user roles have different pricing structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Judge Pricing */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">👨‍⚖️ Judge</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Court System License:</span>
                    <span className="font-medium">₹24,999/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Legal Analysis:</span>
                    <span className="font-medium">₹19,999 one-time</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hourly Consultation:</span>
                    <span className="font-medium">₹5,000/hour</span>
                  </div>
                </div>
              </div>

              {/* Lawyer Pricing */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">⚖️ Lawyer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Professional Plan:</span>
                    <span className="font-medium">₹9,999/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Analysis Package:</span>
                    <span className="font-medium">₹9,999 one-time</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hourly Support:</span>
                    <span className="font-medium">₹2,000/hour</span>
                  </div>
                </div>
              </div>

              {/* Client Pricing */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">👤 Client</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Legal Consultation:</span>
                    <span className="font-medium">₹15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hourly Services:</span>
                    <span className="font-medium">₹1,000/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Analysis:</span>
                    <span className="font-medium">₹4,999 one-time</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How the New Billing System Works</CardTitle>
            <CardDescription>
              Step-by-step process for case billing with advance payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Case</h3>
                <p className="text-sm text-gray-600">Set case details and estimated value</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Calculate Billing</h3>
                <p className="text-sm text-gray-600">System calculates 50% advance payment</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Make Payment</h3>
                <p className="text-sm text-gray-600">Choose UPI, Card, or Net Banking</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-yellow-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">Get Notified</h3>
                <p className="text-sm text-gray-600">Receive live notifications and confirmations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button size="lg" className="bg-hexade-blue hover:bg-blue-800">
              Start Using New Features
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

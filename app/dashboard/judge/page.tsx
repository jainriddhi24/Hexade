"use client"

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  Video, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  Sparkles,
  Mail,
  Send,
  CreditCard,
  DollarSign,
  Receipt,
  Gavel,
  Scale,
  BookOpen
} from 'lucide-react'
import { PaymentHistory } from '@/components/payment-history'
import { usePayments } from '@/hooks/use-payments'
import { BillingCalculator } from '@/components/billing-calculator'

export default function JudgeDashboardPage() {
  const { user } = useAuth()
  const [emailSent, setEmailSent] = React.useState(false)
  const { payments, getPaymentsForRole, getTotalEarnings, getMonthlyEarnings } = usePayments()
  const [paymentProcessing, setPaymentProcessing] = React.useState(false)
  const [paymentSuccess, setPaymentSuccess] = React.useState(false)

  if (!user || user.role !== 'JUDGE') return null

  const sendEmailNotification = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: 'Hexade Portal - Court Update',
          message: `Hello Judge ${user.name},\n\nYour court schedule has been updated. Please check your dashboard for details.\n\nBest regards,\nHexade Team`
        })
      })
      
      if (response.ok) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 3000)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const processPayment = async (amount: number, description: string, paymentType: string, duration?: number, billingCycle?: string) => {
    setPaymentProcessing(true)
    try {
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          userId: user.id,
          userRole: user.role,
          paymentType,
          duration,
          billingCycle
        })
      })
      
      if (response.ok) {
        setPaymentSuccess(true)
        setTimeout(() => setPaymentSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setPaymentProcessing(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const stats = [
    { label: 'Scheduled Hearings', value: '12', icon: Video, color: 'text-blue-600' },
    { label: 'Cases in Progress', value: '25', icon: FileText, color: 'text-green-600' },
    { label: 'Today\'s Hearings', value: '3', icon: Calendar, color: 'text-purple-600' },
    { label: 'AI Summaries', value: '31', icon: Brain, color: 'text-orange-600' },
  ]

  const recentActivity = [
    { type: 'hearing', title: 'Smith vs. Johnson - Contract Dispute', time: '2 hours ago', status: 'completed' },
    { type: 'decision', title: 'Motion for Summary Judgment', time: '1 day ago', status: 'pending' },
    { type: 'hearing', title: 'Brown vs. Davis - Employment', time: '2 days ago', status: 'completed' },
  ]

  const todaysHearings = [
    {
      id: '1',
      case: 'Smith vs. Johnson',
      time: '10:00 AM',
      type: 'Contract Dispute',
      status: 'scheduled',
      participants: ['John Smith', 'Jane Johnson', 'Attorney A', 'Attorney B']
    },
    {
      id: '2', 
      case: 'Brown vs. Davis',
      time: '2:00 PM',
      type: 'Employment Law',
      status: 'scheduled',
      participants: ['Mike Brown', 'Sarah Davis', 'Attorney C', 'Attorney D']
    },
    {
      id: '3',
      case: 'Wilson vs. Miller',
      time: '4:00 PM', 
      type: 'Personal Injury',
      status: 'scheduled',
      participants: ['Tom Wilson', 'Lisa Miller', 'Attorney E', 'Attorney F']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, Judge {user.name}
          </h1>
          <p className="text-gray-600">
            Welcome to your judicial dashboard. Here's your court schedule and case overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Court Activity</CardTitle>
                <CardDescription>Your latest hearings and decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {activity.type === 'hearing' ? (
                            <Video className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common judicial tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/hearings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="mr-2 h-4 w-4" />
                      View Today's Hearings
                    </Button>
                  </Link>
                  <Link href="/dashboard/cases" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Review Cases
                    </Button>
                  </Link>
                  <Link href="/dashboard/decisions" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Gavel className="mr-2 h-4 w-4" />
                      Pending Decisions
                    </Button>
                  </Link>
                  <Link href="/dashboard/ai-summaries" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Brain className="mr-2 h-4 w-4" />
                      AI Summaries
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Hearings */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Today's Hearings</CardTitle>
              <CardDescription>Your scheduled hearings for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysHearings.map((hearing) => (
                  <div key={hearing.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{hearing.case}</h4>
                        <p className="text-sm text-gray-600">{hearing.type}</p>
                        <p className="text-sm text-gray-500">Participants: {hearing.participants.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{hearing.time}</p>
                        <Badge variant="secondary">{hearing.status}</Badge>
                        <div className="mt-2">
                          <Link href={`/hearing/${hearing.id}`}>
                            <Button size="sm" variant="hexade">
                              Join Hearing
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summarization Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-600" />
                AI Case Summarization
              </CardTitle>
              <CardDescription>
                Get instant AI-powered summaries of cases and legal documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-medium">Case Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">AI analyzed 5 cases</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="font-medium">Legal Precedents</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Generated 3 precedent summaries</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <h4 className="font-medium">Hearing Notes</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Summarized 8 hearings</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Brain className="mr-2 h-4 w-4" />
                  Generate New AI Summary
                </Button>
                <Button 
                  onClick={sendEmailNotification}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  {emailSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Email Sent!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Court Update
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Court System Information */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="mr-2 h-5 w-5 text-blue-600" />
                    Court System Access
                  </CardTitle>
                  <CardDescription>
                    Your judicial privileges and system access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg bg-blue-50">
                      <div>
                        <p className="font-medium">Court System License</p>
                        <p className="text-sm text-gray-600">Full access to judicial tools and case management</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border rounded-lg bg-green-50">
                      <div>
                        <p className="font-medium">AI Legal Analysis</p>
                        <p className="text-sm text-gray-600">Advanced legal document analysis and case insights</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border rounded-lg bg-purple-50">
                      <div>
                        <p className="font-medium">Case Management</p>
                        <p className="text-sm text-gray-600">Complete case oversight and hearing management</p>
                      </div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">Enabled</Badge>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Tracking */}
        <div className="mt-8">
          <PaymentHistory
            payments={getPaymentsForRole(user.id, 'JUDGE')}
            userRole={user.role}
          />
        </div>
      </div>
    </div>
  )
}

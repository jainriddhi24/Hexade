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
  Receipt
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [emailSent, setEmailSent] = React.useState(false)
  const [paymentProcessing, setPaymentProcessing] = React.useState(false)
  const [paymentSuccess, setPaymentSuccess] = React.useState(false)

  if (!user) return null

  // Redirect to role-specific dashboards
  React.useEffect(() => {
    if (user.role === 'JUDGE') {
      window.location.href = '/dashboard/judge'
    } else if (user.role === 'LAWYER') {
      window.location.href = '/dashboard/lawyer'
    } else if (user.role === 'CLIENT') {
      window.location.href = '/dashboard/client'
    }
  }, [user.role])

  const sendEmailNotification = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: 'Hexade Portal - Case Update',
          message: `Hello ${user.name},\n\nYour case has been updated. Please check your dashboard for details.\n\nBest regards,\nHexade Team`
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

  const processPayment = async (amount: number, description: string) => {
    setPaymentProcessing(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          userId: user.id
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

  const getRoleSpecificStats = () => {
    switch (user.role) {
      case 'CLIENT':
        return [
          { label: 'Active Cases', value: '3', icon: FileText, color: 'text-blue-600' },
          { label: 'Upcoming Hearings', value: '2', icon: Video, color: 'text-green-600' },
          { label: 'Messages', value: '5', icon: Users, color: 'text-purple-600' },
          { label: 'AI Summaries', value: '15', icon: Brain, color: 'text-orange-600' },
        ]
      case 'LAWYER':
        return [
          { label: 'Active Cases', value: '8', icon: FileText, color: 'text-blue-600' },
          { label: 'Clients', value: '15', icon: Users, color: 'text-green-600' },
          { label: 'Hearings This Week', value: '4', icon: Video, color: 'text-purple-600' },
          { label: 'AI Summaries', value: '23', icon: Brain, color: 'text-orange-600' },
        ]
      case 'JUDGE':
        return [
          { label: 'Scheduled Hearings', value: '12', icon: Video, color: 'text-blue-600' },
          { label: 'Cases in Progress', value: '25', icon: FileText, color: 'text-green-600' },
          { label: 'Today\'s Hearings', value: '3', icon: Calendar, color: 'text-purple-600' },
          { label: 'AI Summaries', value: '31', icon: Brain, color: 'text-orange-600' },
        ]
      default:
        return []
    }
  }

  const getRecentActivity = () => {
    switch (user.role) {
      case 'CLIENT':
        return [
          { type: 'hearing', title: 'Contract Dispute Hearing', time: '2 hours ago', status: 'completed' },
          { type: 'document', title: 'Service Agreement signed', time: '1 day ago', status: 'completed' },
          { type: 'message', title: 'New message from lawyer', time: '2 days ago', status: 'pending' },
        ]
      case 'LAWYER':
        return [
          { type: 'hearing', title: 'Employment Law Consultation', time: '1 hour ago', status: 'completed' },
          { type: 'case', title: 'New case assigned', time: '3 hours ago', status: 'pending' },
          { type: 'document', title: 'Contract review completed', time: '1 day ago', status: 'completed' },
        ]
      case 'JUDGE':
        return [
          { type: 'hearing', title: 'Civil Case Hearing', time: '30 minutes ago', status: 'completed' },
          { type: 'case', title: 'New case filed', time: '2 hours ago', status: 'pending' },
          { type: 'hearing', title: 'Criminal Case Hearing', time: '1 day ago', status: 'completed' },
        ]
      default:
        return []
    }
  }

  const stats = getRoleSpecificStats()
  const recentActivity = getRecentActivity()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Welcome to your {user.role.toLowerCase()} dashboard. Here's what's happening with your cases.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {React.createElement(stat.icon, { className: `h-8 w-8 ${stat.color}` })}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest case updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/activity">
                <Button variant="outline" size="sm" className="w-full">
                  View all activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.role === 'CLIENT' && (
                <>
                  <Link href="/lawyers" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Find a Lawyer
                    </Button>
                  </Link>
                  <Link href="/dashboard/cases" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      View My Cases
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'LAWYER' && (
                <>
                  <Link href="/dashboard/cases" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Cases
                    </Button>
                  </Link>
                  <Link href="/dashboard/calendar" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Hearing
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'JUDGE' && (
                <>
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
                </>
              )}
              
                  <Link href="/dashboard/messages" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      View Messages
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

      {/* Upcoming Hearings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>
            Your scheduled hearings for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Contract Dispute Resolution</h4>
                <p className="text-sm text-gray-500">Case #CASE-2024-001</p>
                <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Scheduled</Badge>
                <Link href="/hearing/room-123">
                  <Button size="sm" variant="hexade">
                    Join Hearing
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Employment Law Consultation</h4>
                <p className="text-sm text-gray-500">Case #CASE-2024-002</p>
                <p className="text-sm text-gray-500">Friday at 2:00 PM</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Scheduled</Badge>
                <Link href="/hearing/room-124">
                  <Button size="sm" variant="hexade">
                    Join Hearing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summarization Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-600" />
              AI Case Summarization
            </CardTitle>
            <CardDescription>
              Get instant AI-powered summaries of your cases and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                  <h4 className="font-medium">Contract Analysis</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">AI analyzed 3 contracts</p>
                <Button size="sm" variant="outline" className="w-full">
                  View Summary
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-green-600 mr-2" />
                  <h4 className="font-medium">Case Brief</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Generated 2 case briefs</p>
                <Button size="sm" variant="outline" className="w-full">
                  View Summary
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center mb-2">
                  <Brain className="h-4 w-4 text-purple-600 mr-2" />
                  <h4 className="font-medium">Hearing Notes</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Summarized 5 hearings</p>
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
                    Send Email Update
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-green-600" />
              Payment & Billing
            </CardTitle>
            <CardDescription>
              Manage your subscription and make payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <h4 className="font-medium">Monthly Subscription</h4>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">$99.99</p>
                <p className="text-sm text-gray-600 mb-3">Per month</p>
                <Button 
                  onClick={() => processPayment(99.99, 'Monthly Subscription')}
                  disabled={paymentProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {paymentProcessing ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <Brain className="h-4 w-4 text-purple-600 mr-2" />
                  <h4 className="font-medium">AI Analysis Package</h4>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-2">$199.99</p>
                <p className="text-sm text-gray-600 mb-3">One-time payment</p>
                <Button 
                  onClick={() => processPayment(199.99, 'AI Analysis Package')}
                  disabled={paymentProcessing}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  {paymentProcessing ? 'Processing...' : 'Buy Package'}
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <Receipt className="h-4 w-4 text-blue-600 mr-2" />
                  <h4 className="font-medium">Payment History</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">View your transactions</p>
                <Button 
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  View History
                </Button>
              </div>
            </div>
            
            {paymentSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">Payment Successful!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ...existing code...
  // All JSX is already inside the main return block below (starting at line 240+)
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
  User,
  Phone,
  MessageCircle,
  Calculator,
  Percent,
  Clock as ClockIcon
} from 'lucide-react'
import { BillingCalculator } from '@/components/billing-calculator'
import { PaymentHistory } from '@/components/payment-history'
import { usePayments } from '@/hooks/use-payments'

interface Case {
  id: string
  title: string
  lawyer: string
  lawyerId: string
  clientId: string
  status: string
  lastUpdate: string
  nextHearing: string
  fee: number
}

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const [emailSent, setEmailSent] = React.useState(false)
  const [paymentProcessing, setPaymentProcessing] = React.useState(false)
  const [paymentSuccess, setPaymentSuccess] = React.useState(false)
  const { payments, addPayment, getPaymentsForRole, getTotalEarnings, getMonthlyEarnings } = usePayments()
  
  // Initialize case state
  const [cases, setCases] = React.useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>('')
  const [selectedCaseFee, setSelectedCaseFee] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch cases from API
  const fetchCases = React.useCallback(async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const data = await response.json()
        const formattedCases = data.cases.map((c: any) => ({
          id: c.id,
          title: c.title,
          lawyer: c.assignedLawyer?.name || 'Unassigned',
          lawyerId: c.assignedLawyer?.id || '',
          clientId: c.clientId,
          status: c.status,
          lastUpdate: new Date(c.updatedAt).toLocaleDateString(),
          nextHearing: c.hearings?.[0]?.scheduledAt || '',
          fee: c.estimatedValue || 0
        }))
        setCases(formattedCases)
        
        // Set initial selection if there are cases
        if (formattedCases.length > 0) {
          setSelectedCaseId(formattedCases[0].id)
          setSelectedCaseFee(formattedCases[0].fee)
        }
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchCases()
  }, [fetchCases])

  if (!user || user.role !== 'CLIENT') return null

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

  // ...existing code...

  const processPayment = async (amount: number, description: string, paymentType: string, duration?: number) => {
    setPaymentProcessing(true)
    try {
      // Find the selected case by ID
      const selectedCase = cases.find(c => c.id === selectedCaseId)
      if (!selectedCase) {
        throw new Error('No case selected')
      }

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
          billingCycle: 'one-time',
          caseId: selectedCase.id,
          lawyer: selectedCase.lawyer,
          lawyerId: selectedCase.lawyerId
        })
      })

      if (response.ok) {
        // Add payment to local state
        addPayment({
          amount,
          description,
          paymentType,
          duration,
          billingCycle: 'one-time',
          clientId: user.id,
          clientName: user.name,
          clientEmail: user.email,
          lawyerId: selectedCase.lawyerId,
          lawyerName: selectedCase.lawyer,
          caseId: selectedCase.id,
          caseTitle: selectedCase.title,
          caseFee: selectedCase.fee,
          status: 'completed'
        })

        // Send email notification to lawyer
  if (selectedCase && selectedCase.lawyerId && selectedCase.lawyer) {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedCase.lawyer, // TODO: Replace with lawyer's email if available
              subject: 'Hexade Portal - Payment Received',
              message: `Hello ${selectedCase.lawyer},\n\nYou have received a payment of ₹${amount} from ${user.name} for case: ${selectedCase.title}.\n\nBest regards,\nHexade Team`
            })
          })
        }

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

  const clientPayments = payments.filter(p => p.clientId === user.id)
  const totalSpent = getTotalEarnings(user.id, 'CLIENT')
  const monthlySpent = getMonthlyEarnings(user.id, 'CLIENT')

  // Filter cases for logged-in client
  const filteredCases = cases.filter(c => c.clientId === user.id)

  // Calculate real stats based on cases and payments
  const totalCaseValue = cases.reduce((sum, c) => sum + c.fee, 0)
  const upcomingHearings = cases.filter(c => c.nextHearing && new Date(c.nextHearing) > new Date()).length
  const totalPayments = clientPayments.reduce((sum, p) => sum + p.amount, 0)
  
  const stats = [
    { label: 'Active Cases', value: cases.length.toString(), icon: FileText, color: 'text-blue-600' },
    { label: 'Upcoming Hearings', value: upcomingHearings.toString(), icon: Video, color: 'text-green-600' },
    { label: 'Total Case Value', value: `₹${totalCaseValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Payments Made', value: `₹${totalPayments.toLocaleString()}`, icon: Calendar, color: 'text-purple-600' },
  ]

  const recentActivity = [
    { type: 'hearing', title: 'Contract Dispute Hearing', time: '2 hours ago', status: 'completed' },
    { type: 'document', title: 'Service Agreement signed', time: '1 day ago', status: 'completed' },
    { type: 'message', title: 'New message from your lawyer', time: '2 days ago', status: 'pending' },
  ]

  interface Case {
    id: string
    title: string
    lawyer: string
    lawyerId: string
    clientId: string
    status: string
    lastUpdate: string
    nextHearing: string
    fee: number
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user.name}
          </h1>
          <p className="text-gray-600">
            Welcome to your client portal. Here's your case overview and legal updates.
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
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest case updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {activity.type === 'hearing' ? (
                            <Video className="h-5 w-5 text-blue-600" />
                          ) : activity.type === 'document' ? (
                            <FileText className="h-5 w-5 text-green-600" />
                          ) : (
                            <MessageCircle className="h-5 w-5 text-purple-600" />
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
                <CardDescription>Common client tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/cases" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      View My Cases
                    </Button>
                  </Link>
                  <Link href="/dashboard/messages" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                  <Link href="/dashboard/hearings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="mr-2 h-4 w-4" />
                      Upcoming Hearings
                    </Button>
                  </Link>
                  <Link href="/dashboard/documents" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      My Documents
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

        {/* My Cases */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>My Cases</CardTitle>
              <CardDescription>Your active legal cases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map((caseItem: Case) => (
                  <div key={caseItem.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">{caseItem.title}</h4>
                    <p className="text-sm text-gray-600">Lawyer: {caseItem.lawyer}</p>
                    <p className="text-sm text-gray-500">Last update: {caseItem.lastUpdate}</p>
                    <Badge variant="secondary">{caseItem.status}</Badge>
                    <p className="text-sm text-gray-500 mt-1">Next hearing: {caseItem.nextHearing}</p>
                    <div className="mt-2">
                      <Link href={`/dashboard/cases/${caseItem.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
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
                AI Case Summaries
              </CardTitle>
              <CardDescription>
                Get easy-to-understand summaries of your legal cases and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-medium">Case Summary</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">AI summarized 2 cases</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="font-medium">Document Review</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Reviewed 5 documents</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <h4 className="font-medium">Legal Updates</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">3 updates available</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Summary
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Brain className="mr-2 h-4 w-4" />
                  Generate New Summary
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
                      Request Update
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment & Billing Section */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lawyer/Case selection dropdown */}
            <div className="mb-4">
              <label htmlFor="case-select" className="block text-sm font-medium text-gray-700 mb-1">Select Case/Lawyer to Pay</label>
              <select
                id="case-select"
                value={selectedCaseId}
                onChange={e => {
                  const selected = cases.find(c => c.id === e.target.value)
                  if (selected) {
                    setSelectedCaseId(selected.id)
                    setSelectedCaseFee(selected.fee)
                  }
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.lawyer} (₹{c.fee.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <BillingCalculator
              userRole={user.role}
              onCalculate={processPayment}
              isProcessing={paymentProcessing}
              fee={selectedCaseFee}
            />

            <PaymentHistory
              payments={clientPayments}
              userRole={user.role}
            />
          </div>

          {paymentSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Payment Successful!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

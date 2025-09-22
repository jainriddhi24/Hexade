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
  Briefcase,
  Scale,
  BookOpen,
  DollarSign,
  Receipt
} from 'lucide-react'
import { PaymentHistory } from '@/components/payment-history'
import { usePayments } from '@/hooks/use-payments'

interface LawyerCase {
  id: string
  title: string
  client: string
  type: string
  fee: number
  paid: number
  pending: number
  paymentStatus: 'PAID' | 'PENDING' | 'DUE'
}

interface StatItem {
  label: string
  value: string
  icon: React.FC<any>
  color: string
}

interface ActivityItem {
  type: 'case' | 'hearing' | 'document'
  title: string
  time: string
  status: 'completed' | 'pending'
}

export default function LawyerDashboardPage() {
  const { user } = useAuth()
  const [emailSent, setEmailSent] = React.useState(false)
  const [cases, setCases] = React.useState<LawyerCase[]>([])
  const [loading, setLoading] = React.useState(true)
  const { payments, getPaymentsForRole, getTotalEarnings, getMonthlyEarnings } = usePayments()

  const lawyerPayments = React.useMemo(() => 
    payments.filter(p => p.lawyerId === user?.id && p.status === 'completed'),
    [payments, user?.id]
  )

  const totalEarnings = React.useMemo(() => 
    lawyerPayments.reduce((sum, p) => sum + p.amount, 0),
    [lawyerPayments]
  )

  const totalDue = React.useMemo(() => 
    cases.reduce((sum, c) => sum + (c.fee - c.paid), 0),
    [cases]
  )

  const uniqueClients = React.useMemo(() => 
    new Set(cases.map(c => c.client)).size,
    [cases]
  )

  // Memoize arrays for performance
  const stats = React.useMemo<StatItem[]>(() => ([
    { label: 'Active Cases', value: cases.length.toString(), icon: FileText, color: 'text-blue-600' },
    { label: 'Active Clients', value: uniqueClients.toString(), icon: Users, color: 'text-green-600' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Amount Due', value: `₹${totalDue.toLocaleString()}`, icon: Receipt, color: 'text-yellow-600' }
  ]), [cases.length, uniqueClients, totalEarnings, totalDue]);

  // Fetch lawyer's cases
  const fetchCases = React.useCallback(async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const data = await response.json()
        const formattedCases: LawyerCase[] = data.cases.map((c: any) => {
          // Calculate payment status
          const casePayments = payments.filter(p => p.caseId === c.id)
          const completedPayments = casePayments.filter(p => p.status === 'completed')
          const pendingPayments = casePayments.filter(p => p.status === 'pending')
          
          const totalPaid = completedPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
          const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
          const totalExpected = c.estimatedValue || 0
          
          // A case is considered PAID if either:
          // 1. The completed payments equal or exceed the estimated value
          // 2. The completed + pending payments equal or exceed the estimated value
          const paymentStatus = totalPaid >= totalExpected ? 'PAID' : 
                              (totalPaid + totalPending >= totalExpected ? 'PENDING' : 'DUE')

          return {
            id: c.id,
            title: c.title,
            client: c.client?.name || 'Unknown Client',
            type: c.caseType || 'Unknown Type',
            fee: totalExpected,
            paid: totalPaid,
            pending: totalPending,
            paymentStatus
          }
        })
        setCases(formattedCases)
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setLoading(false)
    }
  }, [user, payments])

  // Fetch cases when component mounts or payments change
  React.useEffect(() => {
    fetchCases()
  }, [fetchCases])

  if (!user || user.role !== 'LAWYER') return null
  
  // TypeScript type guard to ensure user is not null after this point
  const currentUser = user
  
  const sendEmailNotification = React.useCallback(async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: currentUser.email,
          subject: 'Hexade Portal - Case Update',
          message: `Hello ${currentUser.name},\n\nYour case has been updated. Please check your dashboard for details.\n\nBest regards,\nHexade Team`
        })
      })
      
      if (response.ok) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 3000)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }, [currentUser])


  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // No need to repeat stats data, it's already memoized above
  // Type for activity items
  const recentActivity = React.useMemo<ActivityItem[]>(() => ([
    { type: 'case', title: 'Smith vs. Johnson - Contract Dispute', time: '2 hours ago', status: 'completed' },
    { type: 'hearing', title: 'Brown vs. Davis - Employment', time: '1 day ago', status: 'pending' },
    { type: 'document', title: 'Motion for Summary Judgment filed', time: '2 days ago', status: 'completed' }
  ]), []);

  // Helper to get payment status for a case
  const getCasePaymentStatus = (caseTitle: string) => {
    const paid = lawyerPayments.find(p => p.description?.includes(caseTitle) && p.status === 'completed');
    return paid ? 'Received' : 'Due';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {currentUser.name}
          </h1>
          <p className="text-gray-600">
            Welcome to your legal practice dashboard. Here's your case overview and client management.
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
                          {activity.type === 'case' ? (
                            <FileText className="h-5 w-5 text-blue-600" />
                          ) : activity.type === 'hearing' ? (
                            <Video className="h-5 w-5 text-green-600" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-purple-600" />
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
                <CardDescription>Common legal practice tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/cases" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Cases
                    </Button>
                  </Link>
                  <Link href="/dashboard/clients" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      View Clients
                    </Button>
                  </Link>
                  <Link href="/dashboard/hearings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="mr-2 h-4 w-4" />
                      Schedule Hearing
                    </Button>
                  </Link>
                  <Link href="/dashboard/documents" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Review Documents
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

        {/* Cases & Payment Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                My Cases
              </CardTitle>
              <CardDescription>Manage your active cases and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading cases...</div>
                ) : cases.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No cases found</div>
                ) : (
                  cases.map((c: LawyerCase) => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium">{c.title}</h4>
                        <p className="text-sm text-gray-600">Client: {c.client} • Type: {c.type}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-gray-500">Fee: ₹{c.fee.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">Paid: ₹{c.paid.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge
                        className={
                          c.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {c.paymentStatus}
                      </Badge>
                    </div>
                  ))
                )}
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
                AI Legal Analysis
              </CardTitle>
              <CardDescription>
                Get instant AI-powered summaries of cases, contracts, and legal documents
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
                    <h4 className="font-medium">Legal Research</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Summarized 5 research topics</p>
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
                      Send Client Update
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Cases */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                My Cases
              </CardTitle>
              <CardDescription>Manage your active cases and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading cases...</div>
                ) : cases.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No cases found</div>
                ) : (
                  cases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium">{c.title}</h4>
                        <p className="text-sm text-gray-600">Client: {c.client} • Type: {c.type}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-gray-500">Fee: ₹{c.fee.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">Paid: ₹{c.paid.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge
                        className={
                          c.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {c.paymentStatus}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Services */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Professional Services
              </CardTitle>
              <CardDescription>
                Your legal practice tools and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center mb-2">
                    <Scale className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-medium">Case Management</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Full access to case management tools</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <h4 className="font-medium">AI Legal Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Advanced legal document analysis</p>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">Available</Badge>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="font-medium">Legal Resources</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Access to legal databases and precedents</p>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Tracking */}
        <div className="mt-8">
          <PaymentHistory
            payments={getPaymentsForRole(currentUser.id, 'LAWYER')}
            userRole={currentUser.role}
          />
        </div>
      </div>
    </div>
  )
}

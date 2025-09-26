"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Video, 
  DollarSign,
  Calendar,
  Activity,
  Download,
  RefreshCw,
  Eye,
  PieChart,
  LineChart
} from 'lucide-react'

interface AnalyticsData {
  summary: {
    cases: { total: number; active: number; completed: number }
    hearings: { total: number; upcoming: number; completed: number }
    documents: { total: number; signed: number; unsigned: number }
    payments: { total: number; completed: number; revenue: number }
  }
  recentActivity: Array<{
    id: string
    title: string
    caseNumber: string
    status: string
    updatedAt: string
    client: { name: string }
    assignedLawyer?: { name: string }
  }>
}

export default function EnhancedAnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [type, setType] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, period, type])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${period}&type=${type}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    // In a real implementation, this would generate and download a CSV/PDF report
    console.log('Exporting analytics...')
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Analytics Dashboard</h1>
          <p className="text-gray-600">Track your performance and case metrics with detailed insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="cases">Cases</SelectItem>
              <SelectItem value="hearings">Hearings</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              {user.role === 'ADMIN' && <SelectItem value="users">Users</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Cases</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.summary.cases.total}</p>
                    <p className="text-sm text-gray-500">
                      {analytics.summary.cases.active} active, {analytics.summary.cases.completed} completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Video className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hearings</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.summary.hearings.total}</p>
                    <p className="text-sm text-gray-500">
                      {analytics.summary.hearings.upcoming} upcoming, {analytics.summary.hearings.completed} completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Documents</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.summary.documents.total}</p>
                    <p className="text-sm text-gray-500">
                      {analytics.summary.documents.signed} signed, {analytics.summary.documents.unsigned} unsigned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${analytics.summary.payments.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {analytics.summary.payments.completed} payments completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Case Status Distribution
                </CardTitle>
                <CardDescription>Breakdown of cases by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Active Cases</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.summary.cases.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed Cases</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.summary.cases.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Other Status</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analytics.summary.cases.total - analytics.summary.cases.active - analytics.summary.cases.completed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Document Status
                </CardTitle>
                <CardDescription>Document signing progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Signed Documents</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.summary.documents.signed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Unsigned Documents</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.summary.documents.unsigned}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Signing Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${analytics.summary.documents.total > 0 
                            ? (analytics.summary.documents.signed / analytics.summary.documents.total) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {analytics.summary.documents.total > 0 
                        ? Math.round((analytics.summary.documents.signed / analytics.summary.documents.total) * 100)
                        : 0}% signed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity found</p>
                ) : (
                  analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {activity.caseNumber} • {activity.client.name}
                          {activity.assignedLawyer && ` • ${activity.assignedLawyer.name}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Failed to load analytics data</p>
            <Button onClick={fetchAnalytics} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

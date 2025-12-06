"use client"

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Video, 
  DollarSign,
  Calendar,
  Clock,
  Target
} from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useAuth()

  if (!user) return null

  const getRoleSpecificAnalytics = () => {
    switch (user.role) {
      case 'LAWYER':
        return {
          stats: [
            { label: 'Total Cases', value: '24', change: '+12%', trend: 'up', icon: FileText, color: 'text-blue-600' },
            { label: 'Active Clients', value: '18', change: '+8%', trend: 'up', icon: Users, color: 'text-green-600' },
            { label: 'Hearings This Month', value: '15', change: '+25%', trend: 'up', icon: Video, color: 'text-purple-600' },
            { label: 'Revenue', value: '$45,000', change: '+18%', trend: 'up', icon: DollarSign, color: 'text-orange-600' },
          ],
          charts: [
            { title: 'Cases by Status', data: [
              { name: 'Active', value: 12, color: 'bg-blue-500' },
              { name: 'Completed', value: 8, color: 'bg-green-500' },
              { name: 'Pending', value: 4, color: 'bg-yellow-500' },
            ]},
            { title: 'Monthly Revenue', data: [
              { name: 'Jan', value: 35000 },
              { name: 'Feb', value: 42000 },
              { name: 'Mar', value: 38000 },
              { name: 'Apr', value: 45000 },
            ]},
          ]
        }
      case 'CLIENT':
        return {
          stats: [
            { label: 'My Cases', value: '3', change: '+1', trend: 'up', icon: FileText, color: 'text-blue-600' },
            { label: 'Upcoming Hearings', value: '2', change: '0', trend: 'neutral', icon: Video, color: 'text-purple-600' },
            { label: 'Messages', value: '12', change: '+3', trend: 'up', icon: Users, color: 'text-green-600' },
            { label: 'Total Spent', value: '$8,500', change: '+$1,200', trend: 'up', icon: DollarSign, color: 'text-orange-600' },
          ],
          charts: [
            { title: 'Case Progress', data: [
              { name: 'In Progress', value: 2, color: 'bg-blue-500' },
              { name: 'Completed', value: 1, color: 'bg-green-500' },
              { name: 'Filed', value: 0, color: 'bg-yellow-500' },
            ]},
            { title: 'Monthly Spending', data: [
              { name: 'Jan', value: 2500, color: 'bg-blue-500' },
              { name: 'Feb', value: 3200, color: 'bg-green-500' },
              { name: 'Mar', value: 1800, color: 'bg-yellow-500' },
              { name: 'Apr', value: 1000, color: 'bg-purple-500' },
            ]},
          ]
        }
      case 'JUDGE':
        return {
          stats: [
            { label: 'Hearings Today', value: '5', change: '+2', trend: 'up', icon: Video, color: 'text-blue-600' },
            { label: 'Cases Reviewed', value: '42', change: '+8%', trend: 'up', icon: FileText, color: 'text-green-600' },
            { label: 'Decisions Pending', value: '7', change: '-2', trend: 'down', icon: Clock, color: 'text-orange-600' },
            { label: 'Average Hearing Time', value: '45m', change: '-5m', trend: 'down', icon: Target, color: 'text-purple-600' },
          ],
          charts: [
            { title: 'Hearings by Type', data: [
              { name: 'Civil', value: 15, color: 'bg-blue-500' },
              { name: 'Criminal', value: 8, color: 'bg-red-500' },
              { name: 'Family', value: 12, color: 'bg-green-500' },
            ]},
            { title: 'Monthly Hearings', data: [
              { name: 'Jan', value: 45, color: 'bg-blue-500' },
              { name: 'Feb', value: 52, color: 'bg-green-500' },
              { name: 'Mar', value: 38, color: 'bg-yellow-500' },
              { name: 'Apr', value: 48, color: 'bg-purple-500' },
            ]},
          ]
        }
      default:
        return {
          stats: [],
          charts: []
        }
    }
  }

  const analytics = getRoleSpecificAnalytics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your performance and key metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="bg-hexade-blue hover:bg-blue-800">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {analytics.stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {React.createElement(stat.icon, { className: `h-8 w-8 ${stat.color}` })}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="ml-2 flex items-center">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : stat.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                      )}
                      <span className={`ml-1 text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.charts.map((chart, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {chart.title.includes('Revenue') || chart.title.includes('Spending') || chart.title.includes('Hearings') ? (
                // Bar chart simulation
                <div className="space-y-4">
                  <div className="flex items-end space-x-2 h-48">
                    {chart.data.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-hexade-blue rounded-t"
                          style={{ height: `${(item.value / Math.max(...chart.data.map(d => d.value))) * 180}px` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-2">{item.name}</span>
                        <span className="text-xs font-medium text-gray-900">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Pie chart simulation
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                      <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {chart.data.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {item.color && <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>}
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key insights and recommendations based on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Great Progress!</h4>
                <p className="text-sm text-green-700">
                  Your case completion rate has increased by 15% this month compared to last month.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Optimization Opportunity</h4>
                <p className="text-sm text-blue-700">
                  Consider scheduling more consultations during peak hours (10 AM - 2 PM) for better client engagement.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Time Management</h4>
                <p className="text-sm text-yellow-700">
                  Your average hearing duration has decreased by 5 minutes, indicating improved efficiency.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

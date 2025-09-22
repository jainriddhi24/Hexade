"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface Hearing {
  id: string
  caseId: string
  scheduledAt: string
  duration: number
  status: string
  agenda?: string
  roomId: string
  case: {
    id: string
    title: string
    caseNumber: string
    client: { name: string; email: string }
    assignedLawyer?: { name: string; email: string }
  }
  judge?: { name: string; email: string }
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHearings()
  }, [])

  const fetchHearings = async () => {
    try {
      const response = await fetch('/api/hearings')
      if (response.ok) {
        const data = await response.json()
        setHearings(data.hearings || [])
      }
    } catch (error) {
      console.error('Failed to fetch hearings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Convert hearings to calendar events
  const calendarEvents = hearings.map(hearing => ({
    id: hearing.id,
    title: hearing.case.title,
    time: new Date(hearing.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: hearing.duration,
    type: 'hearing',
    participants: [
      hearing.case.client.name,
      hearing.case.assignedLawyer?.name,
      hearing.judge?.name
    ].filter(Boolean),
    caseId: hearing.case.caseNumber,
    roomId: hearing.roomId,
    scheduledAt: hearing.scheduledAt,
    status: hearing.status
  }))

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-100 text-red-800 border-red-200'
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hearing': return Video
      case 'consultation': return Users
      case 'meeting': return Calendar
      default: return Calendar
    }
  }

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
      const currentDayDate = new Date(currentYear, currentMonth, day)
      const dayEvents = calendarEvents.filter(event => {
        const eventDate = new Date(event.scheduledAt)
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear
      })
      
      days.push(
        <div key={day} className={`h-24 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => {
              const EventIcon = getEventIcon(event.type)
              const statusColor = event.status === 'SCHEDULED' ? 'border-green-200' : 
                                event.status === 'IN_PROGRESS' ? 'border-yellow-200' :
                                event.status === 'COMPLETED' ? 'border-blue-200' : 'border-gray-200'
              return (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} ${statusColor}`}
                  title={`${event.title} - ${event.time} (${event.status})`}
                >
                  <div className="flex items-center">
                    <EventIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{event.title}</span>
                  </div>
                </div>
              )
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View and manage your scheduled hearings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {user.role === 'LAWYER' && (
            <Button className="bg-hexade-blue hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Hearing
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {monthNames[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarEvents
                  .filter(event => {
                    const eventDate = new Date(event.scheduledAt)
                    const today = new Date()
                    return eventDate.getDate() === today.getDate() && 
                           eventDate.getMonth() === today.getMonth() && 
                           eventDate.getFullYear() === today.getFullYear()
                  })
                  .map(event => {
                    const EventIcon = getEventIcon(event.type)
                    return (
                      <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <EventIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.time}</p>
                          <p className="text-xs text-gray-400">{event.duration} min</p>
                          <p className="text-xs text-gray-400">Case: {event.caseId}</p>
                        </div>
                        {event.roomId && (
                          <Button size="sm" variant="outline">
                            Join
                          </Button>
                        )}
                      </div>
                    )
                  })}
                {calendarEvents.filter(event => {
                  const eventDate = new Date(event.scheduledAt)
                  const today = new Date()
                  return eventDate.getDate() === today.getDate() && 
                         eventDate.getMonth() === today.getMonth() && 
                         eventDate.getFullYear() === today.getFullYear()
                }).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hearings scheduled for today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Hearings</span>
                <span className="text-sm font-medium">{calendarEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="text-sm font-medium">{calendarEvents.filter(e => e.status === 'SCHEDULED').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">{calendarEvents.filter(e => e.status === 'COMPLETED').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium">{calendarEvents.filter(e => e.status === 'IN_PROGRESS').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Event Types Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                <span className="text-sm text-gray-600">Hearings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                <span className="text-sm text-gray-600">Consultations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                <span className="text-sm text-gray-600">Meetings</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

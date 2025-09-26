"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Search,
  Filter,
  Plus,
  Play,
  Eye,
  Edit,
  Trash2,
  Save,
  X
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

export default function HearingsPage() {
  const { user } = useAuth()
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [newHearing, setNewHearing] = useState({
    caseId: '',
    scheduledAt: '',
    duration: 60,
    agenda: '',
    judgeId: ''
  })

  useEffect(() => {
    fetchHearings()
    fetchCases()
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

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases || [])
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    }
  }

  const handleCreateHearing = async (e: React.FormEvent) => {
    e.preventDefault()
    // Only lawyers can create hearings
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can schedule hearings')
      return
    }
    
    try {
      const response = await fetch('/api/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHearing)
      })

      if (response.ok) {
        await fetchHearings()
        setIsCreating(false)
        setNewHearing({ caseId: '', scheduledAt: '', duration: 60, agenda: '', judgeId: '' })
      }
    } catch (error) {
      console.error('Failed to create hearing:', error)
    }
  }

  const handleUpdateHearing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHearing) return

    // Only lawyers can update hearings
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can update hearings')
      return
    }

    try {
      const response = await fetch(`/api/hearings/${editingHearing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: editingHearing.scheduledAt,
          duration: editingHearing.duration,
          agenda: editingHearing.agenda,
          status: editingHearing.status
        })
      })

      if (response.ok) {
        await fetchHearings()
        setEditingHearing(null)
      }
    } catch (error) {
      console.error('Failed to update hearing:', error)
    }
  }

  const handleDeleteHearing = async (hearingId: string) => {
    if (!confirm('Are you sure you want to delete this hearing?')) return

    // Only lawyers can delete hearings
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can delete hearings')
      return
    }

    try {
      const response = await fetch(`/api/hearings/${hearingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchHearings()
      }
    } catch (error) {
      console.error('Failed to delete hearing:', error)
    }
  }

  if (!user) return null

  const filteredHearings = hearings.filter(hearing => {
    const matchesSearch = hearing.case.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hearing.case.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || hearing.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'POSTPONED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading hearings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hearings</h1>
          <p className="text-gray-600">Manage and join your scheduled hearings</p>
        </div>
        {user.role === 'LAWYER' && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-hexade-blue hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Hearing
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hearings</p>
                <p className="text-2xl font-semibold text-gray-900">{hearings.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {hearings.filter(h => h.status === 'SCHEDULED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {hearings.filter(h => h.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {hearings.filter(h => h.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search hearings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="POSTPONED">Postponed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Hearing Modal */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Hearing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateHearing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseId">Case</Label>
                  <select
                    id="caseId"
                    value={newHearing.caseId}
                    onChange={(e) => setNewHearing({ ...newHearing, caseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select a case</option>
                    {cases.map(caseItem => (
                      <option key={caseItem.id} value={caseItem.id}>
                        {caseItem.title} - {caseItem.caseNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="scheduledAt">Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={newHearing.scheduledAt}
                    onChange={(e) => setNewHearing({ ...newHearing, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={newHearing.duration}
                    onChange={(e) => setNewHearing({ ...newHearing, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="judgeId">Judge (Optional)</Label>
                  <Input
                    id="judgeId"
                    value={newHearing.judgeId}
                    onChange={(e) => setNewHearing({ ...newHearing, judgeId: e.target.value })}
                    placeholder="Judge ID or name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="agenda">Agenda</Label>
                <textarea
                  id="agenda"
                  value={newHearing.agenda}
                  onChange={(e) => setNewHearing({ ...newHearing, agenda: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                  placeholder="Hearing agenda and topics to discuss..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="bg-hexade-blue hover:bg-blue-800">
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Hearing
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Hearings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredHearings.map((hearing) => {
          const { date, time } = formatDateTime(hearing.scheduledAt)
          const upcoming = isUpcoming(hearing.scheduledAt)
          const past = isPast(hearing.scheduledAt)
          
          return (
            <Card key={hearing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{hearing.case.title}</CardTitle>
                      <Badge className={getStatusColor(hearing.status)}>
                        {hearing.status.replace('_', ' ')}
                      </Badge>
                      {upcoming && hearing.status === 'SCHEDULED' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Upcoming
                        </Badge>
                      )}
                      {past && hearing.status === 'COMPLETED' && (
                        <Badge variant="outline" className="text-gray-600 border-gray-600">
                          Past
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      Hearing ID: {hearing.id} • Case: {hearing.case.caseNumber}
                    </CardDescription>
                  </div>
                  {user.role === 'LAWYER' && hearing.status !== 'COMPLETED' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingHearing(hearing)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteHearing(hearing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hearing.agenda && (
                    <p className="text-gray-600">{hearing.agenda}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-1 font-medium">{date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-1 font-medium">{time}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-1 font-medium">{hearing.duration} min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Client:</span>
                      <span className="ml-1 font-medium">{hearing.case.client.name}</span>
                    </div>
                    {hearing.case.assignedLawyer && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Lawyer:</span>
                        <span className="ml-1 font-medium">{hearing.case.assignedLawyer.name}</span>
                      </div>
                    )}
                  </div>

                  {hearing.status === 'SCHEDULED' && upcoming && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm text-green-800">
                          Ready to join • Room: {hearing.roomId}
                        </span>
                      </div>
                      <Link href={`/hearing/${hearing.roomId}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Join Hearing
                        </Button>
                      </Link>
                    </div>
                  )}

                  {hearing.status === 'IN_PROGRESS' && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Currently in progress • Room: {hearing.roomId}
                        </span>
                      </div>
                      <Link href={`/hearing/${hearing.roomId}`}>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          <Play className="h-4 w-4 mr-2" />
                          Join Now
                        </Button>
                      </Link>
                    </div>
                  )}

                  {hearing.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="text-sm text-gray-800">
                          Hearing completed • Room: {hearing.roomId}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/hearing/${hearing.id}/recording`}>
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            View Recording
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/hearings/${hearing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {hearing.status === 'COMPLETED' && (
                        <Link href={`/hearing/${hearing.id}/recording`}>
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            View Recording
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Room ID: {hearing.roomId}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Hearing Modal */}
      {editingHearing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Hearing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateHearing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-scheduledAt">Date & Time</Label>
                  <Input
                    id="edit-scheduledAt"
                    type="datetime-local"
                    value={editingHearing.scheduledAt}
                    onChange={(e) => setEditingHearing({ ...editingHearing, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="15"
                    max="480"
                    value={editingHearing.duration}
                    onChange={(e) => setEditingHearing({ ...editingHearing, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    value={editingHearing.status}
                    onChange={(e) => setEditingHearing({ ...editingHearing, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="POSTPONED">Postponed</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-agenda">Agenda</Label>
                <textarea
                  id="edit-agenda"
                  value={editingHearing.agenda || ''}
                  onChange={(e) => setEditingHearing({ ...editingHearing, agenda: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingHearing(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="bg-hexade-blue hover:bg-blue-800">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredHearings.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hearings scheduled</h3>
            <p className="text-gray-600 mb-6">Schedule your first hearing to get started.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-hexade-blue hover:bg-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Hearing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
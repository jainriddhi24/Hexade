"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  FileText, 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  Save,
  X,
  CreditCard
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { CaseBilling } from '@/components/case-billing'

interface Case {
  id: string
  title: string
  caseNumber: string
  status: string
  priority: string
  client: { name: string; email: string }
  assignedLawyer?: { name: string; email: string }
  createdAt: string
  updatedAt: string
  estimatedValue: number
  tags: string[]
  description?: string
}

export default function CasesPage() {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showBilling, setShowBilling] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    caseType: '',
    priority: 'normal',
    tags: [] as string[],
    clientId: '',
    hearingDate: '',
    estimatedValue: 0
  })
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    fetchCases()
    if (user?.role === 'LAWYER') {
      fetchClients()
    }
  }, [user])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases || [])
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault()
    // Only lawyers can create cases
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can create cases')
      return
    }
    
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      })

      if (response.ok) {
        await fetchCases()
        setIsCreating(false)
        setNewCase({ title: '', description: '', caseType: '', priority: 'normal', tags: [], clientId: '', hearingDate: '', estimatedValue: 0 })
      }
    } catch (error) {
      console.error('Failed to create case:', error)
    }
  }

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCase) return

    // Only lawyers can update cases
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can update cases')
      return
    }

    try {
      const response = await fetch(`/api/cases/${editingCase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingCase.title,
          description: editingCase.description,
          priority: editingCase.priority,
          tags: editingCase.tags,
          estimatedValue: editingCase.estimatedValue
        })
      })

      if (response.ok) {
        await fetchCases()
        setEditingCase(null)
      }
    } catch (error) {
      console.error('Failed to update case:', error)
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return

    // Only lawyers can delete cases
    if (user?.role !== 'LAWYER') {
      alert('Only lawyers can delete cases')
      return
    }

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCases()
      }
    } catch (error) {
      console.error('Failed to delete case:', error)
    }
  }

  const handleBillingPayment = (amount: number, transactionId: string) => {
    setPaymentProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false)
      setShowBilling(false)
      setSelectedCase(null)
      alert(`Advance payment of ₹${amount} processed successfully! Transaction ID: ${transactionId}`)
    }, 2000)
  }

  const openBilling = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setShowBilling(true)
  }

  if (!user) return null

  // Only lawyers and judges can create/edit/delete cases
  const canManageCases = user.role === 'LAWYER' || user.role === 'JUDGE'

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || caseItem.status === statusFilter
    const matchesPriority = !priorityFilter || caseItem.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED': return 'bg-blue-100 text-blue-800'
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800'
      case 'HEARING_SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CLOSED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading cases...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600">Manage your legal cases and track their progress</p>
        </div>
        {canManageCases && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-hexade-blue hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{cases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => ['FILED', 'ASSIGNED', 'IN_PROGRESS', 'HEARING_SCHEDULED'].includes(c.status)).length}
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => c.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{cases.reduce((sum, c) => sum + (c.estimatedValue || 0), 0).toLocaleString()}
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
                  placeholder="Search cases..."
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
                <option value="FILED">Filed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Case Modal */}
      {isCreating && canManageCases && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Case</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Case Title</Label>
                  <Input
                    id="title"
                    value={newCase.title}
                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="caseType">Case Type</Label>
                  <Input
                    id="caseType"
                    value={newCase.caseType}
                    onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hearingDate">Hearing Date (Optional)</Label>
                  <Input
                    id="hearingDate"
                    type="datetime-local"
                    value={newCase.hearingDate}
                    onChange={(e) => setNewCase({ ...newCase, hearingDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCase.estimatedValue}
                    onChange={(e) => setNewCase({ ...newCase, estimatedValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {user?.role === 'LAWYER' && (
                  <div>
                    <Label htmlFor="clientId">Client</Label>
                    <select
                      id="clientId"
                      value={newCase.clientId}
                      onChange={(e) => setNewCase({ ...newCase, clientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="bg-hexade-blue hover:bg-blue-800">
                  <Save className="h-4 w-4 mr-2" />
                  Create Case
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cases Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(caseItem.priority)}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <CardDescription>Case #{caseItem.caseNumber}</CardDescription>
                </div>
                {canManageCases && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingCase(caseItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCase(caseItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-1 font-medium">{caseItem.client.name}</span>
                  </div>
                  {caseItem.assignedLawyer && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Lawyer:</span>
                      <span className="ml-1 font-medium">{caseItem.assignedLawyer.name}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-1 font-medium">
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-1 font-medium">
                      {new Date(caseItem.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(caseItem.tags || []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{(caseItem.estimatedValue || 0).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/cases/${caseItem.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {user?.role === 'CLIENT' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openBilling(caseItem)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Billing
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Hearing
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(caseItem.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Case Modal */}
      {editingCase && canManageCases && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Case</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Case Title</Label>
                  <Input
                    id="edit-title"
                    value={editingCase.title}
                    onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <select
                    id="edit-priority"
                    value={editingCase.priority}
                    onChange={(e) => setEditingCase({ ...editingCase, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-estimatedValue">Estimated Value ($)</Label>
                  <Input
                    id="edit-estimatedValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingCase.estimatedValue || 0}
                    onChange={(e) => setEditingCase({ ...editingCase, estimatedValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={editingCase.description || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingCase(null)}>
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
      {filteredCases.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first case.</p>
            {user.role === 'LAWYER' && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-hexade-blue hover:bg-blue-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Case
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Case Billing Modal */}
      {showBilling && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Case Billing - {selectedCase.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBilling(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <CaseBilling
                caseTitle={selectedCase.title}
                caseDescription={selectedCase.description || 'Legal case requiring professional services'}
                onPaymentSuccess={handleBillingPayment}
                isProcessing={paymentProcessing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
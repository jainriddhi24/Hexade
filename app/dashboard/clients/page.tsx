"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Calendar,
  FileText,
  Phone,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MoreHorizontal
} from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  notes?: string
  createdAt: string
  totalBilling: number
  activeCases: number
  totalCases: number
}

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...')
      const response = await fetch('/api/clients')
      console.log('Fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched clients data:', data)
        setClients(data.clients || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch clients:', errorData)
        alert(`Failed to fetch clients: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      alert(`Error fetching clients: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating client with data:', newClient)
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        console.log('Client created successfully, refreshing list...')
        await fetchClients()
        setIsCreating(false)
        setNewClient({ name: '', email: '', phone: '', address: '', company: '', notes: '' })
        alert('Client created successfully!')
      } else {
        console.error('Failed to create client:', responseData)
        alert(`Failed to create client: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create client:', error)
      alert(`Error creating client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    try {
      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          address: editingClient.address,
          company: editingClient.company,
          notes: editingClient.notes
        })
      })

      if (response.ok) {
        await fetchClients()
        setEditingClient(null)
      }
    } catch (error) {
      console.error('Failed to update client:', error)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchClients()
        alert('Client deleted successfully')
      } else {
        const errorData = await response.json()
        alert(`Failed to delete client: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete client:', error)
      alert(`Error deleting client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (!user || user.role !== 'LAWYER') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">This page is only available for lawyers.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    )
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getStatusColor = (client: Client) => {
    if (client.activeCases > 0) return 'bg-green-100 text-green-800'
    if (client.totalCases > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (client: Client) => {
    if (client.activeCases > 0) return 'Active'
    if (client.totalCases > 0) return 'Inactive'
    return 'No Cases'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and cases</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-hexade-blue hover:bg-blue-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clients.filter(c => c.activeCases > 0).length}
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
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clients.reduce((sum, client) => sum + client.totalCases, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Billing</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${clients.reduce((sum, client) => sum + client.totalBilling, 0).toLocaleString()}
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hexade-blue focus:border-transparent">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Client Modal */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
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
                  Add Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.email}</CardDescription>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(client)}>
                        {getStatusText(client)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {client.totalCases} case{client.totalCases !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-1 font-medium">{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Client Since:</span>
                    <span className="ml-1 font-medium">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Total Billing:</span>
                    <span className="ml-1 font-medium">${client.totalBilling.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/cases?clientId=${client.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Cases
                      </Button>
                    </Link>
                  </div>
                  <div className="text-sm text-gray-500">
                    {client.activeCases} active case{client.activeCases !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Client Name</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingClient.company || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingClient.address || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
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
      {filteredClients.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-6">Start building your client base by adding your first client.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-hexade-blue hover:bg-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

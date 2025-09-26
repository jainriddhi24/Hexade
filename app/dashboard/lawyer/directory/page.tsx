"use client"

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { 
  Search, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  Users,
  FileText,
  Filter,
  SortAsc,
  Briefcase,
  Eye,
  MessageCircle,
  Plus
} from 'lucide-react'

export default function LawyerDirectoryPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('all')

  if (!user || user.role !== 'LAWYER') return null

  const specialties = [
    'All Specialties',
    'Criminal Law',
    'Family Law', 
    'Corporate Law',
    'Personal Injury',
    'Employment Law',
    'Real Estate',
    'Immigration',
    'Tax Law',
    'Intellectual Property'
  ]

  const lawyers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Criminal Law',
      experience: '15 years',
      rating: 4.9,
      reviews: 127,
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@law.com',
      bio: 'Experienced criminal defense attorney with 15 years of practice. Specializes in white-collar crimes and DUI cases.',
      cases: 450,
      successRate: 94,
      languages: ['English', 'Spanish'],
      education: 'Harvard Law School',
      certifications: ['Board Certified Criminal Law', 'DUI Defense Specialist'],
      availability: 'Available',
      consultationFee: '$300/hour',
      isColleague: true,
      lastCollaboration: '2 weeks ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialty: 'Corporate Law',
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@law.com',
      bio: 'Corporate law expert specializing in mergers, acquisitions, and business formation. Former Big Law partner.',
      cases: 320,
      successRate: 96,
      languages: ['English', 'Mandarin'],
      education: 'Stanford Law School',
      certifications: ['Corporate Law Specialist', 'M&A Expert'],
      availability: 'Available',
      consultationFee: '$400/hour',
      isColleague: false,
      lastCollaboration: null
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      specialty: 'Family Law',
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      location: 'Los Angeles, CA',
      phone: '+1 (555) 345-6789',
      email: 'emily.rodriguez@law.com',
      bio: 'Compassionate family law attorney focusing on divorce, child custody, and adoption cases.',
      cases: 280,
      successRate: 92,
      languages: ['English', 'Spanish'],
      education: 'UCLA School of Law',
      certifications: ['Family Law Specialist', 'Mediation Certified'],
      availability: 'Available',
      consultationFee: '$250/hour',
      isColleague: true,
      lastCollaboration: '1 month ago'
    },
    {
      id: 4,
      name: 'David Thompson',
      specialty: 'Personal Injury',
      experience: '18 years',
      rating: 4.7,
      reviews: 203,
      location: 'Chicago, IL',
      phone: '+1 (555) 456-7890',
      email: 'david.thompson@law.com',
      bio: 'Personal injury attorney with a track record of securing millions in settlements for clients.',
      cases: 650,
      successRate: 98,
      languages: ['English'],
      education: 'Northwestern Law School',
      certifications: ['Personal Injury Specialist', 'Trial Lawyer'],
      availability: 'Available',
      consultationFee: 'Contingency',
      isContingency: true,
      isColleague: false,
      lastCollaboration: null
    }
  ]

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || lawyer.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lawyer Directory</h1>
              <p className="text-gray-600">Connect with fellow legal professionals and build your network</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Briefcase className="h-4 w-4 mr-1" />
                Lawyer Network
              </Badge>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Colleague
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search lawyers by name, specialty, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hexade-blue focus:border-transparent"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredLawyers.length} lawyers in your network
            </p>
            <Button variant="outline" className="flex items-center">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort by Rating
            </Button>
          </div>
        </div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{lawyer.name}</CardTitle>
                    <CardDescription className="text-base">{lawyer.specialty}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {lawyer.availability}
                    </Badge>
                    {lawyer.isColleague && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Colleague
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(lawyer.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill={i < Math.floor(lawyer.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {lawyer.rating} ({lawyer.reviews} reviews)
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {lawyer.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {lawyer.experience} experience
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    {lawyer.cases} cases handled
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {lawyer.successRate}% success rate
                  </div>
                  
                  {lawyer.isColleague && lawyer.lastCollaboration && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last collaboration: {lawyer.lastCollaboration}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {lawyer.bio}
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      Consultation: {lawyer.consultationFee}
                      {lawyer.isContingency && (
                        <span className="text-xs text-gray-500 ml-1">(No fee unless you win)</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network Statistics */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Your Professional Network</CardTitle>
              <CardDescription>Overview of your lawyer connections and collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{lawyers.length}</div>
                  <div className="text-sm text-gray-600">Total Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {lawyers.filter(l => l.isColleague).length}
                  </div>
                  <div className="text-sm text-gray-600">Colleagues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {lawyers.filter(l => l.availability === 'Available').length}
                  </div>
                  <div className="text-sm text-gray-600">Available Now</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(lawyers.reduce((sum, l) => sum + l.successRate, 0) / lawyers.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

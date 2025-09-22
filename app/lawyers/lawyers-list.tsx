'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Lawyer } from './types'
import { PhoneIcon, EnvelopeIcon, CalendarIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

// Helper function to clean and split strings
const formatArrayString = (str: string | null): string[] => {
  if (!str) return [];
  // Remove square brackets, quotes, and apostrophes, then split by comma
  return str
    .replace(/[\[\]'"]/g, '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export function LawyersList({ lawyers }: { lawyers: Lawyer[] }) {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [minExperience, setMinExperience] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleBookConsultation = (lawyerId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    router.push(`/book-consultation/${lawyerId}`)
  }

  // Get unique practice areas and districts
  const { practiceAreas, districts } = useMemo(() => {
    const areas = new Set<string>()
    const dist = new Set<string>()

    lawyers.forEach(lawyer => {
      const practiceAreas = lawyer.lawyerProfile?.practiceAreas || null
      const districts = lawyer.lawyerProfile?.districts || null

      formatArrayString(practiceAreas).forEach(area => areas.add(area))
      formatArrayString(districts).forEach(district => dist.add(district))
    })

    return {
      practiceAreas: Array.from(areas).sort(),
      districts: Array.from(dist).sort()
    }
  }, [lawyers])

  // Filter lawyers based on search and filters
  const filteredLawyers = useMemo(() => {
    return lawyers.filter(lawyer => {
      // Search term filter
      const searchMatch = !searchTerm || 
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lawyer.lawyerProfile?.practiceAreas || '').toLowerCase().includes(searchTerm.toLowerCase())

      // Practice area filter
      const practiceAreaMatch = !selectedPracticeArea ||
        formatArrayString(lawyer.lawyerProfile?.practiceAreas || null).includes(selectedPracticeArea)

      // District filter
      const districtMatch = !selectedDistrict ||
        formatArrayString(lawyer.lawyerProfile?.districts || null).includes(selectedDistrict)

      // Experience filter
      const experienceMatch = !minExperience ||
        (lawyer.lawyerProfile?.experienceYears || 0) >= minExperience

      return searchMatch && practiceAreaMatch && districtMatch && experienceMatch
    })
  }, [lawyers, searchTerm, selectedPracticeArea, selectedDistrict, minExperience])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#F8FAFC] pb-16">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent h-96"></div>
          <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(45%_60%_at_50%_0%,rgba(59,130,246,0.12)_0,rgba(59,130,246,0)_100%)]"></div>
          <div className="relative container mx-auto px-4 pt-16 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  Find Your Perfect <span className="text-blue-600">Legal Partner</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Connect with experienced lawyers who understand your needs and provide expert legal guidance.
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="mt-12 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Search by name or practice area..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {(selectedPracticeArea || selectedDistrict || minExperience) && (
                      <Badge className="ml-1 bg-blue-100 text-blue-700">
                        {[selectedPracticeArea, selectedDistrict, minExperience && `${minExperience}+ years`]
                          .filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Practice Area</label>
                        <select
                          className="w-full rounded-md border-gray-200"
                          value={selectedPracticeArea || ''}
                          onChange={(e) => setSelectedPracticeArea(e.target.value || null)}
                        >
                          <option value="">All Practice Areas</option>
                          {practiceAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">District</label>
                        <select
                          className="w-full rounded-md border-gray-200"
                          value={selectedDistrict || ''}
                          onChange={(e) => setSelectedDistrict(e.target.value || null)}
                        >
                          <option value="">All Districts</option>
                          {districts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Minimum Experience</label>
                        <select
                          className="w-full rounded-md border-gray-200"
                          value={minExperience || ''}
                          onChange={(e) => setMinExperience(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Any Experience</option>
                          <option value="5">5+ years</option>
                          <option value="10">10+ years</option>
                          <option value="15">15+ years</option>
                          <option value="20">20+ years</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPracticeArea(null)
                          setSelectedDistrict(null)
                          setMinExperience(null)
                        }}
                        className="text-sm"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Results count */}
                <div className="mt-6 text-sm text-gray-500">
                  Found {filteredLawyers.length} lawyers matching your criteria
                </div>
              </div>
              
              {filteredLawyers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredLawyers.map((lawyer) => (
                  <div 
                    key={lawyer.id} 
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 relative"
                  >
                    
                    {/* Profile Header */}
                    <div className="relative p-6">
                      <div className="flex items-center gap-5">
                        <div className="shrink-0 h-24 w-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 ring-2 ring-white shadow-md">
                          {lawyer.avatar ? (
                            <img src={lawyer.avatar} alt={lawyer.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-blue-400">
                              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-xl text-gray-900 truncate">{lawyer.name}</h3>
                            {lawyer.lawyerProfile?.verified && (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200/50">
                                Verified
                              </Badge>
                            )}
                          </div>
                          {lawyer.lawyerProfile?.practiceAreas && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formatArrayString(lawyer.lawyerProfile.practiceAreas).map((area) => (
                                <Badge 
                                  key={area} 
                                  variant="secondary" 
                                  className="bg-blue-50 text-blue-600 text-xs border border-blue-100 px-2 py-0.5"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50/80 rounded-xl p-4 text-center backdrop-blur-sm">
                          <p className="text-gray-900 flex items-baseline justify-center">
                            <span className="text-2xl font-semibold">
                              {lawyer.lawyerProfile?.experienceYears}
                            </span>
                            <span className="text-sm ml-1 text-gray-600">years</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Experience</p>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-4 text-center backdrop-blur-sm">
                          <p className="text-gray-900 flex items-baseline justify-center">
                            <span className="text-2xl font-semibold">
                              {lawyer.lawyerProfile?.rating.toFixed(1)}
                            </span>
                            <span className="text-sm ml-1 text-gray-600">/ 5.0</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Rating</p>
                        </div>
                      </div>

                      {/* Districts */}
                      {lawyer.lawyerProfile?.districts && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Practicing Districts</p>
                          <div className="flex flex-wrap gap-1.5">
                            {formatArrayString(lawyer.lawyerProfile.districts).map((district) => (
                              <Badge 
                                key={district}
                                variant="secondary" 
                                className="bg-gray-50 text-gray-600 text-xs border border-gray-200 px-2 py-0.5 hover:bg-gray-100 transition-colors"
                              >
                                {district}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fee */}
                      {lawyer.lawyerProfile?.consultationFee && (
                        <div className="mt-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-blue-600/80 mb-0.5">Consultation Fee</p>
                                <div className="flex items-baseline">
                                  <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    ${lawyer.lawyerProfile.consultationFee}
                                  </span>
                                  <span className="text-blue-600/90 text-sm ml-1">/hr</span>
                                </div>
                              </div>
                              <div className="bg-white/80 rounded-lg px-2.5 py-1.5 border border-blue-100/50">
                                <p className="text-xs text-blue-600/90">Initial Consultation</p>
                                <p className="text-sm font-medium text-blue-900">60 minutes</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3 bg-gray-50/50 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-white flex items-center justify-center gap-1.5 text-gray-700 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100"
                          onClick={() => window.location.href = `mailto:${lawyer.email}`}
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                          Email
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 bg-white flex items-center justify-center gap-1.5 text-gray-700 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100"
                          onClick={() => window.location.href = `mailto:${lawyer.email}`}
                        >
                          <PhoneIcon className="h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                      <Button 
                        className="w-full mt-2 bg-blue-600 text-white flex items-center justify-center gap-1.5 text-sm font-medium transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handleBookConsultation(lawyer.id)}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No lawyers found</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
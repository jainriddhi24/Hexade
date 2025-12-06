"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  Video, 
  MessageSquare, 
  Users, 
  Calendar,
  Clock,
  User,
  Briefcase,
  MessageCircle
} from 'lucide-react'

interface SearchResult {
  cases: Array<{
    id: string
    title: string
    caseNumber: string
    status: string
    client: { name: string }
    assignedLawyer?: { name: string }
  }>
  hearings: Array<{
    id: string
    agenda?: string
    scheduledAt: string
    status: string
    case: {
      title: string
      caseNumber: string
    }
  }>
  documents: Array<{
    id: string
    title: string
    fileType: string
    createdAt: string
    case?: {
      title: string
      caseNumber: string
    }
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: { name: string }
    hearing?: {
      case: {
        title: string
        caseNumber: string
      }
    }
  }>
  users: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
}

interface GlobalSearchProps {
  placeholder?: string
  className?: string
}

export function GlobalSearch({ placeholder = "Search everything...", className = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        setIsOpen(true)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results) return

    const allResults = [
      ...results.cases.map(r => ({ ...r, type: 'case' })),
      ...results.hearings.map(r => ({ ...r, type: 'hearing' })),
      ...results.documents.map(r => ({ ...r, type: 'document' })),
      ...results.messages.map(r => ({ ...r, type: 'message' })),
      ...results.users.map(r => ({ ...r, type: 'user' })),
    ]

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (allResults[selectedIndex]) {
        handleResultClick(allResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = (result: any) => {
    setIsOpen(false)
    setQuery('')
    
    switch (result.type) {
      case 'case':
        router.push(`/dashboard/cases`)
        break
      case 'hearing':
        router.push(`/hearing/${result.id}`)
        break
      case 'document':
        router.push(`/dashboard/documents`)
        break
      case 'message':
        router.push(`/dashboard/messages`)
        break
      case 'user':
        router.push(`/dashboard/clients`)
        break
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'case': return Briefcase
      case 'hearing': return Video
      case 'document': return FileText
      case 'message': return MessageCircle
      case 'user': return User
      default: return FileText
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const allResults = results ? [
    ...results.cases.map(r => ({ ...r, type: 'case' })),
    ...results.hearings.map(r => ({ ...r, type: 'hearing' })),
    ...results.documents.map(r => ({ ...r, type: 'document' })),
    ...results.messages.map(r => ({ ...r, type: 'message' })),
    ...results.users.map(r => ({ ...r, type: 'user' })),
  ] : []

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && results && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {allResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {/* Cases */}
                {results.cases.length > 0 && (
                  <div className="px-4 py-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Cases ({results.cases.length})
                    </div>
                    {results.cases.map((result, index) => {
                      const globalIndex = results.cases.slice(0, index).length
                      const Icon = getResultIcon('case')
                      return (
                        <div
                          key={result.id}
                          className={`flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleResultClick({ ...result, type: 'case' })}
                        >
                          <Icon className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{result.title}</div>
                            <div className="text-xs text-gray-500">{result.caseNumber}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Hearings */}
                {results.hearings.length > 0 && (
                  <div className="px-4 py-2 border-t">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Hearings ({results.hearings.length})
                    </div>
                    {results.hearings.map((result, index) => {
                      const globalIndex = results.cases.length + results.hearings.slice(0, index).length
                      const Icon = getResultIcon('hearing')
                      return (
                        <div
                          key={result.id}
                          className={`flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleResultClick({ ...result, type: 'hearing' })}
                        >
                          <Icon className="h-4 w-4 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {result.agenda || result.case.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.case.caseNumber} • {formatDate(result.scheduledAt)}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Documents */}
                {results.documents.length > 0 && (
                  <div className="px-4 py-2 border-t">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Documents ({results.documents.length})
                    </div>
                    {results.documents.map((result, index) => {
                      const globalIndex = results.cases.length + results.hearings.length + results.documents.slice(0, index).length
                      const Icon = getResultIcon('document')
                      return (
                        <div
                          key={result.id}
                          className={`flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleResultClick({ ...result, type: 'document' })}
                        >
                          <Icon className="h-4 w-4 text-purple-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{result.title}</div>
                            <div className="text-xs text-gray-500">
                              {result.case?.caseNumber} • {formatDate(result.createdAt)}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Messages */}
                {results.messages.length > 0 && (
                  <div className="px-4 py-2 border-t">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Messages ({results.messages.length})
                    </div>
                    {results.messages.map((result, index) => {
                      const globalIndex = results.cases.length + results.hearings.length + results.documents.length + results.messages.slice(0, index).length
                      const Icon = getResultIcon('message')
                      return (
                        <div
                          key={result.id}
                          className={`flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleResultClick({ ...result, type: 'message' })}
                        >
                          <Icon className="h-4 w-4 text-orange-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {result.content.substring(0, 50)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.sender.name} • {formatDate(result.createdAt)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div className="px-4 py-2 border-t">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Users ({results.users.length})
                    </div>
                    {results.users.map((result, index) => {
                      const globalIndex = results.cases.length + results.hearings.length + results.documents.length + results.messages.length + results.users.slice(0, index).length
                      const Icon = getResultIcon('user')
                      return (
                        <div
                          key={result.id}
                          className={`flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleResultClick({ ...result, type: 'user' })}
                        >
                          <Icon className="h-4 w-4 text-indigo-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{result.name}</div>
                            <div className="text-xs text-gray-500">{result.email}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.role}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

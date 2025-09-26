"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  PenTool,
  FileImage,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react'

interface Document {
  id: string
  title: string
  description?: string
  fileType: string
  fileSize: number
  fileUrl: string
  isSigned: boolean
  isPublic: boolean
  tags: string[]
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
  case?: {
    id: string
    title: string
    caseNumber: string
  }
  signatures: Array<{
    id: string
    signerName: string
    signerEmail: string
    signedAt: string
  }>
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    caseId: '',
    isPublic: false,
    tags: [] as string[]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (fileTypeFilter) params.append('fileType', fileTypeFilter)
      if (statusFilter) params.append('isSigned', statusFilter)

      const response = await fetch(`/api/documents?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', uploadData.title || selectedFile.name)
      formData.append('description', uploadData.description)
      formData.append('caseId', uploadData.caseId)
      formData.append('isPublic', uploadData.isPublic.toString())
      formData.append('tags', JSON.stringify(uploadData.tags))

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setDocuments([result.document, ...documents])
        setShowUploadModal(false)
        setSelectedFile(null)
        setUploadData({
          title: '',
          description: '',
          caseId: '',
          isPublic: false,
          tags: []
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = document.title
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return FileImage
    if (fileType.includes('video')) return FileVideo
    if (fileType.includes('audio')) return FileAudio
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('zip')) return Archive
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !fileTypeFilter || doc.fileType.includes(fileTypeFilter)
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'signed' && doc.isSigned) ||
                         (statusFilter === 'unsigned' && !doc.isSigned)
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your legal documents and files</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fileType">File Type</Label>
              <select
                id="fileType"
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="signed">Signed</option>
                <option value="unsigned">Unsigned</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchDocuments} variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">Upload your first document to get started</p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          filteredDocuments.map((document) => {
            const FileIcon = getFileIcon(document.fileType)
            return (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {document.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatFileSize(document.fileSize)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {document.isSigned && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {document.isPublic ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {document.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  {document.case && (
                    <Badge variant="outline" className="text-xs mb-3">
                      {document.case.caseNumber}
                    </Badge>
                  )}

                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {!document.isSigned && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Implement signature modal */}}
                        >
                          <PenTool className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {document.signatures.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600 mb-2">Signatures:</p>
                      <div className="space-y-1">
                        {document.signatures.map((signature) => (
                          <div key={signature.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{signature.signerName}</span>
                            <span className="text-gray-500">
                              {new Date(signature.signedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a new document to your case files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Document title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Document description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={uploadData.isPublic}
                  onChange={(e) => setUploadData({ ...uploadData, isPublic: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Make this document public</Label>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

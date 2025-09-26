"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Download, 
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Calendar,
  Users
} from 'lucide-react'

interface Hearing {
  id: string
  caseId: string
  scheduledAt: string
  duration: number
  status: string
  agenda?: string
  roomId: string
  recordingUrl?: string
  transcriptUrl?: string
  summary?: string
  case: {
    id: string
    title: string
    caseNumber: string
    client: { name: string; email: string }
    assignedLawyer?: { name: string; email: string }
  }
  judge?: { name: string; email: string }
}

export default function RecordingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const hearingId = params.id as string

  const [hearing, setHearing] = useState<Hearing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (user && hearingId) {
      fetchHearing()
    }
  }, [user, hearingId])

  const fetchHearing = async () => {
    try {
      const response = await fetch(`/api/hearings/${hearingId}/recording`)
      if (response.ok) {
        const hearingData = await response.json()
        setHearing(hearingData)
      }
    } catch (error) {
      console.error('Failed to fetch hearing recording:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleDownload = () => {
    if (hearing?.recordingUrl) {
      const link = document.createElement('a')
      link.href = hearing.recordingUrl
      link.download = `hearing-${hearing.case.caseNumber}-recording.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadTranscript = () => {
    if (hearing?.transcriptUrl) {
      const link = document.createElement('a')
      link.href = hearing.transcriptUrl
      link.download = `hearing-${hearing.case.caseNumber}-transcript.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Please log in to view recordings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading recording...</h1>
        </div>
      </div>
    )
  }

  if (!hearing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recording Not Found</h1>
          <p className="text-gray-600">The requested recording could not be found.</p>
          <Button 
            onClick={() => router.push('/dashboard/hearings')}
            className="mt-4"
          >
            Back to Hearings
          </Button>
        </div>
      </div>
    )
  }

  if (hearing.status !== 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recording Not Available</h1>
          <p className="text-gray-600">This hearing is not completed yet. Recordings are only available for completed hearings.</p>
          <Button 
            onClick={() => router.push('/dashboard/hearings')}
            className="mt-4"
          >
            Back to Hearings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hearing Recording</h1>
              <p className="text-gray-600">{hearing.case.title}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            Completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Recording
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hearing.recordingUrl ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        className="w-full h-64 lg:h-96 object-cover"
                        controls
                        poster="/api/placeholder/800/450"
                      >
                        <source src={hearing.recordingUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    {/* Custom Controls */}
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMute}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const video = document.querySelector('video')
                            if (video) {
                              video.requestFullscreen()
                            }
                          }}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recording Available</h3>
                    <p className="text-gray-600">
                      This hearing was completed but no recording was saved.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hearing Details */}
            <Card>
              <CardHeader>
                <CardTitle>Hearing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="ml-2 text-sm font-medium">
                    {new Date(hearing.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="ml-2 text-sm font-medium">{hearing.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Case:</span>
                  <span className="ml-2 text-sm font-medium">{hearing.case.caseNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Client</p>
                  <p className="text-sm text-gray-600">{hearing.case.client.name}</p>
                </div>
                {hearing.case.assignedLawyer && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lawyer</p>
                    <p className="text-sm text-gray-600">{hearing.case.assignedLawyer.name}</p>
                  </div>
                )}
                {hearing.judge && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Judge</p>
                    <p className="text-sm text-gray-600">{hearing.judge.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            {hearing.transcriptUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTranscript}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Transcript
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {hearing.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{hearing.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Agenda */}
            {hearing.agenda && (
              <Card>
                <CardHeader>
                  <CardTitle>Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{hearing.agenda}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare, 
  Users,
  Settings,
  Share,
  Download
} from 'lucide-react'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  type: 'text' | 'system'
}

interface Participant {
  userId: string
  name: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
}

export default function HearingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const hearingId = params.id as string

  // Hearing state
  const [hearing, setHearing] = useState<any>(null)
  const [hearingLoading, setHearingLoading] = useState(true)

  // WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const wsRef = useRef<WebSocket | null>(null)

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

  useEffect(() => {
    if (user && hearingId) {
      fetchHearing()
    }

    return () => {
      cleanup()
    }
  }, [user, hearingId])

  const fetchHearing = async () => {
    try {
      const response = await fetch(`/api/hearings/${hearingId}`)
      if (response.ok) {
        const hearingData = await response.json()
        setHearing(hearingData)
        
        // Only initialize video call if hearing is not completed
        if (hearingData.status !== 'COMPLETED') {
          initializeHearing()
        }
      }
    } catch (error) {
      console.error('Failed to fetch hearing:', error)
    } finally {
      setHearingLoading(false)
    }
  }

  const initializeHearing = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize WebSocket connection
      initializeWebSocket()

      // Join the hearing room
      await joinRoom()
    } catch (error) {
      console.error('Error initializing hearing:', error)
    }
  }

  const initializeWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:3000/api/ws/hearing/${hearingId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'participant-joined':
        handleParticipantJoined(data.participant)
        break
      case 'participant-left':
        handleParticipantLeft(data.participantId)
        break
      case 'offer':
        handleOffer(data.offer, data.from)
        break
      case 'answer':
        handleAnswer(data.answer, data.from)
        break
      case 'ice-candidate':
        handleIceCandidate(data.candidate, data.from)
        break
      case 'message':
        setMessages(prev => [...prev, data.message])
        break
      case 'system-message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: data.message,
          senderId: 'system',
          senderName: 'System',
          timestamp: new Date(),
          type: 'system',
        }])
        break
    }
  }

  const joinRoom = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join',
        hearingId,
        userId: user?.id,
        userName: user?.name,
      }))
    }
  }

  const createPeerConnection = (participantId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(rtcConfig)
    peerConnections.current.set(participantId, peerConnection)

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      setRemoteStreams(prev => new Map(prev.set(participantId, remoteStream)))
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          hearingId,
          candidate: event.candidate,
          to: participantId,
        }))
      }
    }

    return peerConnection
  }

  const handleParticipantJoined = async (participant: Participant) => {
    setParticipants(prev => [...prev, participant])
    
    // Create peer connection and send offer
    const peerConnection = createPeerConnection(participant.userId)
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })
    }

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        hearingId,
        offer,
        to: participant.userId,
      }))
    }
  }

  const handleParticipantLeft = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.userId !== participantId))
    setRemoteStreams(prev => {
      const newMap = new Map(prev)
      newMap.delete(participantId)
      return newMap
    })
    
    const peerConnection = peerConnections.current.get(participantId)
    if (peerConnection) {
      peerConnection.close()
      peerConnections.current.delete(participantId)
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    const peerConnection = createPeerConnection(from)
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })
    }

    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        hearingId,
        answer,
        to: from,
      }))
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit, from: string) => {
    const peerConnection = peerConnections.current.get(from)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, from: string) => {
    const peerConnection = peerConnections.current.get(from)
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() && wsRef.current) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: user?.id || '',
        senderName: user?.name || '',
        timestamp: new Date(),
        type: 'text',
      }

      wsRef.current.send(JSON.stringify({
        type: 'message',
        hearingId,
        message,
      }))

      setNewMessage('')
    }
  }

  const leaveHearing = () => {
    cleanup()
    router.push('/dashboard')
  }

  const cleanup = () => {
    // Close peer connections
    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the hearing room.</p>
        </div>
      </div>
    )
  }

  if (hearingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading hearing...</h1>
        </div>
      </div>
    )
  }

  if (hearing?.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hearing Completed</h1>
            <p className="text-gray-600 mb-6">
              This hearing has been completed. The video call session is no longer available.
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                <p><strong>Case:</strong> {hearing.case?.title}</p>
                <p><strong>Scheduled:</strong> {new Date(hearing.scheduledAt).toLocaleString()}</p>
                <p><strong>Duration:</strong> {hearing.duration} minutes</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => router.push('/dashboard/hearings')}
                  className="flex-1"
                >
                  Back to Hearings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/hearing/${hearingId}/recording`)}
                  className="flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  View Recording
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-screen">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Hearing Room - {hearingId}</h1>
              <p className="text-sm text-gray-300">
                {participants.length + 1} participants • {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <Button variant="outline" size="sm" onClick={leaveHearing}>
                <Phone className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>

              {/* Remote Videos */}
              {Array.from(remoteStreams.entries()).map(([participantId, stream]) => {
                const participant = participants.find(p => p.userId === participantId)
                return (
                  <div key={participantId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={(el) => {
                        if (el) {
                          remoteVideoRefs.current.set(participantId, el)
                          el.srcObject = stream
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {participant?.name || 'Unknown'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
            <Button
              variant={isAudioEnabled ? 'default' : 'destructive'}
              size="sm"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoEnabled ? 'default' : 'destructive'}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded ${
                  message.type === 'system'
                    ? 'bg-gray-100 text-gray-600 text-sm'
                    : message.senderId === user.id
                    ? 'bg-blue-100 ml-8'
                    : 'bg-gray-100 mr-8'
                }`}
              >
                {message.type !== 'system' && (
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {message.senderName}
                  </div>
                )}
                <div>{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

// In-memory store for WebRTC signaling (in production, use Redis)
const signalingStore = new Map<string, {
  roomId: string
  participants: Map<string, {
    userId: string
    socketId: string
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    iceCandidates: RTCIceCandidateInit[]
  }>
}>()

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.CLIENT, UserRole.LAWYER, UserRole.JUDGE])(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const body = await request.json()
    const { action, roomId, data } = body

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Initialize room if it doesn't exist
    if (!signalingStore.has(roomId)) {
      signalingStore.set(roomId, {
        roomId,
        participants: new Map(),
      })
    }

    const room = signalingStore.get(roomId)!
    const participantId = user.id

    switch (action) {
      case 'join':
        // Add participant to room
        room.participants.set(participantId, {
          userId: user.id,
          socketId: data.socketId || `socket-${Date.now()}`,
          iceCandidates: [],
        })

        return NextResponse.json({
          success: true,
          participants: Array.from(room.participants.values()).map(p => ({
            userId: p.userId,
            socketId: p.socketId,
          })),
        })

      case 'offer':
        // Store offer and notify other participants
        const offerParticipant = room.participants.get(participantId)
        if (offerParticipant) {
          offerParticipant.offer = data.offer
        }

        return NextResponse.json({
          success: true,
          action: 'offer',
          from: participantId,
          offer: data.offer,
        })

      case 'answer':
        // Store answer
        const answerParticipant = room.participants.get(participantId)
        if (answerParticipant) {
          answerParticipant.answer = data.answer
        }

        return NextResponse.json({
          success: true,
          action: 'answer',
          from: participantId,
          answer: data.answer,
        })

      case 'ice-candidate':
        // Store ICE candidate
        const candidateParticipant = room.participants.get(participantId)
        if (candidateParticipant) {
          candidateParticipant.iceCandidates.push(data.candidate)
        }

        return NextResponse.json({
          success: true,
          action: 'ice-candidate',
          from: participantId,
          candidate: data.candidate,
        })

      case 'leave':
        // Remove participant from room
        room.participants.delete(participantId)
        
        // Clean up empty rooms
        if (room.participants.size === 0) {
          signalingStore.delete(roomId)
        }

        return NextResponse.json({
          success: true,
          action: 'leave',
          from: participantId,
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Signaling error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.CLIENT, UserRole.LAWYER, UserRole.JUDGE])(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const room = signalingStore.get(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      roomId: room.roomId,
      participants: Array.from(room.participants.values()).map(p => ({
        userId: p.userId,
        socketId: p.socketId,
      })),
    })
  } catch (error) {
    console.error('Error fetching room info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

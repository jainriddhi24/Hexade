import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NotificationService } from '@/lib/email'

const createHearingSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  duration: z.number().min(15).max(480).default(60), // 15 minutes to 8 hours
  agenda: z.string().optional(),
  judgeId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const caseId = searchParams.get('caseId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on user role
    let whereClause: any = {}
    
    if (user.role === 'CLIENT') {
      whereClause.case = { clientId: user.id }
    } else if (user.role === 'LAWYER') {
      whereClause.case = { assignedLawyerId: user.id }
    } else if (user.role === 'JUDGE') {
      whereClause.judgeId = user.id
    } else if (user.role === 'ADMIN') {
      // Admin can see all hearings
      whereClause = {}
    }

    if (status) {
      whereClause.status = status
    }

    if (caseId) {
      whereClause.caseId = caseId
    }

    // First, update hearings that are scheduled before current date to COMPLETED
    const currentDate = new Date()
    await prisma.hearing.updateMany({
      where: {
        ...whereClause,
        status: 'SCHEDULED',
        scheduledAt: {
          lt: currentDate
        }
      },
      data: {
        status: 'COMPLETED'
      }
    })

    const [hearings, total] = await Promise.all([
      prisma.hearing.findMany({
        where: whereClause,
        include: {
          case: {
            select: { 
              id: true, 
              title: true, 
              caseNumber: true,
              client: { select: { id: true, name: true, email: true } },
              assignedLawyer: { select: { id: true, name: true, email: true } }
            }
          },
          judge: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            select: { id: true, content: true, senderId: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.hearing.count({ where: whereClause })
    ])

    return NextResponse.json({
      hearings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get hearings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseId, scheduledAt, duration, agenda, judgeId } = createHearingSchema.parse(body)

    // Check if case exists and user has access
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedLawyer: { select: { id: true, name: true, email: true } }
      }
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check permissions
    const canSchedule = 
      caseData.clientId === user.id || 
      caseData.assignedLawyerId === user.id || 
      user.role === 'JUDGE' || 
      user.role === 'ADMIN'

    if (!canSchedule) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate unique room ID
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create the hearing
    const newHearing = await prisma.hearing.create({
      data: {
        caseId,
        scheduledAt: new Date(scheduledAt),
        duration,
        agenda,
        judgeId: judgeId || (user.role === 'JUDGE' ? user.id : null),
        roomId,
        status: 'SCHEDULED'
      },
      include: {
        case: {
          select: { 
            id: true, 
            title: true, 
            caseNumber: true,
            client: { select: { id: true, name: true, email: true } },
            assignedLawyer: { select: { id: true, name: true, email: true } }
          }
        },
        judge: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Update case status if needed
    if (caseData.status === 'FILED' || caseData.status === 'ASSIGNED') {
      await prisma.case.update({
        where: { id: caseId },
        data: { status: 'HEARING_SCHEDULED' }
      })
    }

    // Send notification emails
    try {
      const recipients = []
      
      // Add client to recipients
      if (caseData.client) {
        recipients.push(caseData.client.email)
      }
      
      // Add lawyer to recipients if assigned
      if (caseData.assignedLawyer) {
        recipients.push(caseData.assignedLawyer.email)
      }

      // Add judge to recipients if assigned
      if (newHearing.judge) {
        recipients.push(newHearing.judge.email)
      }

      if (recipients.length > 0) {
        const participants = []
        if (caseData.client) participants.push(caseData.client.name)
        if (caseData.assignedLawyer) participants.push(caseData.assignedLawyer.name)
        if (newHearing.judge) participants.push(newHearing.judge.name)

        await NotificationService.sendHearingScheduledNotification(
          {
            title: newHearing.case.title,
            scheduledDate: new Date(newHearing.scheduledAt).toLocaleString(),
            participants
          },
          recipients
        )
      }
    } catch (error) {
      console.error('Failed to send hearing notification:', error)
      // Don't fail hearing creation if notification fails
    }

    return NextResponse.json(newHearing, { status: 201 })
  } catch (error) {
    console.error('Create hearing error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

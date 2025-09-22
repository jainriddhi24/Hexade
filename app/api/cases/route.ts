import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NotificationService } from '@/lib/email'

const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  caseType: z.string().min(1, 'Case type is required'),
  clientId: z.string().optional(), // For lawyers creating cases
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  tags: z.array(z.string()).default([]),
  hearingDate: z.string().optional(),
  estimatedValue: z.number().optional().default(0),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on user role
    let whereClause: any = {}
    
    if (user.role === 'CLIENT') {
      whereClause.clientId = user.id
      console.log('Client fetching cases for user ID:', user.id)
    } else if (user.role === 'LAWYER') {
      // Lawyers can see cases where they are assigned OR where they are the client
      whereClause = {
        OR: [
          { assignedLawyerId: user.id },
          { clientId: user.id }
        ]
      }
      console.log('Lawyer fetching cases for user ID:', user.id, 'where clause:', JSON.stringify(whereClause))
    } else if (user.role === 'JUDGE') {
      // Judges can see all cases
      whereClause = {}
      console.log('Judge fetching all cases')
    }

    if (status) {
      if (user.role === 'LAWYER' && whereClause.OR) {
        // Add status filter to each OR condition
        whereClause.OR = whereClause.OR.map((condition: any) => ({
          ...condition,
          status: status
        }))
      } else {
        whereClause.status = status
      }
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: whereClause,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          assignedLawyer: {
            select: { id: true, name: true, email: true }
          },
          hearings: {
            select: { id: true, scheduledAt: true, status: true }
          },
          documents: {
            select: { id: true, title: true, documentType: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.case.count({ where: whereClause })
    ])

    // Parse tags from JSON string to array for each case
    const casesWithParsedTags = cases.map(caseItem => ({
      ...caseItem,
      tags: caseItem.tags ? JSON.parse(caseItem.tags) : []
    }))

    console.log(`Found ${cases.length} cases for user ${user.id} (${user.role}):`, 
      casesWithParsedTags.map(c => ({ id: c.id, title: c.title, clientId: c.clientId, assignedLawyerId: c.assignedLawyerId })))

    return NextResponse.json({
      cases: casesWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get cases error:', error)
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
    const { title, description, caseType, clientId, priority, tags, hearingDate, estimatedValue } = createCaseSchema.parse(body)

    // Determine client ID based on user role
    let finalClientId = clientId
    if (user.role === 'CLIENT') {
      finalClientId = user.id
    } else if (user.role === 'LAWYER' && !clientId) {
      return NextResponse.json(
        { error: 'Client ID is required for lawyers' },
        { status: 400 }
      )
    }

    // Generate case number if not provided
    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        caseType,
        clientId: finalClientId!,
        assignedLawyerId: user.role === 'LAWYER' ? user.id : null,
        priority,
        tags: JSON.stringify(tags),
        status: 'FILED',
        caseNumber,
        hearingDate: hearingDate ? new Date(hearingDate) : null,
        estimatedValue: estimatedValue || 0
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        assignedLawyer: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    console.log('Case created successfully:', {
      id: newCase.id,
      title: newCase.title,
      clientId: newCase.clientId,
      assignedLawyerId: newCase.assignedLawyerId,
      caseNumber: newCase.caseNumber
    })

    // Send notification emails
    try {
      const recipients = []
      
      // Add client to recipients
      if (newCase.client) {
        recipients.push(newCase.client.email)
      }
      
      // Add lawyer to recipients if assigned
      if (newCase.assignedLawyer) {
        recipients.push(newCase.assignedLawyer.email)
      }

      if (recipients.length > 0) {
        await NotificationService.sendCaseCreatedNotification(
          {
            title: newCase.title,
            id: newCase.id,
            clientName: newCase.client?.name || 'Unknown'
          },
          recipients
        )
      }
    } catch (error) {
      console.error('Failed to send case creation notification:', error)
      // Don't fail case creation if notification fails
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error('Create case error:', error)
    
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
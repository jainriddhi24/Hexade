import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const updateHearingSchema = z.object({
  scheduledAt: z.string().datetime('Invalid date format').optional(),
  duration: z.number().min(15).max(480).optional(),
  agenda: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']).optional(),
  judgeId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: hearingId } = await params

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: {
          include: {
            client: { select: { id: true, name: true, email: true, phone: true } },
            assignedLawyer: { select: { id: true, name: true, email: true, phone: true } }
          }
        },
        judge: {
          select: { id: true, name: true, email: true, phone: true }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }

    // Check if user has access to this hearing
    const hasAccess = 
      hearing.case.clientId === user.id || 
      hearing.case.assignedLawyerId === user.id || 
      hearing.judgeId === user.id ||
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update hearing status to COMPLETED if scheduled before current date
    const currentDate = new Date()
    if (hearing.status === 'SCHEDULED' && hearing.scheduledAt < currentDate) {
      const updatedHearing = await prisma.hearing.update({
        where: { id: hearingId },
        data: { status: 'COMPLETED' },
        include: {
          case: {
            include: {
              client: { select: { id: true, name: true, email: true, phone: true } },
              assignedLawyer: { select: { id: true, name: true, email: true, phone: true } }
            }
          },
          judge: {
            select: { id: true, name: true, email: true, phone: true }
          },
          messages: {
            include: {
              sender: {
                select: { id: true, name: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })
      return NextResponse.json(updatedHearing)
    }

    return NextResponse.json(hearing)
  } catch (error) {
    console.error('Get hearing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: hearingId } = await params
    const body = await request.json()
    const updateData = updateHearingSchema.parse(body)

    // Check if hearing exists and user has access
    const existingHearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: {
          include: {
            client: { select: { id: true, name: true, email: true } },
            assignedLawyer: { select: { id: true, name: true, email: true } }
          }
        },
        judge: { select: { id: true, name: true, email: true } }
      }
    })

    if (!existingHearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }

    // Check permissions
    const canEdit = 
      existingHearing.case.clientId === user.id || 
      existingHearing.case.assignedLawyerId === user.id || 
      existingHearing.judgeId === user.id ||
      user.role === 'ADMIN'

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updatePayload: any = { ...updateData }
    if (updateData.scheduledAt) {
      updatePayload.scheduledAt = new Date(updateData.scheduledAt)
    }

    // Update the hearing
    const updatedHearing = await prisma.hearing.update({
      where: { id: hearingId },
      data: updatePayload,
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

    return NextResponse.json(updatedHearing)
  } catch (error) {
    console.error('Update hearing error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: hearingId } = await params

    // Check if hearing exists and user has access
    const existingHearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: true
      }
    })

    if (!existingHearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }

    // Check permissions
    const canDelete = 
      existingHearing.case.clientId === user.id || 
      existingHearing.case.assignedLawyerId === user.id || 
      existingHearing.judgeId === user.id ||
      user.role === 'ADMIN'

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the hearing
    await prisma.hearing.delete({
      where: { id: hearingId }
    })

    // Update case status if needed
    if (existingHearing.case.status === 'HEARING_SCHEDULED') {
      await prisma.case.update({
        where: { id: existingHearing.caseId },
        data: { status: 'IN_PROGRESS' }
      })
    }

    return NextResponse.json({ message: 'Hearing deleted successfully' })
  } catch (error) {
    console.error('Delete hearing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

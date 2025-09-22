import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NotificationService } from '@/lib/email'

const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  caseType: z.string().min(1, 'Case type is required').optional(),
  status: z.enum(['FILED', 'ASSIGNED', 'IN_PROGRESS', 'HEARING_SCHEDULED', 'COMPLETED', 'CLOSED']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  assignedLawyerId: z.string().optional(),
  estimatedValue: z.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseId = params.id

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedLawyer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        hearings: {
          include: {
            judge: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { scheduledAt: 'desc' }
        },
        documents: {
          include: {
            uploadedBy: {
              select: { id: true, name: true }
            },
            signedBy: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check if user has access to this case
    const hasAccess = 
      caseData.clientId === user.id || 
      caseData.assignedLawyerId === user.id || 
      user.role === 'JUDGE' || 
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse tags from JSON string
    const caseWithParsedTags = {
      ...caseData,
      tags: caseData.tags ? JSON.parse(caseData.tags) : []
    }

    return NextResponse.json(caseWithParsedTags)
  } catch (error) {
    console.error('Get case error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseId = params.id
    const body = await request.json()
    const updateData = updateCaseSchema.parse(body)

    // Check if case exists and user has access
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedLawyer: { select: { id: true, name: true, email: true } }
      }
    })

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check permissions
    const canEdit = 
      existingCase.clientId === user.id || 
      existingCase.assignedLawyerId === user.id || 
      user.role === 'JUDGE' || 
      user.role === 'ADMIN'

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updatePayload: any = { ...updateData }
    if (updateData.tags) {
      updatePayload.tags = JSON.stringify(updateData.tags)
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: updatePayload,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        assignedLawyer: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Parse tags for response
    const caseWithParsedTags = {
      ...updatedCase,
      tags: updatedCase.tags ? JSON.parse(updatedCase.tags) : []
    }

    return NextResponse.json(caseWithParsedTags)
  } catch (error) {
    console.error('Update case error:', error)
    
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseId = params.id

    // Check if case exists and user has access
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    })

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check permissions - only clients, assigned lawyers, judges, and admins can delete
    const canDelete = 
      existingCase.clientId === user.id || 
      existingCase.assignedLawyerId === user.id || 
      user.role === 'JUDGE' || 
      user.role === 'ADMIN'

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the case (this will cascade delete related hearings and documents)
    await prisma.case.delete({
      where: { id: caseId }
    })

    return NextResponse.json({ message: 'Case deleted successfully' })
  } catch (error) {
    console.error('Delete case error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

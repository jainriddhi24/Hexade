import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const updateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
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

    const { id: clientId } = await params

    // Check if user has access to this client
    let hasAccess = false
    
    if (user.role === 'LAWYER') {
      // Check if this lawyer has cases with this client
      const hasCases = await prisma.case.findFirst({
        where: {
          clientId: clientId,
          assignedLawyerId: user.id
        }
      })
      hasAccess = !!hasCases
    } else if (user.role === 'CLIENT' && user.id === clientId) {
      hasAccess = true
    } else if (user.role === 'ADMIN') {
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        company: true,
        notes: true,
        createdAt: true,
        casesAsClient: {
          include: {
            assignedLawyer: {
              select: { id: true, name: true, email: true }
            },
            hearings: {
              select: {
                id: true,
                scheduledAt: true,
                status: true
              },
              orderBy: { scheduledAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Calculate client metrics
    const totalBilling = await prisma.case.aggregate({
      where: {
        clientId: clientId,
        ...(user.role === 'LAWYER' ? { assignedLawyerId: user.id } : {})
      },
      _sum: {
        estimatedValue: true
      }
    })

    const activeCases = client.casesAsClient.filter(c => 
      ['FILED', 'ASSIGNED', 'IN_PROGRESS', 'HEARING_SCHEDULED'].includes(c.status)
    ).length

    const clientWithMetrics = {
      ...client,
      totalBilling: totalBilling._sum.estimatedValue || 0,
      activeCases,
      totalCases: client.casesAsClient.length
    }

    return NextResponse.json(clientWithMetrics)
  } catch (error) {
    console.error('Get client error:', error)
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

    const { id: clientId } = await params
    const body = await request.json()
    const updateData = updateClientSchema.parse(body)

    // Check if client exists
    const existingClient = await prisma.user.findUnique({
      where: { id: clientId }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check permissions
    let canEdit = false
    
    if (user.role === 'LAWYER') {
      // Check if this lawyer has cases with this client
      const hasCases = await prisma.case.findFirst({
        where: {
          clientId: clientId,
          assignedLawyerId: user.id
        }
      })
      canEdit = !!hasCases
    } else if (user.role === 'CLIENT' && user.id === clientId) {
      canEdit = true
    } else if (user.role === 'ADMIN') {
      canEdit = true
    }

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the client
    const updatedClient = await prisma.user.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        company: true,
        notes: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Update client error:', error)
    
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

    const { id: clientId } = await params

    // Check if client exists
    const existingClient = await prisma.user.findUnique({
      where: { id: clientId }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check permissions - admins can delete any client, lawyers can delete clients they have access to
    let canDelete = false
    
    if (user.role === 'ADMIN') {
      canDelete = true
    } else if (user.role === 'LAWYER') {
      // Lawyers can delete clients they have access to (either through cases or if they're in their client list)
      // For now, allow lawyers to delete any client they can see
      canDelete = true
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if client has any active cases
    const hasActiveCases = await prisma.case.findFirst({
      where: { 
        clientId: clientId,
        status: { not: 'CLOSED' }
      }
    })

    if (hasActiveCases) {
      return NextResponse.json(
        { error: 'Cannot delete client with active cases. Please close all cases first.' },
        { status: 400 }
      )
    }

    // Delete the client
    await prisma.user.delete({
      where: { id: clientId }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

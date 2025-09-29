import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'cases', 'hearings', 'documents', 'messages', 'users']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const searchData = searchSchema.parse({
      query,
      type,
      limit,
      offset,
    })

    const results: any = {
      cases: [],
      hearings: [],
      documents: [],
      messages: [],
      users: [],
      total: 0,
    }

    // Build search conditions based on user role
    const caseWhere = user.role === 'CLIENT' 
      ? { clientId: user.id }
      : user.role === 'LAWYER'
      ? { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] }
      : {}

    const hearingWhere = user.role === 'CLIENT'
      ? { case: { clientId: user.id } }
      : user.role === 'LAWYER'
      ? { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } }
      : {}

    const documentWhere = user.role === 'CLIENT'
      ? { case: { clientId: user.id } }
      : user.role === 'LAWYER'
      ? { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } }
      : {}

    const messageWhere = user.role === 'CLIENT'
      ? { OR: [{ senderId: user.id }, { hearing: { case: { clientId: user.id } } }] }
      : user.role === 'LAWYER'
      ? { OR: [{ senderId: user.id }, { hearing: { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } } }] }
      : {}

    // Search cases
    if (searchData.type === 'all' || searchData.type === 'cases') {
      const cases = await prisma.case.findMany({
        where: {
          ...caseWhere,
          OR: [
            { title: { contains: searchData.query } },
            { caseNumber: { contains: searchData.query } },
            { description: { contains: searchData.query } },
            { tags: { contains: searchData.query } },
          ],
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          assignedLawyer: { select: { id: true, name: true, email: true } },
        },
        take: searchData.limit,
        skip: searchData.offset,
        orderBy: { updatedAt: 'desc' },
      })
      results.cases = cases
    }

    // Search hearings
    if (searchData.type === 'all' || searchData.type === 'hearings') {
      const hearings = await prisma.hearing.findMany({
        where: {
          ...hearingWhere,
          OR: [
            { agenda: { contains: searchData.query } },
            { case: { title: { contains: searchData.query } } },
            { case: { caseNumber: { contains: searchData.query } } },
          ],
        },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
              client: { select: { id: true, name: true, email: true } },
              assignedLawyer: { select: { id: true, name: true, email: true } },
            },
          },
          judge: { select: { id: true, name: true, email: true } },
        },
        take: searchData.limit,
        skip: searchData.offset,
        orderBy: { scheduledAt: 'desc' },
      })
      results.hearings = hearings
    }

    // Search documents
    if (searchData.type === 'all' || searchData.type === 'documents') {
      const documents = await prisma.document.findMany({
        where: {
          ...documentWhere,
          OR: [
            { title: { contains: searchData.query } },
            { description: { contains: searchData.query } },
            { case: { title: { contains: searchData.query } } },
            { case: { caseNumber: { contains: searchData.query } } },
          ],
        },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
            },
          },
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
        take: searchData.limit,
        skip: searchData.offset,
        orderBy: { createdAt: 'desc' },
      })
      results.documents = documents
    }

    // Search messages
    if (searchData.type === 'all' || searchData.type === 'messages') {
      const messages = await prisma.message.findMany({
        where: {
          ...messageWhere,
          OR: [
            { content: { contains: searchData.query } },
            { sender: { name: { contains: searchData.query } } },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          hearing: {
            select: {
              id: true,
              case: {
                select: {
                  id: true,
                  title: true,
                  caseNumber: true,
                },
              },
            },
          },
        },
        take: searchData.limit,
        skip: searchData.offset,
        orderBy: { createdAt: 'desc' },
      })
      results.messages = messages
    }

    // Search users (only for lawyers and admins)
    if ((searchData.type === 'all' || searchData.type === 'users') && 
        (user.role === 'LAWYER' || user.role === 'ADMIN')) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchData.query } },
            { email: { contains: searchData.query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
        },
        take: searchData.limit,
        skip: searchData.offset,
        orderBy: { name: 'asc' },
      })
      results.users = users
    }

    // Calculate total results
    results.total = results.cases.length + results.hearings.length + 
                   results.documents.length + results.messages.length + results.users.length

    return NextResponse.json({
      success: true,
      results,
      query: searchData.query,
      type: searchData.type,
      pagination: {
        limit: searchData.limit,
        offset: searchData.offset,
        total: results.total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
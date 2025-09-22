import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { z } from 'zod'

// Fallback local enum-like values to avoid TS errors while Prisma client/enums are missing.
// Once you regenerate Prisma Client (recommended) you can revert to importing enums from @prisma/client.
export const UserRole = {
  CLIENT: 'CLIENT',
  LAWYER: 'LAWYER',
  JUDGE: 'JUDGE',
  ADMIN: 'ADMIN',
} as const
type UserRoleType = typeof UserRole[keyof typeof UserRole]

// NOTE: We use a string for documentType in the schema (safer until Prisma enum is available)
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  documentType: z.string().optional(),
  caseId: z.string().min(1, 'Case ID is required'),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
})
type CreateDocumentData = z.infer<typeof createDocumentSchema>

const querySchema = z.object({
  caseId: z.string().optional(),
  documentType: z.string().optional(),
  uploadedById: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.CLIENT, UserRole.LAWYER, UserRole.JUDGE, UserRole.ADMIN])(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      caseId: searchParams.get('caseId'),
      documentType: searchParams.get('documentType'),
      uploadedById: searchParams.get('uploadedById'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (query.caseId) {
      where.caseId = query.caseId
    }

    if (query.documentType) {
      where.documentType = query.documentType
    }

    if (query.uploadedById) {
      where.uploadedById = query.uploadedById
    }

    // Role-based access control
    if (user.role === UserRole.CLIENT) {
      // Clients can only see documents from their cases
      where.case = {
        clientId: user.id,
      }
    } else if (user.role === UserRole.LAWYER) {
      // Lawyers can see documents from their assigned cases
      where.case = {
        OR: [
          { assignedLawyerId: user.id },
          { clientId: user.id }, // If they're also a client
        ],
      }
    }
    // JUDGE and ADMIN can see all documents

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          signedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.CLIENT, UserRole.LAWYER, UserRole.ADMIN])(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const body = await request.json()
    const data = createDocumentSchema.parse(body) as CreateDocumentData

    // Verify case access
    const caseRecord = await prisma.case.findUnique({
      where: { id: data.caseId },
    })

    if (!caseRecord) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this case
    if (user.role === UserRole.CLIENT && caseRecord.clientId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (user.role === UserRole.LAWYER && caseRecord.assignedLawyerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate file key
    const timestamp = Date.now()
    const safeTitle = (data.title || 'file').replace(/[^a-zA-Z0-9]/g, '-')
    const fileKey = `documents/case-${data.caseId}/${timestamp}-${safeTitle}`

    // Create document record (simplified for demo)
    const document = await prisma.document.create({
      data: {
        ...data,
        s3Key: fileKey,
        s3Url: `https://storage.example.com/${fileKey}`,
        uploadedById: user.id,
      } as any, // 'as any' here because Prisma types and zod types might differ slightly
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      document,
      message: 'Document created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    
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

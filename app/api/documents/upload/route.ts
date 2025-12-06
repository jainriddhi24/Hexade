import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { uploadDocument, getSignedUrl } from '@/lib/s3'
import { z } from 'zod'

const uploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  caseId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isPublic = formData.get('isPublic') === 'true'
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP' 
      }, { status: 400 })
    }

    // Upload to S3
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await uploadDocument(fileBuffer, {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: user.id,
      caseId: caseId || undefined,
    })

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        description,
        s3Url: uploadResult.url!,
        s3Key: uploadResult.key!,
        mimeType: file.type,
        fileSize: file.size,
        caseId: caseId!,
        uploadedById: user.id,
        documentType: 'GENERAL',
      },
      include: {
        case: {
          select: { id: true, title: true, caseNumber: true }
        },
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      document,
      message: 'File uploaded successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

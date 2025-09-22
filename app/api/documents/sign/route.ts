import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { addSignatureToDocument } from '@/lib/s3'
import { z } from 'zod'

const signatureSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  signerName: z.string().min(1, 'Signer name is required'),
  signerEmail: z.string().email('Valid email is required'),
  signatureData: z.string().min(1, 'Signature data is required'),
  signatureType: z.enum(['draw', 'type', 'upload']).optional().default('draw'),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = signatureSchema.parse(body)

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: data.documentId },
      include: { 
        case: true,
        signatures: true
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions
    if (user.role === 'CLIENT' && document.case?.clientId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (user.role === 'LAWYER' && document.case?.assignedLawyerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if already signed by this user
    const existingSignature = document.signatures.find(sig => sig.signerId === user.id)
    if (existingSignature) {
      return NextResponse.json({ error: 'Document already signed by you' }, { status: 400 })
    }

    // Add signature to document
    const signatureResult = await addSignatureToDocument({
      signerName: data.signerName,
      signerEmail: data.signerEmail,
      signatureData: data.signatureData,
      documentKey: document.s3Key || '',
      caseId: document.caseId || '',
    })

    if (!signatureResult.success) {
      return NextResponse.json({ error: signatureResult.error }, { status: 500 })
    }

    // Save signature record
    const signature = await prisma.documentSignature.create({
      data: {
        documentId: data.documentId,
        signerId: user.id,
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        signatureData: data.signatureData,
        signatureType: data.signatureType,
        reason: data.reason,
        signedAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    // Update document as signed
    await prisma.document.update({
      where: { id: data.documentId },
      data: { 
        isSigned: true,
        signedDocumentUrl: signatureResult.url,
        signedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      signature,
      signedDocumentUrl: signatureResult.url,
      message: 'Document signed successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('E-signature error:', error)
    return NextResponse.json(
      { error: 'E-signature failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Get document signatures
    const signatures = await prisma.documentSignature.findMany({
      where: { documentId },
      include: {
        signer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { signedAt: 'desc' }
    })

    return NextResponse.json({ signatures })
  } catch (error) {
    console.error('Get signatures error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    )
  }
}

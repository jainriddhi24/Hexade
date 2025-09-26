import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createPaymentIntent } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const paymentIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('usd'),
  caseId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = paymentIntentSchema.parse(body)

    // Verify case access if caseId is provided
    if (data.caseId) {
      const caseRecord = await prisma.case.findUnique({
        where: { id: data.caseId },
      })

      if (!caseRecord) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
      }

      if (user.role === 'CLIENT' && caseRecord.clientId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Create payment intent
    const result = await createPaymentIntent({
      amount: data.amount * 100, // Convert to cents
      currency: data.currency,
      caseId: data.caseId,
      clientId: user.id,
      description: data.description,
      metadata: data.metadata,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        caseId: data.caseId,
        clientId: user.id,
        stripePaymentIntentId: result.paymentIntentId!,
        status: 'PENDING',
        metadata: data.metadata,
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentId: payment.id,
      paymentIntentId: result.paymentIntentId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

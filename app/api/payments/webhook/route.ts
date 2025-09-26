import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    const result = verifyWebhookSignature(body, signature)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const event = result.event as Stripe.Event

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { 
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })

        // Create invoice if needed
        if (paymentIntent.metadata.caseId) {
          await prisma.invoice.create({
            data: {
              caseId: paymentIntent.metadata.caseId,
              clientId: paymentIntent.metadata.clientId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'PAID',
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntent.id,
            },
          })
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { 
            status: 'FAILED',
            failedAt: new Date(),
          },
        })

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { 
              status: 'ACTIVE',
              currentPeriodEnd: new Date(invoice.period_end * 1000),
            },
          })
        }

        console.log('Invoice payment succeeded:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { 
              status: 'PAST_DUE',
            },
          })
        }

        console.log('Invoice payment failed:', invoice.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { 
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        })

        console.log('Subscription cancelled:', subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

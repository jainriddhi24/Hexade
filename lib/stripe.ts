import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export interface PaymentIntentData {
  amount: number
  currency: string
  caseId?: string
  clientId: string
  description: string
  metadata?: Record<string, string>
}

export interface SubscriptionData {
  priceId: string
  clientId: string
  caseId?: string
  metadata?: Record<string, string>
}

export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        clientId: data.clientId,
        caseId: data.caseId || '',
        ...data.metadata,
      },
      description: data.description,
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment creation failed',
    }
  }
}

export async function createSubscription(data: SubscriptionData) {
  try {
    // Create customer if not exists
    const customer = await stripe.customers.create({
      metadata: {
        clientId: data.clientId,
        caseId: data.caseId || '',
      },
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: data.priceId }],
      metadata: {
        clientId: data.clientId,
        caseId: data.caseId || '',
        ...data.metadata,
      },
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent?.client_secret,
    }
  } catch (error) {
    console.error('Stripe subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Subscription creation failed',
    }
  }
}

export async function createCheckoutSession(data: {
  priceId: string
  clientId: string
  caseId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        clientId: data.clientId,
        caseId: data.caseId || '',
        ...data.metadata,
      },
    })

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout session creation failed',
    }
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    console.error('Stripe get payment intent error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    }
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error('Stripe get subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve subscription',
    }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error('Stripe cancel subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    return { success: true, event }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
    }
  }
}

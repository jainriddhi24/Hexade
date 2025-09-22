import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Expecting: { amount, currency, clientId, description, caseId, metadata }
    const { createPaymentIntent } = await import('@/lib/stripe');
    const result = await createPaymentIntent(body);
    if (result.success) {
      return NextResponse.json({ clientSecret: result.clientSecret, paymentIntentId: result.paymentIntentId });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}

export async function GET() {
  // Get payment history
  return NextResponse.json({
    payments: [
      {
        id: 'pay_1234567890',
        amount: 99.99,
        currency: 'USD',
        description: 'Monthly Subscription',
        status: 'completed',
        date: '2024-01-15'
      },
      {
        id: 'pay_1234567891',
        amount: 199.99,
        currency: 'USD', 
        description: 'AI Analysis Package',
        status: 'completed',
        date: '2024-01-10'
      }
    ]
  })
}

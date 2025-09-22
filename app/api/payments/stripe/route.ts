import { NextRequest, NextResponse } from 'next/server'

// Mock Stripe integration - In production, use real Stripe SDK
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key'

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'USD', 
      description, 
      userId, 
      userRole,
      paymentType = 'subscription', // 'subscription', 'one_time', 'hourly'
      duration = null, // for hourly billing
      billingCycle = 'monthly' // 'monthly', 'yearly', 'hourly'
    } = await request.json()

    // Calculate actual amount based on role and billing type
    let finalAmount = amount
    let billingDescription = description

    // Role-based pricing
    const rolePricing = {
      'JUDGE': {
        subscription: 299.99,
        hourly: 500.00,
        ai_package: 399.99
      },
      'LAWYER': {
        subscription: 99.99,
        hourly: 200.00,
        ai_package: 199.99
      },
      'CLIENT': {
        consultation: 150.00,
        hourly: 100.00,
        ai_analysis: 99.99
      }
    }

    // Calculate billing based on type
    if (paymentType === 'hourly' && duration) {
      const hourlyRate = rolePricing[userRole as keyof typeof rolePricing]?.hourly || 100
      finalAmount = hourlyRate * duration
      billingDescription = `${description} (${duration} hours @ $${hourlyRate}/hour)`
    } else if (paymentType === 'subscription') {
      finalAmount = rolePricing[userRole as keyof typeof rolePricing]?.subscription || 99.99
      if (billingCycle === 'yearly') {
        finalAmount = finalAmount * 12 * 0.8 // 20% discount for yearly
        billingDescription = `${description} (Annual - 20% off)`
      } else {
        billingDescription = `${description} (Monthly)`
      }
    } else if (paymentType === 'ai_package') {
      finalAmount = rolePricing[userRole as keyof typeof rolePricing]?.ai_package || 199.99
    }

    // Mock Stripe payment processing
    console.log('💳 STRIPE PAYMENT PROCESSING:')
    console.log(`User Role: ${userRole}`)
    console.log(`Payment Type: ${paymentType}`)
    console.log(`Billing Cycle: ${billingCycle}`)
    console.log(`Duration: ${duration} hours`)
    console.log(`Original Amount: $${amount}`)
    console.log(`Final Amount: $${finalAmount}`)
    console.log(`Description: ${billingDescription}`)
    console.log(`Currency: ${currency}`)

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock successful payment
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      status: 'succeeded',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    }

    // Calculate next billing date
    let nextBillingDate = null
    if (paymentType === 'subscription') {
      const now = new Date()
      if (billingCycle === 'yearly') {
        nextBillingDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      } else {
        nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment processed successfully!',
      payment: {
        id: paymentIntent.id,
        amount: finalAmount,
        currency: currency.toUpperCase(),
        description: billingDescription,
        status: paymentIntent.status,
        nextBillingDate,
        billingCycle,
        paymentType,
        duration
      }
    })
  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Payment failed. Please try again.' },
      { status: 500 }
    )
  }
}

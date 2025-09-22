import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, from = 'noreply@hexade.com' } = await request.json()

    // Simulate email sending (in production, use a service like SendGrid, Nodemailer, etc.)
    console.log('📧 Email would be sent:')
    console.log(`From: ${from}`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Message: ${message}`)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully!',
      emailId: `email_${Date.now()}`
    })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    )
  }
}

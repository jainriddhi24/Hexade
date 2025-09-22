import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Test Email from Hexade Portal</h1>
          <p>This is a test email to verify email functionality.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If you received this email, the email system is working correctly!</p>
          <p>Best regards,<br>The Hexade Team</p>
        </div>
      `,
      text: `Test Email from Hexade Portal\n\nMessage: ${message}\nSent at: ${new Date().toLocaleString()}\n\nIf you received this email, the email system is working correctly!`
    })

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}

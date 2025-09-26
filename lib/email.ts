import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter for email sending
const createTransporter = () => {
  // For development, we'll use a simple SMTP configuration
  // In production, you'd use SendGrid, AWS SES, or similar
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SMTP_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_SMTP_PASS || 'your-app-password',
    },
  })
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Check if email notifications are enabled
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
      console.log('📧 EMAIL NOTIFICATIONS DISABLED - Email would be sent to:', to)
      return { success: true, messageId: 'disabled-' + Date.now() }
    }

    // For development, also log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 EMAIL NOTIFICATION:')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Content:', text || html)
      console.log('---')
    }

    const transporter = createTransporter()
    
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Hexade Portal'}" <${process.env.EMAIL_FROM || 'noreply@hexade.com'}>`,
      to,
      subject,
      html,
      text,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string, role: string) => ({
    subject: 'Welcome to Hexade Portal!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a8a;">Welcome to Hexade Portal!</h1>
        <p>Hello ${name},</p>
        <p>Welcome to Hexade Portal! Your account has been successfully created as a <strong>${role}</strong>.</p>
        <p>You can now access your dashboard and start managing your legal cases.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Dashboard
          </a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Hexade Team</p>
      </div>
    `,
    text: `Welcome to Hexade Portal! Hello ${name}, Welcome to Hexade Portal! Your account has been successfully created as a ${role}. You can now access your dashboard and start managing your legal cases. Access your dashboard at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  }),

  caseCreated: (caseTitle: string, caseId: string, clientName: string) => ({
    subject: `New Case Created: ${caseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a8a;">New Case Created</h1>
        <p>Hello,</p>
        <p>A new case has been created:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${caseTitle}</h3>
          <p style="margin: 5px 0;"><strong>Case ID:</strong> ${caseId}</p>
          <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cases" 
             style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Case
          </a>
        </div>
        <p>Best regards,<br>The Hexade Team</p>
      </div>
    `,
    text: `New Case Created: ${caseTitle}. Case ID: ${caseId}, Client: ${clientName}. View at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cases`
  }),

  hearingScheduled: (hearingTitle: string, scheduledDate: string, participants: string[]) => ({
    subject: `Hearing Scheduled: ${hearingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a8a;">Hearing Scheduled</h1>
        <p>Hello,</p>
        <p>A hearing has been scheduled:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${hearingTitle}</h3>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${scheduledDate}</p>
          <p style="margin: 5px 0;"><strong>Participants:</strong> ${participants.join(', ')}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hearings" 
             style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Hearing
          </a>
        </div>
        <p>Best regards,<br>The Hexade Team</p>
      </div>
    `,
    text: `Hearing Scheduled: ${hearingTitle}. Date: ${scheduledDate}, Participants: ${participants.join(', ')}. View at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hearings`
  }),

  messageReceived: (senderName: string, messagePreview: string) => ({
    subject: `New Message from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a8a;">New Message Received</h1>
        <p>Hello,</p>
        <p>You have received a new message from <strong>${senderName}</strong>:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;">"${messagePreview}"</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages" 
             style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Message
          </a>
        </div>
        <p>Best regards,<br>The Hexade Team</p>
      </div>
    `,
    text: `New Message from ${senderName}: "${messagePreview}". View at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`
  }),

  autoReply: (clientName: string, lawyerName: string, caseInfo: string) => ({
    subject: `Auto-Reply from ${lawyerName} - Case Information`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a8a;">🤖 Auto-Reply from Your Lawyer</h1>
        <p>Hello <strong>${clientName}</strong>,</p>
        <p>You have received an automated response from <strong>${lawyerName}</strong> with comprehensive information about your case:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
          <div style="white-space: pre-line; font-family: monospace; font-size: 14px; line-height: 1.6;">
            ${caseInfo.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages" 
             style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Conversation
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated response. For urgent matters, please contact your lawyer directly.
        </p>
        <p>Best regards,<br>${lawyerName}<br>Your Legal Advocate</p>
      </div>
    `,
    text: `Auto-Reply from ${lawyerName} for ${clientName}:\n\n${caseInfo}\n\nView full conversation at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`
  })
}

// Notification service
export class NotificationService {
  static async sendWelcomeEmail(user: { email: string; name: string; role: string }) {
    const template = emailTemplates.welcome(user.name, user.role)
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  static async sendCaseCreatedNotification(caseData: { title: string; id: string; clientName: string }, recipients: string[]) {
    const template = emailTemplates.caseCreated(caseData.title, caseData.id, caseData.clientName)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendEmail({
        to: recipient,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
      results.push({ recipient, result })
    }
    
    return results
  }

  static async sendHearingScheduledNotification(hearingData: { title: string; scheduledDate: string; participants: string[] }, recipients: string[]) {
    const template = emailTemplates.hearingScheduled(hearingData.title, hearingData.scheduledDate, hearingData.participants)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendEmail({
        to: recipient,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
      results.push({ recipient, result })
    }
    
    return results
  }

  static async sendMessageNotification(messageData: { senderName: string; preview: string }, recipient: string) {
    const template = emailTemplates.messageReceived(messageData.senderName, messageData.preview)
    return await sendEmail({
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  static async sendAutoReplyEmail(clientName: string, lawyerName: string, caseInfo: string, clientEmail: string) {
    const template = emailTemplates.autoReply(clientName, lawyerName, caseInfo)
    return await sendEmail({
      to: clientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }
}

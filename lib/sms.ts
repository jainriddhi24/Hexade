import twilio from 'twilio'

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export interface SMSOptions {
  to: string
  message: string
  from?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS({ to, message, from }: SMSOptions): Promise<SMSResult> {
  try {
    // Check if SMS notifications are enabled
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      console.log('📱 SMS NOTIFICATIONS DISABLED - SMS would be sent to:', to)
      return { success: true, messageId: 'disabled-' + Date.now() }
    }

    // For development, also log the SMS
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS NOTIFICATION:')
      console.log('To:', to)
      console.log('Message:', message)
      console.log('---')
    }

    const result = await client.messages.create({
      body: message,
      from: from || process.env.TWILIO_PHONE_NUMBER,
      to: to
    })

    console.log('✅ SMS sent successfully:', result.sid)
    return { 
      success: true, 
      messageId: result.sid 
    }
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// SMS templates
export const smsTemplates = {
  welcome: (name: string) => ({
    message: `Welcome to Hexade Portal, ${name}! Your account has been created successfully. You can now access your legal case management dashboard.`
  }),

  caseCreated: (caseTitle: string, caseNumber: string) => ({
    message: `New case created: ${caseTitle} (${caseNumber}). You can view details in your dashboard.`
  }),

  hearingScheduled: (hearingTitle: string, scheduledDate: string) => ({
    message: `Hearing scheduled: ${hearingTitle} on ${scheduledDate}. Please join the video call on time.`
  }),

  hearingReminder: (hearingTitle: string, scheduledDate: string, timeLeft: string) => ({
    message: `Reminder: ${hearingTitle} is scheduled for ${scheduledDate}. ${timeLeft} remaining.`
  }),

  messageReceived: (senderName: string, preview: string) => ({
    message: `New message from ${senderName}: "${preview}". Check your dashboard for details.`
  }),

  paymentReceived: (amount: number, caseNumber?: string) => ({
    message: `Payment of $${amount} received${caseNumber ? ` for case ${caseNumber}` : ''}. Thank you!`
  }),

  documentSigned: (documentTitle: string, signerName: string) => ({
    message: `Document "${documentTitle}" has been signed by ${signerName}.`
  }),

  caseUpdate: (caseTitle: string, update: string) => ({
    message: `Case update: ${caseTitle} - ${update}. Check your dashboard for more details.`
  }),

  emergency: (message: string) => ({
    message: `URGENT: ${message} - Please check your Hexade Portal immediately.`
  })
}

// Notification service for SMS
export class SMSNotificationService {
  static async sendWelcomeSMS(user: { phone: string; name: string }) {
    if (!user.phone) {
      console.log('No phone number provided for SMS')
      return { success: false, error: 'No phone number' }
    }

    const template = smsTemplates.welcome(user.name)
    return await sendSMS({
      to: user.phone,
      message: template.message
    })
  }

  static async sendCaseCreatedSMS(caseData: { title: string; caseNumber: string }, recipients: string[]) {
    const template = smsTemplates.caseCreated(caseData.title, caseData.caseNumber)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendSMS({
        to: recipient,
        message: template.message
      })
      results.push({ recipient, result })
    }
    
    return results
  }

  static async sendHearingScheduledSMS(hearingData: { title: string; scheduledDate: string }, recipients: string[]) {
    const template = smsTemplates.hearingScheduled(hearingData.title, hearingData.scheduledDate)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendSMS({
        to: recipient,
        message: template.message
      })
      results.push({ recipient, result })
    }
    
    return results
  }

  static async sendHearingReminderSMS(hearingData: { title: string; scheduledDate: string; timeLeft: string }, recipients: string[]) {
    const template = smsTemplates.hearingReminder(hearingData.title, hearingData.scheduledDate, hearingData.timeLeft)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendSMS({
        to: recipient,
        message: template.message
      })
      results.push({ recipient, result })
    }
    
    return results
  }

  static async sendMessageNotificationSMS(messageData: { senderName: string; preview: string }, recipient: string) {
    const template = smsTemplates.messageReceived(messageData.senderName, messageData.preview)
    return await sendSMS({
      to: recipient,
      message: template.message
    })
  }

  static async sendPaymentReceivedSMS(amount: number, caseNumber: string, recipient: string) {
    const template = smsTemplates.paymentReceived(amount, caseNumber)
    return await sendSMS({
      to: recipient,
      message: template.message
    })
  }

  static async sendDocumentSignedSMS(documentTitle: string, signerName: string, recipient: string) {
    const template = smsTemplates.documentSigned(documentTitle, signerName)
    return await sendSMS({
      to: recipient,
      message: template.message
    })
  }

  static async sendCaseUpdateSMS(caseTitle: string, update: string, recipient: string) {
    const template = smsTemplates.caseUpdate(caseTitle, update)
    return await sendSMS({
      to: recipient,
      message: template.message
    })
  }

  static async sendEmergencySMS(message: string, recipients: string[]) {
    const template = smsTemplates.emergency(message)
    
    const results = []
    for (const recipient of recipients) {
      const result = await sendSMS({
        to: recipient,
        message: template.message
      })
      results.push({ recipient, result })
    }
    
    return results
  }
}

// Bulk SMS sending
export async function sendBulkSMS(recipients: string[], message: string): Promise<SMSResult[]> {
  const results = []
  
  for (const recipient of recipients) {
    const result = await sendSMS({
      to: recipient,
      message: message
    })
    results.push(result)
  }
  
  return results
}

// SMS validation
export function validatePhoneNumber(phone: string): boolean {
  // Basic phone number validation (US format)
  const phoneRegex = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export function formatPhoneNumber(phone: string): string {
  // Format phone number to E.164 format
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  return phone
}

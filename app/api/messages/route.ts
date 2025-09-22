import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NotificationService } from '@/lib/email'

// Enhanced auto-reply system for client messages
async function generateAutoReply(hearingId: string, clientMessage: string, clientName: string) {
  try {
    // Get comprehensive hearing and case details
    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: {
          include: {
            assignedLawyer: {
              select: { 
                id: true, 
                name: true, 
                email: true,
                phone: true,
                bio: true
              }
            },
            client: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        judge: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!hearing || !hearing.case.assignedLawyer) {
      return
    }

    const lawyer = hearing.case.assignedLawyer
    const caseData = hearing.case
    const lawyerId = lawyer.id

    // Generate comprehensive auto-reply with all case information
    let autoReplyContent = await generateComprehensiveReply(
      clientMessage, 
      clientName, 
      lawyer, 
      caseData, 
      hearing
    )

    // Create auto-reply message
    await prisma.message.create({
      data: {
        senderId: lawyerId,
        hearingId,
        content: autoReplyContent,
        messageType: 'text'
      }
    })

    // Send email notification with comprehensive case information
    try {
      await NotificationService.sendAutoReplyEmail(
        clientName,
        lawyer.name,
        autoReplyContent,
        caseData.client.email
      )
      console.log(`Auto-reply email sent to ${caseData.client.email}`)
    } catch (emailError) {
      console.error('Failed to send auto-reply email:', emailError)
      // Don't fail the auto-reply if email fails
    }

    console.log(`Enhanced auto-reply sent to client ${clientName} from lawyer ${lawyer.name}`)
  } catch (error) {
    console.error('Auto-reply error:', error)
  }
}

// Generate comprehensive auto-reply with all case information
async function generateComprehensiveReply(
  clientMessage: string, 
  clientName: string, 
  lawyer: any, 
  caseData: any, 
  hearing: any
): Promise<string> {
  const message = clientMessage.toLowerCase()
  
  // Get additional case information
  const caseDocuments = await prisma.document.findMany({
    where: { caseId: caseData.id },
    select: { id: true, title: true, type: true, createdAt: true }
  })

  const upcomingHearings = await prisma.hearing.findMany({
    where: { 
      caseId: caseData.id,
      scheduledAt: { gte: new Date() }
    },
    orderBy: { scheduledAt: 'asc' },
    take: 3
  })

  // Format hearing date
  const hearingDate = hearing.scheduledAt ? new Date(hearing.scheduledAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'To be scheduled'

  // Base response with comprehensive information
  let response = `Namaste ${clientName}! 🙏\n\n`
  response += `I'm ${lawyer.name}, your assigned lawyer for this case. I've received your message and I'm here to help you with all your legal needs.\n\n`
  
  // Case Information Section
  response += `📋 **CASE INFORMATION:**\n`
  response += `• Case Number: ${caseData.caseNumber || 'N/A'}\n`
  response += `• Case Title: ${caseData.title}\n`
  response += `• Case Status: ${caseData.status || 'Active'}\n`
  response += `• Filed Date: ${caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('en-IN') : 'N/A'}\n\n`

  // Hearing Information
  response += `⚖️ **HEARING DETAILS:**\n`
  response += `• Next Hearing: ${hearingDate}\n`
  response += `• Hearing ID: ${hearing.id}\n`
  if (hearing.judge) {
    response += `• Presiding Judge: ${hearing.judge.name}\n`
  }
  response += `• Hearing Type: ${hearing.type || 'Regular'}\n\n`

  // Lawyer Contact Information
  response += `👨‍💼 **YOUR LAWYER CONTACT:**\n`
  response += `• Name: ${lawyer.name}\n`
  response += `• Email: ${lawyer.email}\n`
  if (lawyer.phone) {
    response += `• Phone: ${lawyer.phone}\n`
  }
  if (lawyer.bio) {
    response += `• Specialization: ${lawyer.bio}\n`
  }
  response += `\n`

  // Upcoming Hearings
  if (upcomingHearings.length > 0) {
    response += `📅 **UPCOMING HEARINGS:**\n`
    upcomingHearings.forEach((h, index) => {
      const date = new Date(h.scheduledAt).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      response += `${index + 1}. ${date} - ${h.type || 'Hearing'}\n`
    })
    response += `\n`
  }

  // Available Documents
  if (caseDocuments.length > 0) {
    response += `📄 **AVAILABLE DOCUMENTS:**\n`
    caseDocuments.slice(0, 5).forEach((doc, index) => {
      const date = new Date(doc.createdAt).toLocaleDateString('en-IN')
      response += `${index + 1}. ${doc.title} (${doc.type}) - ${date}\n`
    })
    if (caseDocuments.length > 5) {
      response += `... and ${caseDocuments.length - 5} more documents\n`
    }
    response += `\n`
  }

  // Intelligent response based on message content
  if (message.includes('hello') || message.includes('hi') || message.includes('namaste')) {
    response += `Thank you for reaching out! I'm here to assist you with your case. Please feel free to ask me any questions about your case status, upcoming hearings, or any legal concerns you may have.\n\n`
  } else if (message.includes('status') || message.includes('update') || message.includes('progress')) {
    response += `I'm currently reviewing the latest updates on your case. I'll provide you with a detailed status report within the next 24 hours. Your case is being handled with the utmost priority.\n\n`
  } else if (message.includes('document') || message.includes('file') || message.includes('paper')) {
    response += `I've received your request for documents. I'm gathering all the necessary paperwork and will share the relevant documents with you shortly. Please check your email for updates.\n\n`
  } else if (message.includes('hearing') || message.includes('court') || message.includes('date')) {
    response += `I'm currently coordinating with the court regarding your hearing. All details including date, time, and location will be confirmed and shared with you soon.\n\n`
  } else if (message.includes('payment') || message.includes('bill') || message.includes('fee') || message.includes('cost')) {
    response += `I've received your billing inquiry. I'm reviewing your account and will provide a detailed breakdown of all charges and payment options within 24 hours.\n\n`
  } else if (message.includes('urgent') || message.includes('emergency') || message.includes('asap')) {
    response += `I understand this is urgent. I'm prioritizing your request and will address this matter immediately. Please expect a response within the next few hours.\n\n`
  } else {
    response += `I'm currently reviewing your inquiry and will provide a comprehensive response shortly. Your case is important to me, and I'll ensure all your concerns are addressed promptly.\n\n`
  }

  // Additional helpful information
  response += `💡 **QUICK ACTIONS YOU CAN TAKE:**\n`
  response += `• View all case documents in the Documents section\n`
  response += `• Check your hearing schedule in the Calendar\n`
  response += `• Update your contact information in Settings\n`
  response += `• Download the mobile app for notifications\n\n`

  // Emergency contact
  response += `🚨 **EMERGENCY CONTACT:**\n`
  response += `If you have an urgent legal matter that cannot wait, please call our emergency line at +91-XXX-XXXX-XXXX or email emergency@hexade.com\n\n`

  // Closing
  response += `I'm committed to providing you with the best legal representation. Please don't hesitate to reach out if you have any questions or concerns.\n\n`
  response += `Best regards,\n${lawyer.name}\nYour Legal Advocate`

  return response
}

const createMessageSchema = z.object({
  hearingId: z.string().min(1, 'Hearing ID is required'),
  content: z.string().min(1, 'Message content is required'),
  messageType: z.string().default('text'),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hearingId = searchParams.get('hearingId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause - only show messages from hearings the user has access to
    let whereClause: any = {}

    if (hearingId) {
      // Check if user has access to this hearing
      const hearing = await prisma.hearing.findUnique({
        where: { id: hearingId },
        include: {
          case: {
            select: { clientId: true, assignedLawyerId: true }
          }
        }
      })

      if (!hearing) {
        return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
      }

      // Check permissions
      const hasAccess = 
        hearing.case.clientId === user.id || 
        hearing.case.assignedLawyerId === user.id || 
        hearing.judgeId === user.id ||
        user.role === 'ADMIN'

      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      whereClause.hearingId = hearingId
    } else {
      // Get all hearings the user has access to
      const userHearings = await prisma.hearing.findMany({
        where: {
          OR: [
            { case: { clientId: user.id } },
            { case: { assignedLawyerId: user.id } },
            { judgeId: user.id },
            ...(user.role === 'ADMIN' ? [{}] : [])
          ]
        },
        select: { id: true }
      })

      whereClause.hearingId = {
        in: userHearings.map(h => h.id)
      }
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true }
          },
          hearing: {
            select: { 
              id: true, 
              scheduledAt: true,
              case: {
                select: { id: true, title: true, caseNumber: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where: whereClause })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hearingId, content, messageType } = createMessageSchema.parse(body)

    // Check if hearing exists and user has access
    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: {
          select: { clientId: true, assignedLawyerId: true }
        }
      }
    })

    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }

    // Check permissions
    const hasAccess = 
      hearing.case.clientId === user.id || 
      hearing.case.assignedLawyerId === user.id || 
      hearing.judgeId === user.id ||
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        senderId: user.id,
        hearingId,
        content,
        messageType
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true }
        },
        hearing: {
          select: { 
            id: true, 
            scheduledAt: true,
            case: {
              select: { id: true, title: true, caseNumber: true }
            }
          }
        }
      }
    })

    // Auto-reply system for client messages
    if (user.role === 'CLIENT') {
      await generateAutoReply(hearingId, content, user.name)
    }

    // Send notification email to other participants in the hearing
    try {
      const hearingParticipants = await prisma.hearing.findUnique({
        where: { id: hearingId },
        include: {
          case: {
            include: {
              client: { select: { email: true } },
              assignedLawyer: { select: { email: true } }
            }
          },
          judge: { select: { email: true } }
        }
      })

      if (hearingParticipants) {
        const recipients = []
        if (hearingParticipants.case.client.email !== user.email) {
          recipients.push(hearingParticipants.case.client.email)
        }
        if (hearingParticipants.case.assignedLawyer?.email && hearingParticipants.case.assignedLawyer.email !== user.email) {
          recipients.push(hearingParticipants.case.assignedLawyer.email)
        }
        if (hearingParticipants.judge?.email && hearingParticipants.judge.email !== user.email) {
          recipients.push(hearingParticipants.judge.email)
        }

        if (recipients.length > 0) {
          // Send notification to each recipient
          for (const recipient of recipients) {
            await NotificationService.sendMessageNotification(
              {
                senderName: user.name,
                preview: content.length > 100 ? content.substring(0, 100) + '...' : content
              },
              recipient
            )
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message notification:', error)
      // Don't fail message creation if notification fails
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Create message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

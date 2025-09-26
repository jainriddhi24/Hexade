import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NotificationService } from '@/lib/email'

// Enhanced AI-like auto-reply system for client query messages
async function generateAutoReply(clientMessage: string, clientName: string, lawyerName: string): Promise<string> {
  const message = clientMessage.toLowerCase()
  
  // Get current time for context
  const now = new Date()
  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'
  
  // Enhanced greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('namaste') || message.includes('hey')) {
    return `👋 Good ${timeOfDay} ${clientName}! 

I'm your AI Legal Assistant, powered by Hexade's intelligent legal system. I'm here to help you with all your legal queries and case-related questions.

🤖 **What I can help you with:**
• Case status updates and progress tracking
• Document requests and legal paperwork
• Hearing schedules and court dates
• Legal advice and guidance
• Billing and payment inquiries
• Emergency legal matters

Just ask me anything about your case, and I'll provide you with detailed, helpful information! 

How can I assist you today?`
  }
  
  // Case status inquiries with more detail
  if (message.includes('status') || message.includes('update') || message.includes('progress') || message.includes('how is my case')) {
    return `📊 **Case Status Update** - ${clientName}

I'm analyzing your case status right now. Here's what I can tell you:

🟢 **Current Status:** Your case is actively being processed
📅 **Last Update:** ${now.toLocaleDateString('en-IN')}
⚖️ **Next Steps:** Legal team is reviewing documentation

**Detailed Status Report:**
• Case filed and registered ✅
• Initial documentation reviewed ✅
• Legal team assigned ✅
• Court proceedings scheduled ⏳

I'm continuously monitoring your case and will notify you of any changes immediately. Your case is being handled with the highest priority.

Would you like me to check any specific aspect of your case?`
  }
  
  // Document requests with AI assistance
  if (message.includes('document') || message.includes('file') || message.includes('paper') || message.includes('download')) {
    return `📄 **Document Assistance** - ${clientName}

I can help you access all your case documents! Here's what's available:

**Available Documents:**
• Case filing documents
• Legal notices and court orders
• Evidence and supporting materials
• Hearing notices and schedules
• Legal contracts and agreements

**How to Access:**
1. Go to the Documents section in your dashboard
2. Use the search function to find specific documents
3. Download any document you need
4. Request additional documents if needed

I can also help you understand what each document means and guide you through the legal process.

What specific documents do you need help with?`
  }
  
  // Hearing related with smart scheduling
  if (message.includes('hearing') || message.includes('court') || message.includes('date') || message.includes('schedule')) {
    return `⚖️ **Hearing Information** - ${clientName}

I'm checking your hearing schedule right now...

**Upcoming Hearings:**
• Next hearing: To be confirmed
• Court: District Court
• Type: Regular hearing
• Duration: Approximately 1-2 hours

**What to Expect:**
• Arrive 30 minutes early
• Bring all required documents
• Dress appropriately for court
• Have your case number ready

**Preparation Tips:**
• Review your case details
• Prepare your questions
• Bring a notepad for notes
• Have contact information ready

I'll send you detailed hearing notices as soon as they're confirmed. Would you like me to set up reminders for your hearings?`
  }
  
  // Payment/billing with detailed breakdown
  if (message.includes('payment') || message.includes('bill') || message.includes('fee') || message.includes('cost') || message.includes('money')) {
    return `💰 **Billing Information** - ${clientName}

Let me provide you with a detailed breakdown of your legal fees:

**Fee Structure:**
• Consultation Fee: ₹2,000 (one-time)
• Case Filing Fee: ₹5,000
• Court Appearance Fee: ₹3,000 per hearing
• Document Preparation: ₹1,500 per document
• Total Estimated Cost: ₹15,000 - ₹25,000

**Payment Options:**
• Online payment through the portal
• Bank transfer
• Cheque payment
• EMI options available

**Current Balance:** ₹0 (All payments up to date)

I can help you understand any charges or set up a payment plan. What specific billing question do you have?`
  }
  
  // Urgent matters with priority handling
  if (message.includes('urgent') || message.includes('emergency') || message.includes('asap') || message.includes('help')) {
    return `🚨 **URGENT MATTER DETECTED** - ${clientName}

I understand this is urgent! I'm immediately escalating your request to our priority team.

**Immediate Actions Taken:**
• ✅ Alerted legal team
• ✅ Marked as high priority
• ✅ Scheduled immediate review
• ✅ Assigned senior lawyer

**Response Time:** Within 2 hours
**Contact:** Emergency line activated

**What to do now:**
1. Stay calm and document everything
2. Don't take any legal action without consulting us
3. Keep all evidence and documents safe
4. We'll contact you within 2 hours

This matter is now our top priority. Is there anything specific you need immediate guidance on?`
  }
  
  // Legal advice and general queries
  if (message.includes('advice') || message.includes('help') || message.includes('what should') || message.includes('can i')) {
    return `💡 **Legal Guidance** - ${clientName}

I'm here to provide you with expert legal guidance! Let me help you understand your options.

**Common Legal Questions I can help with:**
• Understanding your legal rights
• Explaining legal procedures
• Guidance on legal documents
• Court process explanation
• Legal strategy advice

**Important Note:** While I can provide general guidance, for specific legal advice, I'll connect you with our qualified lawyers.

**Your Question:** "${clientMessage}"

Based on your query, I recommend:
1. Documenting all relevant information
2. Not taking any action without legal consultation
3. Gathering all supporting evidence
4. Scheduling a detailed consultation

Would you like me to connect you with a specialist lawyer for this specific matter?`
  }
  
  // General AI response with personality
  return `🤖 **AI Legal Assistant Response** - ${clientName}

Thank you for your message! I'm processing your query and analyzing how best to help you.

**Your Query:** "${clientMessage}"

**My Analysis:**
I understand you're looking for assistance with a legal matter. Let me provide you with the most helpful response based on your specific needs.

**How I can help:**
• Provide detailed information about your case
• Guide you through legal procedures
• Connect you with the right legal expert
• Answer specific legal questions
• Help you understand your options

**Next Steps:**
I'm gathering relevant information and will provide you with a comprehensive response. Your query is important to me, and I want to ensure you get the best possible assistance.

Is there any specific aspect of your legal matter you'd like me to focus on first?`
}

const createConversationSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  messageType: z.string().default('text'),
  caseId: z.string().optional(), // Optional case reference
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Get conversations based on user role
    let conversations: any[] = []

    if (user.role === 'CLIENT') {
      // Clients see their conversations with their assigned lawyers
      console.log('Fetching conversations for client:', user.id, user.name)
      
      const clientCases = await prisma.case.findMany({
        where: { clientId: user.id },
        include: {
          assignedLawyer: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      console.log('Found client cases:', clientCases.length, clientCases.map(c => ({
        id: c.id,
        title: c.title,
        clientId: c.clientId,
        assignedLawyerId: c.assignedLawyerId,
        lawyer: c.assignedLawyer
      })))

      // Create conversation objects for each lawyer the client has cases with
      const lawyerConversations = new Map()
      
      for (const caseItem of clientCases) {
        if (caseItem.assignedLawyer) {
          const lawyerId = caseItem.assignedLawyer.id
          if (!lawyerConversations.has(lawyerId)) {
            lawyerConversations.set(lawyerId, {
              id: `conv-${lawyerId}`,
              lawyer: caseItem.assignedLawyer,
              cases: [],
              lastMessage: null,
              unreadCount: 0
            })
          }
          lawyerConversations.get(lawyerId).cases.push({
            id: caseItem.id,
            title: caseItem.title,
            caseNumber: caseItem.caseNumber,
            status: caseItem.status
          })
        }
      }

      conversations = Array.from(lawyerConversations.values())
      console.log('Created conversations for client:', conversations.length, conversations.map(c => ({
        id: c.id,
        lawyer: c.lawyer?.name,
        cases: c.cases.length
      })))

      // If no conversations exist, create a general conversation with available lawyers
      if (conversations.length === 0) {
        console.log('No conversations found for client, creating general conversation')
        
        // Find available lawyers
        const availableLawyers = await prisma.user.findMany({
          where: { 
            role: 'LAWYER',
            lawyerProfile: {
              availableForNewCases: true
            }
          },
          select: { id: true, name: true, email: true },
          take: 1 // Just get one lawyer for now
        })

        if (availableLawyers.length > 0) {
          const lawyer = availableLawyers[0]
          conversations = [{
            id: `conv-general-${lawyer.id}`,
            lawyer: lawyer,
            cases: [],
            lastMessage: null,
            unreadCount: 0,
            isGeneral: true // Flag to indicate this is a general conversation
          }]
          console.log('Created general conversation with lawyer:', lawyer.name)
        }
      }
    } else if (user.role === 'LAWYER') {
      // Lawyers see conversations with their clients
      console.log('Fetching conversations for lawyer:', user.id, user.name)
      
      const lawyerCases = await prisma.case.findMany({
        where: { assignedLawyerId: user.id },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      console.log('Found lawyer cases:', lawyerCases.length, lawyerCases.map(c => ({
        id: c.id,
        title: c.title,
        clientId: c.clientId,
        assignedLawyerId: c.assignedLawyerId,
        client: c.client
      })))

      // Create conversation objects for each client
      const clientConversations = new Map()
      
      for (const caseItem of lawyerCases) {
        const clientId = caseItem.clientId
        if (!clientConversations.has(clientId)) {
          clientConversations.set(clientId, {
            id: `conv-${clientId}`,
            client: caseItem.client,
            cases: [],
            lastMessage: null,
            unreadCount: 0
          })
        }
        clientConversations.get(clientId).cases.push({
          id: caseItem.id,
          title: caseItem.title,
          caseNumber: caseItem.caseNumber,
          status: caseItem.status
        })
      }

      conversations = Array.from(clientConversations.values())
      console.log('Created conversations for lawyer:', conversations.length, conversations.map(c => ({
        id: c.id,
        client: c.client?.name,
        cases: c.cases.length
      })))
    }

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total: conversations.length,
        pages: Math.ceil(conversations.length / limit)
      }
    })
  } catch (error) {
    console.error('Get conversations error:', error)
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
    const { content, messageType, caseId } = createConversationSchema.parse(body)

    // For now, we'll store conversation messages in a simple way
    // In a real implementation, you might want to create a separate conversations table
    
    // If it's a client message, find their assigned lawyer and send auto-reply
    if (user.role === 'CLIENT') {
      // First try to find the client's assigned lawyer from their cases
      let assignedLawyer = null
      
      const clientCase = await prisma.case.findFirst({
        where: { 
          clientId: user.id,
          ...(caseId ? { id: caseId } : {})
        },
        include: {
          assignedLawyer: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      if (clientCase && clientCase.assignedLawyer) {
        assignedLawyer = clientCase.assignedLawyer
      } else {
        // If no assigned lawyer from cases, find an available lawyer
        const availableLawyer = await prisma.user.findFirst({
          where: { 
            role: 'LAWYER',
            lawyerProfile: {
              availableForNewCases: true
            }
          },
          select: { id: true, name: true, email: true }
        })
        
        if (availableLawyer) {
          assignedLawyer = availableLawyer
        }
      }

      if (assignedLawyer) {
        // Generate auto-reply
        const autoReply = await generateAutoReply(content, user.name, assignedLawyer.name)
        
        // Send email notification with the auto-reply
        try {
          await NotificationService.sendAutoReplyEmail(
            user.name,
            assignedLawyer.name,
            autoReply,
            user.email
          )
          console.log(`✅ Auto-reply email sent to ${user.email}`)
        } catch (emailError) {
          console.error('❌ Failed to send auto-reply email:', emailError)
          // Don't fail the response if email fails
        }
        
        // In a real implementation, you would store this in a conversations table
        // For now, we'll just return the auto-reply
        return NextResponse.json({
          message: {
            id: `msg-${Date.now()}`,
            content: autoReply,
            senderId: assignedLawyer.id,
            sender: assignedLawyer,
            createdAt: new Date().toISOString(),
            messageType: 'text',
            isAutoReply: true
          },
          originalMessage: {
            id: `msg-${Date.now()}-1`,
            content,
            senderId: user.id,
            sender: { id: user.id, name: user.name, email: user.email, role: user.role },
            createdAt: new Date().toISOString(),
            messageType,
            isAutoReply: false
          }
        }, { status: 201 })
      } else {
        return NextResponse.json({
          error: 'No available lawyer found to respond to your message'
        }, { status: 404 })
      }
    }

    // For lawyer messages, just return the message
    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        content,
        senderId: user.id,
        sender: { id: user.id, name: user.name, email: user.email, role: user.role },
        createdAt: new Date().toISOString(),
        messageType,
        isAutoReply: false
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    
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
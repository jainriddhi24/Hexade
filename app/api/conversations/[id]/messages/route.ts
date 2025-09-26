import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // AI Legal Assistant welcome messages
    const now = new Date()
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'
    
    const sampleMessages = [
      {
        id: `conv-msg-${Date.now()}-1`,
        content: `👋 Good ${timeOfDay}! 

I'm your AI Legal Assistant, powered by Hexade's intelligent legal system. I'm here to help you with all your legal queries and case-related questions.

🤖 **What I can help you with:**
• Case status updates and progress tracking
• Document requests and legal paperwork  
• Hearing schedules and court dates
• Legal advice and guidance
• Billing and payment inquiries
• Emergency legal matters

Just ask me anything about your case, and I'll provide you with detailed, helpful information! 

How can I assist you today?`,
        senderId: 'ai-assistant',
        sender: { 
          id: 'ai-assistant', 
          name: 'AI Legal Assistant', 
          email: 'ai@hexade.com', 
          role: 'AI' 
        },
        createdAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        messageType: 'text'
      },
      {
        id: `conv-msg-${Date.now()}-2`,
        content: `💡 **Quick Tips for Better Assistance:**

• Be specific about your legal question
• Mention your case number if you have one
• Describe your situation clearly
• Ask about specific documents or procedures
• Use keywords like "status", "hearing", "document", "payment"

I'm designed to understand natural language, so feel free to ask in your own words. I'll provide comprehensive, helpful responses tailored to your needs!`,
        senderId: 'ai-assistant',
        sender: { 
          id: 'ai-assistant', 
          name: 'AI Legal Assistant', 
          email: 'ai@hexade.com', 
          role: 'AI' 
        },
        createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        messageType: 'text'
      }
    ]

    return NextResponse.json({
      messages: sampleMessages,
      pagination: {
        page: 1,
        limit: 50,
        total: sampleMessages.length,
        pages: 1
      }
    })
  } catch (error) {
    console.error('Get conversation messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

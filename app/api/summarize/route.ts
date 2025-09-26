import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// AI Provider abstraction
interface AIProvider {
  summarize(text: string): Promise<string>
}

class OpenAIProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async summarize(text: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document summarization assistant. Provide concise, accurate summaries of legal documents focusing on key facts, legal issues, and important details. Keep summaries under 200 words.',
          },
          {
            role: 'user',
            content: `Please summarize the following legal document:\n\n${text}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Unable to generate summary'
  }
}

class MockAIProvider implements AIProvider {
  async summarize(text: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summary = sentences.slice(0, 3).join('. ') + '.'
    
    return `[Mock Summary] ${summary}`
  }
}

const summarizeSchema = z.object({
  documentId: z.string().optional(),
  text: z.string().optional(),
  type: z.enum(['document', 'case', 'hearing']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.CLIENT, UserRole.LAWYER, UserRole.JUDGE, UserRole.ADMIN])(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const body = await request.json()
    const data = summarizeSchema.parse(body)

    let textToSummarize = ''
    let documentId = data.documentId

    // Get text to summarize
    if (data.text) {
      textToSummarize = data.text
    } else if (data.documentId) {
      // Fetch document from database
      const document = await prisma.document.findUnique({
        where: { id: data.documentId },
        include: {
          case: true,
        },
      })

      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      // Check access permissions
      if (user.role === UserRole.CLIENT && document.case.clientId !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      if (user.role === UserRole.LAWYER && document.case.assignedLawyerId !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      // Use extracted text if available, otherwise use title and description
      textToSummarize = document.extractedText || `${document.title}\n\n${document.description || ''}`
    } else {
      return NextResponse.json(
        { error: 'Either documentId or text is required' },
        { status: 400 }
      )
    }

    if (!textToSummarize.trim()) {
      return NextResponse.json(
        { error: 'No text content to summarize' },
        { status: 400 }
      )
    }

    // Initialize AI provider
    const aiProvider = process.env.AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY
      ? new OpenAIProvider(process.env.OPENAI_API_KEY)
      : new MockAIProvider()

    // Generate summary
    const summary = await aiProvider.summarize(textToSummarize)

    // Save summary to database if documentId is provided
    if (documentId) {
      await prisma.document.update({
        where: { id: documentId },
        data: { summary },
      })
    }

    return NextResponse.json({
      summary,
      documentId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    
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

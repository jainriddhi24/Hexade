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

    const hearingId = params.id

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: {
        case: {
          include: {
            client: { select: { id: true, name: true, email: true } },
            assignedLawyer: { select: { id: true, name: true, email: true } }
          }
        },
        judge: { select: { id: true, name: true, email: true } }
      }
    })

    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }

    // Check if user has access to this hearing
    const hasAccess = 
      hearing.case.clientId === user.id || 
      hearing.case.assignedLawyerId === user.id || 
      hearing.judgeId === user.id ||
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // For demo purposes, generate a mock recording URL if none exists
    let recordingUrl = hearing.recordingUrl
    if (!recordingUrl && hearing.status === 'COMPLETED') {
      // Generate a mock recording URL for demonstration
      recordingUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`
      
      // Update the hearing with the mock recording URL
      await prisma.hearing.update({
        where: { id: hearingId },
        data: { 
          recordingUrl,
          transcriptUrl: `https://example.com/transcripts/${hearingId}.txt`,
          summary: `This is a mock summary for the hearing of case ${hearing.case.caseNumber}. The hearing was completed on ${hearing.scheduledAt.toLocaleDateString()}.`
        }
      })
    }

    return NextResponse.json({
      ...hearing,
      recordingUrl
    })
  } catch (error) {
    console.error('Get hearing recording error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

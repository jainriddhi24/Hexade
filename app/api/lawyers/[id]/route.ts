import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    if (!lawyer.publicProfile) {
      return NextResponse.json(
        { error: 'Profile not available' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: lawyer.id,
      userId: lawyer.userId,
      name: lawyer.user.name,
      email: lawyer.user.email,
      avatar: lawyer.user.avatar,
      bio: lawyer.user.bio,
      phone: lawyer.user.phone,
      barNumber: lawyer.barNumber,
      practiceAreas: lawyer.practiceAreas,
      districts: lawyer.districts,
      experienceYears: lawyer.experienceYears,
      rating: lawyer.rating,
      verified: lawyer.verified,
      consultationFee: lawyer.consultationFee,
      languages: lawyer.languages,
      availableForNewCases: lawyer.availableForNewCases,
      createdAt: lawyer.user.createdAt,
    })
  } catch (error) {
    console.error('Error fetching lawyer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

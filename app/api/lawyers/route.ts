import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().nullable().optional(),
  practiceArea: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  verified: z.string().nullable().optional(),
  available: z.string().nullable().optional(),
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
}).catchall(z.any())

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      search: searchParams.get('search') || undefined,
      practiceArea: searchParams.get('practiceArea') || undefined,
      district: searchParams.get('district') || undefined,
      verified: searchParams.get('verified') || undefined,
      available: searchParams.get('available') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    })

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user: {
        role: 'LAWYER',
      },
      publicProfile: true,
    }

    if (query.search) {
      where.OR = [
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { practiceAreas: { has: query.search } },
        { districts: { has: query.search } },
      ]
    }

    if (query.practiceArea) {
      where.practiceAreas = { has: query.practiceArea }
    }

    if (query.district) {
      where.districts = { has: query.district }
    }

    if (query.verified === 'true') {
      where.verified = true
    }

    if (query.available === 'true') {
      where.availableForNewCases = true
    }

    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where,
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
        orderBy: [
          { verified: 'desc' },
          { rating: 'desc' },
          { experienceYears: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.lawyerProfile.count({ where }),
    ])

    return NextResponse.json({
      lawyers: lawyers.map(lawyer => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

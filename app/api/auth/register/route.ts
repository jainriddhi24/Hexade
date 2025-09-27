import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'
import { NotificationService } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['CLIENT', 'LAWYER', 'JUDGE']),
  phone: z.string().optional(),
  // Lawyer fields
  barNumber: z.string().optional(),
  practiceAreas: z.string().optional(),
  districts: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  consultationFee: z.coerce.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
  const { email, password, name, role, phone, barNumber, practiceAreas, districts, experienceYears, rating, consultationFee } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)


    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        phone,
        emailVerifiedAt: new Date(),
        ...(role === 'LAWYER' && {
          lawyerProfile: {
            create: {
              barNumber,
              practiceAreas,
              districts,
              experienceYears: Number(experienceYears),
              rating: Number(rating),
              consultationFee: Number(consultationFee),
            },
          },
        }),
      }
    });

    // Send welcome email
    const { sendEmail, emailTemplates } = await import('@/lib/email');
    await sendEmail({
      to: user.email,
      ...emailTemplates.welcome(user.name, user.role)
    });

    // Generate JWT token
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with secure cookie
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )

    // Set secure cookie
  setAuthCookie(response, jwtToken)


    return response
  } catch (error) {
    console.error('Registration error:', error)
    
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

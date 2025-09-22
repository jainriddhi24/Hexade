import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only lawyers can access client management
    if (user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Fetching clients for lawyer:', user.id, user.name)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause - show clients that this lawyer has cases with OR all clients
    // For now, let's show all clients to make it easier to manage
    let whereClause: any = {
      role: 'CLIENT'
    }

    if (search) {
      whereClause.AND = [
        { role: 'CLIENT' },
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2))

    // First, let's try a simple query without case filtering
    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          company: true,
          notes: true,
          createdAt: true
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count({ 
        where: whereClause
      })
    ])

    console.log('Found clients:', clients.length, 'Total:', total)

    // Calculate additional client metrics - simplified for now
    const clientsWithMetrics = await Promise.all(
      clients.map(async (client) => {
        try {
          const totalBilling = await prisma.case.aggregate({
            where: {
              clientId: client.id,
              assignedLawyerId: user.id
            },
            _sum: {
              estimatedValue: true
            }
          })

          const totalCases = await prisma.case.count({
            where: {
              clientId: client.id,
              assignedLawyerId: user.id
            }
          })

          const activeCases = await prisma.case.count({
            where: {
              clientId: client.id,
              assignedLawyerId: user.id,
              status: {
                in: ['FILED', 'ASSIGNED', 'IN_PROGRESS', 'HEARING_SCHEDULED']
              }
            }
          })

          return {
            ...client,
            totalBilling: totalBilling._sum.estimatedValue || 0,
            activeCases,
            totalCases
          }
        } catch (error) {
          console.error(`Error calculating metrics for client ${client.id}:`, error)
          return {
            ...client,
            totalBilling: 0,
            activeCases: 0,
            totalCases: 0
          }
        }
      })
    )

    return NextResponse.json({
      clients: clientsWithMetrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Only lawyers can create client records
    if (user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Received client creation request:', body)
    
    const { name, email, phone, address, company, notes } = createClientSchema.parse(body)
    console.log('Parsed client data:', { name, email, phone, address, company, notes })

    // Check if user with this email already exists
    console.log('Checking if user exists with email:', email)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User exists, updating information')
      // If user exists, just update their information
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          phone,
          address,
          company,
          notes
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          company: true,
          notes: true,
          createdAt: true
        }
      })

      console.log('User updated successfully:', updatedUser)
      return NextResponse.json(updatedUser, { status: 200 })
    }

    // Create new client user
    console.log('Creating new user')
    const tempPassword = 'temp-password-' + Date.now()
    console.log('Hashing password...')
    const hashedPassword = await hashPassword(tempPassword)
    console.log('Password hashed successfully')
    
    console.log('Creating user in database with data:', {
      name,
      email,
      phone,
      address,
      company,
      notes,
      role: 'CLIENT',
      emailVerified: true,
      passwordHash: '[HIDDEN]'
    })
    
    const newClient = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        notes,
        role: 'CLIENT',
        emailVerified: true, // Auto-verify for lawyer-created clients
        passwordHash: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        company: true,
        notes: true,
        createdAt: true
      }
    })

    console.log('User created successfully:', newClient)
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Create client error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

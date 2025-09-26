import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required')
})

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { password } = deleteAccountSchema.parse(body)

    // Verify password before deletion
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
  select: { id: true, passwordHash: true, role: true }
    })

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify password
  const isPasswordValid = await bcrypt.compare(password, userWithPassword.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    // Only allow clients to delete their own accounts
    if (!['CLIENT', 'JUDGE', 'LAWYER'].includes(userWithPassword.role)) {
      return NextResponse.json({ 
        error: 'Only clients, judges, or lawyers can delete their accounts' 
      }, { status: 403 })
    }

    // Delete user and all related data
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete cases where user is assigned lawyer
      await tx.case.deleteMany({
        where: { assignedLawyerId: user.id }
      })
      // Delete lawyer profile if exists
      await tx.lawyerProfile.deleteMany({
        where: { userId: user.id }
      })

      // Delete user's signed documents
      await tx.document.deleteMany({
        where: { signedById: user.id }
      })

      // Delete user's uploaded documents
      await tx.document.deleteMany({
        where: { uploadedById: user.id }
      })
      // Delete user's cases
      await tx.case.deleteMany({
        where: { clientId: user.id }
      })

      // Delete user's hearings
      await tx.hearing.deleteMany({
        where: { 
          OR: [
            { case: { clientId: user.id } },
            { judgeId: user.id }
          ]
        }
      })

      // Delete user's messages
      await tx.message.deleteMany({
        where: { senderId: user.id }
      })


      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    // Clear the session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Delete account error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

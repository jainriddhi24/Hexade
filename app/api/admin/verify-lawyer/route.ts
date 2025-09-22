import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lawyerUserId } = await request.json();
    if (!lawyerUserId) {
      return NextResponse.json({ error: 'Lawyer user ID required' }, { status: 400 });
    }

    const updated = await prisma.lawyerProfile.update({
      where: { userId: lawyerUserId },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Verify lawyer error:', error);
    return NextResponse.json({ error: 'Failed to verify lawyer' }, { status: 500 });
  }
}

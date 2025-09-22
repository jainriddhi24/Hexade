import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all lawyers with verified: false, select only needed fields
    const lawyers = await prisma.lawyerProfile.findMany({
      where: { verified: false },
      select: {
        userId: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Map to expected format
    const result = lawyers.map((lawyer: any) => ({
      userId: lawyer.userId,
      name: lawyer.user.name,
      email: lawyer.user.email,
    }));

    return NextResponse.json({ lawyers: result });
  } catch (error) {
    console.error('Fetch unverified lawyers error:', error);
    return NextResponse.json({ error: 'Failed to fetch lawyers' }, { status: 500 });
  }
}

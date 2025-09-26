import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, paymentType } = await request.json();
    if (!caseId || !paymentType) {
      return NextResponse.json({ error: 'caseId and paymentType are required' }, { status: 400 });
    }

    // Check for existing completed/paid payment for this case/service/user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        caseId,
        paymentType,
        clientId: user.role === 'CLIENT' ? user.id : undefined,
        lawyerId: user.role === 'LAWYER' ? user.id : undefined,
        judgeId: user.role === 'JUDGE' ? user.id : undefined,
        status: { in: ['paid', 'completed'] },
      },
    });

    if (existingPayment) {
      return NextResponse.json({
        success: false,
        message: 'You have already paid for this service.',
        payment: existingPayment,
      });
    }

    // If not found, create new payment (add other fields as needed)
    // ...existing code to create payment...
    return NextResponse.json({ success: true, message: 'No previous payment found. You can proceed.' });
  } catch (error) {
    console.error('Create/check payment error:', error);
    return NextResponse.json({ error: 'Failed to check or create payment' }, { status: 500 });
  }
}

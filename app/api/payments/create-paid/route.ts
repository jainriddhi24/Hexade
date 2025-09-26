import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, paymentType, transactionId, caseId } = await request.json();
    if (!amount || !paymentType) {
      return NextResponse.json({ error: 'Amount and paymentType are required' }, { status: 400 });
    }

  const payment = await prisma.payment.create({
      data: {
        amount,
        description,
        paymentType,
        status: 'paid',
        transactionId,
        clientId: user.role === 'CLIENT' ? user.id : undefined,
        lawyerId: user.role === 'LAWYER' ? user.id : undefined,
        judgeId: user.role === 'JUDGE' ? user.id : undefined,
        caseId,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Create paid payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

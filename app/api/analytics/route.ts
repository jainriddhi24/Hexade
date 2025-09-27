import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { DocumentScalarFieldEnum } from '@prisma/client'
import { z } from 'zod'

const analyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  type: z.enum(['overview', 'cases', 'hearings', 'documents', 'payments', 'users']).optional().default('overview'),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const type = searchParams.get('type') || 'overview'

    analyticsSchema.parse({ period, type })

    const now = new Date()
    const startDate = getStartDate(period, now)

    const caseWhere = user.role === 'CLIENT'
      ? { clientId: user.id }
      : user.role === 'LAWYER'
      ? { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] }
      : {}

    const hearingWhere = user.role === 'CLIENT'
      ? { case: { clientId: user.id } }
      : user.role === 'LAWYER'
      ? { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } }
      : {}

    const documentWhere = user.role === 'CLIENT'
      ? { case: { clientId: user.id } }
      : user.role === 'LAWYER'
      ? { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } }
      : {}

    const paymentWhere = user.role === 'CLIENT'
      ? { clientId: user.id }
      : user.role === 'LAWYER'
      ? { case: { OR: [{ clientId: user.id }, { assignedLawyerId: user.id }] } }
      : {}

    let analytics: any = {}

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(startDate, now, caseWhere, hearingWhere, documentWhere, paymentWhere)
        break
      case 'cases':
        analytics = await getCasesAnalytics(startDate, now, caseWhere)
        break
      case 'hearings':
        analytics = await getHearingsAnalytics(startDate, now, hearingWhere)
        break
      case 'documents':
        analytics = await getDocumentsAnalytics(startDate, now, documentWhere)
        break
      case 'payments':
        analytics = await getPaymentsAnalytics(startDate, now, paymentWhere)
        break
      case 'users':
        if (user.role === 'ADMIN' || user.role === 'LAWYER') {
          analytics = await getUsersAnalytics(startDate, now)
        } else {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
        break
    }

    return NextResponse.json({
      success: true,
      analytics,
      period,
      type,
      dateRange: { start: startDate, end: now },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function getStartDate(period: string, now: Date): Date {
  const start = new Date(now)
  switch (period) {
    case '7d': start.setDate(start.getDate() - 7); break
    case '30d': start.setDate(start.getDate() - 30); break
    case '90d': start.setDate(start.getDate() - 90); break
    case '1y': start.setFullYear(start.getFullYear() - 1); break
    case 'all': start.setFullYear(2020); break
  }
  return start
}

async function getOverviewAnalytics(startDate: Date, endDate: Date, caseWhere: any, hearingWhere: any, documentWhere: any, paymentWhere: any) {
  const [
    totalCases, activeCases, completedCases,
    totalHearings, upcomingHearings, completedHearings,
    totalDocuments, signedDocuments,
    totalPayments, completedPayments,
    totalRevenue, recentActivity
  ] = await Promise.all([
    prisma.case.count({ where: caseWhere }),
    prisma.case.count({ where: { ...caseWhere, status: 'ACTIVE' } }),
    prisma.case.count({ where: { ...caseWhere, status: 'COMPLETED' } }),
    prisma.hearing.count({ where: hearingWhere }),
    prisma.hearing.count({ where: { ...hearingWhere, status: 'SCHEDULED', scheduledAt: { gte: new Date() } } }),
    prisma.hearing.count({ where: { ...hearingWhere, status: 'COMPLETED' } }),
    prisma.document.count({ where: documentWhere }),
    prisma.document.count({ where: { ...documentWhere, isSigned: true } }),
    prisma.payment.count({ where: paymentWhere }),
    prisma.payment.count({ where: { ...paymentWhere, status: 'COMPLETED' } }),
    prisma.payment.aggregate({ where: { ...paymentWhere, status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.case.findMany({
      where: { ...caseWhere, updatedAt: { gte: startDate } },
      include: { client: { select: { name: true } }, assignedLawyer: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])

  return {
    summary: {
      cases: { total: totalCases, active: activeCases, completed: completedCases },
      hearings: { total: totalHearings, upcoming: upcomingHearings, completed: completedHearings },
      documents: { total: totalDocuments, signed: signedDocuments, unsigned: totalDocuments - signedDocuments },
      payments: { total: totalPayments, completed: completedPayments, revenue: totalRevenue._sum.amount || 0 },
    },
    recentActivity
  }
}

async function getCasesAnalytics(startDate: Date, endDate: Date, caseWhere: any) {
  const [casesByStatus, casesByMonth, casesByPriority, topClients] = await Promise.all([
    prisma.case.groupBy({ by: ['status'], where: { ...caseWhere, createdAt: { gte: startDate } }, _count: { id: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "Case"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      ${caseWhere.clientId ? `AND "clientId" = '${caseWhere.clientId}'` : ''}
      GROUP BY DATE_TRUNC('month', "createdAt") ORDER BY month
    `,
    prisma.case.groupBy({ by: ['priority'], where: { ...caseWhere, createdAt: { gte: startDate } }, _count: { id: true } }),
    prisma.case.groupBy({ by: ['clientId'], where: { ...caseWhere, createdAt: { gte: startDate } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
  ])
  return { casesByStatus, casesByMonth, casesByPriority, topClients }
}

async function getHearingsAnalytics(startDate: Date, endDate: Date, hearingWhere: any) {
  const [hearingsByStatus, hearingsByMonth, averageDuration] = await Promise.all([
    prisma.hearing.groupBy({ by: ['status'], where: { ...hearingWhere, scheduledAt: { gte: startDate } }, _count: { id: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "scheduledAt") as month, COUNT(*) as count
      FROM "Hearing"
      WHERE "scheduledAt" >= ${startDate} AND "scheduledAt" <= ${endDate}
      GROUP BY DATE_TRUNC('month', "scheduledAt") ORDER BY month
    `,
    prisma.hearing.aggregate({ where: { ...hearingWhere, status: 'COMPLETED' }, _avg: { duration: true } }),
  ])
  return { hearingsByStatus, hearingsByMonth, averageDuration: averageDuration._avg.duration || 0 }
}

async function getDocumentsAnalytics(startDate: Date, endDate: Date, documentWhere: any) {
  const [documentsByType, documentsByMonth, signedDocuments] = await Promise.all([
    prisma.document.groupBy({ by: ['fileType'] as DocumentScalarFieldEnum[], where: { ...documentWhere, createdAt: { gte: startDate } }, _count: { id: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "Document"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('month', "createdAt") ORDER BY month
    `,
    prisma.document.count({ where: { ...documentWhere, isSigned: true, createdAt: { gte: startDate } } }),
  ])
  return { documentsByType, documentsByMonth, signedDocuments }
}

async function getPaymentsAnalytics(startDate: Date, endDate: Date, paymentWhere: any) {
  const [paymentsByStatus, paymentsByMonth, totalRevenue, averagePayment] = await Promise.all([
    prisma.payment.groupBy({ by: ['status'], where: { ...paymentWhere, createdAt: { gte: startDate } }, _count: { id: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count, SUM(amount) as total
      FROM "Payment"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate} AND status = 'COMPLETED'
      GROUP BY DATE_TRUNC('month', "createdAt") ORDER BY month
    `,
    prisma.payment.aggregate({ where: { ...paymentWhere, status: 'COMPLETED', createdAt: { gte: startDate } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { ...paymentWhere, status: 'COMPLETED', createdAt: { gte: startDate } }, _avg: { amount: true } }),
  ])
  return { paymentsByStatus, paymentsByMonth, totalRevenue: totalRevenue._sum.amount || 0, averagePayment: averagePayment._avg.amount || 0 }
}

async function getUsersAnalytics(startDate: Date, endDate: Date) {
  const [usersByRole, usersByMonth, totalUsers] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], where: { createdAt: { gte: startDate } }, _count: { id: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('month', "createdAt") ORDER BY month
    `,
    prisma.user.count({ where: {} }),
  ])
  return { usersByRole, usersByMonth, activeUsers: totalUsers }
}
